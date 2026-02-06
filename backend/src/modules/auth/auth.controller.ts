
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../utils/prisma';

const ACCESS_SECRET = process.env.JWT_SECRET || 'dev-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret-dev';

// Helper: Generate Tokens
const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ id: userId, role }, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Helper: Access Logger
const logAccess = async (req: Request, userId: string | null, email: string, action: 'LOGIN_STUDENT' | 'LOGIN_ADMIN' | 'LOGOUT', status: 'SUCCESS' | 'FAILED', reason?: string) => {
    try {
        await prisma.accessLog.create({
            data: {
                userId,
                email,
                action,
                status,
                reason,
                ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
            }
        });
    } catch (e) { console.error("Log failed", e); }
};

// --- STUDENT LOGIN ---
export const loginStudent = async (req: Request, res: Response) => {
  const { identifier, password, captchaToken, rememberMe } = req.body;
  const ip = req.ip || 'unknown';

  try {
    // 1. Find User (Email or RegNo)
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier },
                { regNo: identifier }
            ]
        }
    });

    if (!user) {
        await logAccess(req, null, identifier, 'LOGIN_STUDENT', 'FAILED', 'User not found');
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Role Check
    if (user.role !== 'STUDENT') {
        await logAccess(req, user.id, identifier, 'LOGIN_STUDENT', 'FAILED', 'Role Mismatch');
        return res.status(403).json({ error: 'Access denied. Use Admin portal.' });
    }

    // 3. Verify Password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
        await logAccess(req, user.id, identifier, 'LOGIN_STUDENT', 'FAILED', 'Invalid Password');
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Generate Tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    const refreshDuration = rememberMe ? 30 : 7; 

    // 5. Create Session
    await prisma.session.create({
        data: {
            userId: user.id,
            refreshToken,
            expiresAt: new Date(Date.now() + refreshDuration * 24 * 60 * 60 * 1000),
            device: req.headers['user-agent'] || 'Unknown',
            ipAddress: ip
        }
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: refreshDuration * 24 * 60 * 60 * 1000
    });

    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    await logAccess(req, user.id, user.email, 'LOGIN_STUDENT', 'SUCCESS');

    res.json({ 
        token: accessToken, 
        user: { 
            id: user.id, 
            name: user.name, 
            role: user.role, 
            avatar: profile?.avatarUrl || user.avatar 
        } 
    });

  } catch (error) {
    console.error("Student Login Error", error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// --- ADMIN LOGIN ---
export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password, otp } = req.body; // OTP placeholder for future
    
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            await logAccess(req, null, email, 'LOGIN_ADMIN', 'FAILED', 'User not found');
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        // Strict Role Check
        if (user.role !== 'ADMIN' && user.role !== 'FACULTY' && user.role !== 'SECURITY') {
             await logAccess(req, user.id, email, 'LOGIN_ADMIN', 'FAILED', 'Unauthorized Role');
             return res.status(403).json({ error: 'Unauthorized. Not an administrator.' });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            await logAccess(req, user.id, email, 'LOGIN_ADMIN', 'FAILED', 'Invalid Password');
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        // Admin Session Logic (Shorter expiry for security)
        const { accessToken, refreshToken } = generateTokens(user.id, user.role);
        
        await prisma.session.create({
            data: {
                userId: user.id,
                refreshToken,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day max for admins
                device: req.headers['user-agent'] || 'Unknown Admin Console',
                ipAddress: req.ip || 'unknown'
            }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        const adminProfile = await prisma.adminProfile.findUnique({ where: { userId: user.id } });
        await logAccess(req, user.id, email, 'LOGIN_ADMIN', 'SUCCESS');

        res.json({ 
            token: accessToken, 
            user: { 
                id: user.id, 
                name: user.name, 
                role: user.role, 
                department: adminProfile?.department 
            } 
        });

    } catch (error) {
        console.error("Admin Login Error", error);
        res.status(500).json({ error: 'Admin authentication failed' });
    }
};

// --- COMMON AUTH ---

export const register = async (req: Request, res: Response) => {
  try {
    const { email, regNo, password, name, role } = req.body;
    
    // Simple prevention of creating admins via public register
    if (role === 'ADMIN' || role === 'SECURITY') {
        // In real app, check for an invite token or Master Key
        // return res.status(403).json({ error: "Admin registration restricted" });
    }

    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { regNo: regNo || undefined }] }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
              email,
              regNo,
              passwordHash: hashedPassword,
              name,
              role: role || 'STUDENT'
            }
        });

        if (newUser.role === 'STUDENT') {
            await tx.studentProfile.create({
                data: { userId: newUser.id }
            });
        } else if (newUser.role === 'ADMIN') {
            await tx.adminProfile.create({
                data: { 
                    userId: newUser.id,
                    department: "IT",
                    employeeId: `ADM-${Date.now()}`
                }
            });
        }

        return newUser;
    });

    const tokens = generateTokens(user.id, user.role);
    res.status(201).json({ token: tokens.accessToken, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await prisma.session.deleteMany({ where: { refreshToken } });
    }
    
    // If user is logged in, log the logout action
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded: any = jwt.decode(token);
            if (decoded?.id) {
               await logAccess(req, decoded.id, '', 'LOGOUT', 'SUCCESS');
            }
        } catch(e) {}
    }

    res.clearCookie('refreshToken');
    res.json({ success: true });
};

export const refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
        const session = await prisma.session.findFirst({
            where: { refreshToken: token }
        });

        if (!session || new Date() > session.expiresAt) {
            return res.status(403).json({ error: "Session expired" });
        }

        const payload = jwt.verify(token, REFRESH_SECRET) as any;
        const user = await prisma.user.findUnique({ where: { id: payload.id } });

        if (!user) return res.status(403).json({ error: "User not found" });

        const newAccessToken = jwt.sign({ id: user.id, role: user.role }, ACCESS_SECRET, { expiresIn: '15m' });
        
        // Return appropriate avatar
        let avatar = user.avatar;
        if (user.role === 'STUDENT') {
             const p = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
             if (p?.avatarUrl) avatar = p.avatarUrl;
        }

        res.json({ token: newAccessToken, user: { id: user.id, name: user.name, role: user.role, avatar } });

    } catch (e) {
        res.status(403).json({ error: "Invalid token" });
    }
};

export const getSession = async (req: Request, res: Response) => {
    const u = (req as any).user;
    if (!u) return res.status(401).json({ error: "Not authenticated" });
    res.json({ user: u });
};

export const biometricLogin = async (req: Request, res: Response) => {
    res.status(501).json({error: "Not implemented in demo"});
};

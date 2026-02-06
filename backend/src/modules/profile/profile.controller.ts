
import { Request, Response } from 'express';
import { prisma } from '../../utils/prisma';
import path from 'path';
import fs from 'fs';

// GET /api/v1/profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { name: true, email: true, regNo: true, role: true }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// PATCH /api/v1/profile/update
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { phone, address, bio, dob } = req.body;

    // 1. Update Profile
    const updatedProfile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        phone,
        address,
        bio,
        dob: dob ? new Date(dob) : undefined
      }
    });

    // 2. Audit Log
    await prisma.auditLog.create({
      data: {
        userId,
        action: "PROFILE_UPDATE",
        details: `Updated fields: ${Object.keys(req.body).join(', ')}`,
        ipAddress: req.ip || req.socket.remoteAddress
      }
    });

    res.json({ success: true, message: "Profile updated successfully", data: updatedProfile });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// POST /api/v1/profile/photo
export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate public URL (assuming backend serves static files from /uploads)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // 1. Get old profile to delete old image if exists
    const oldProfile = await prisma.studentProfile.findUnique({ where: { userId } });
    
    // 2. Update DB
    await prisma.studentProfile.update({
      where: { userId },
      data: { avatarUrl }
    });

    // 3. Cleanup Old File (Optional but recommended)
    if (oldProfile?.avatarUrl) {
      const oldFilename = path.basename(oldProfile.avatarUrl);
      const oldPath = path.join(__dirname, '../../uploads/avatars', oldFilename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // 4. Audit Log
    await prisma.auditLog.create({
      data: {
        userId,
        action: "PHOTO_UPLOAD",
        details: `Uploaded new avatar: ${req.file.filename}`,
        ipAddress: req.ip
      }
    });

    res.json({ success: true, message: "Photo uploaded", avatarUrl });
  } catch (error) {
    console.error("Photo Upload Error:", error);
    res.status(500).json({ error: "Failed to upload photo" });
  }
};

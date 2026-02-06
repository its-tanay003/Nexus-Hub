
import { Request, Response, NextFunction } from 'express';

const loginAttempts = new Map<string, { count: number, resetTime: number }>();

// Simple in-memory rate limiter (Use Redis in production)
export const loginRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = loginAttempts.get(ip);

  if (record) {
    if (now > record.resetTime) {
      loginAttempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 }); // 15 mins
      return next();
    }

    if (record.count >= 5) {
      return res.status(429).json({ error: "Too many login attempts. Try again in 15 minutes." });
    }

    record.count++;
  } else {
    loginAttempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
  }

  next();
};

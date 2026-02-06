import { Request, Response } from 'express';
import { prisma } from '../../utils/prisma';
import { geminiService } from '../../services/gemini.service';
import crypto from 'crypto';

// --- VENT BOX ---

export const createVent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { content } = req.body;

    // 1. Moderate content with AI
    const analysis = await geminiService.moderateContent(content);

    // 2. Hash UserID for anonymity (One-way hash with daily salt logic could be used for rotation, here simple sha256)
    const authorHash = crypto.createHash('sha256').update(userId).digest('hex').substring(0, 10);

    const post = await prisma.ventPost.create({
      data: {
        content,
        authorHash,
        sentiment: analysis.sentiment || 0,
        tags: analysis.tags || ['General'],
        isFlagged: analysis.isFlagged || false
      }
    });

    // If flagged, in a real app we would alert admins/counselors here

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
};

export const getVents = async (req: Request, res: Response) => {
  try {
    const vents = await prisma.ventPost.findMany({
      where: { isFlagged: false }, // Only show safe content
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        replies: true
      }
    });
    res.json(vents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vents" });
  }
};

export const replyToVent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId } = req.params;
    const { content } = req.body;
    
    const authorHash = crypto.createHash('sha256').update(userId).digest('hex').substring(0, 10);

    const reply = await prisma.ventReply.create({
      data: {
        postId,
        content,
        authorHash
      }
    });

    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ error: "Failed to reply" });
  }
};

// --- STUDY BUDDIES ---

export const requestStudyBuddy = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { courseId, topic } = req.body;

    const request = await prisma.studyBuddyRequest.create({
      data: {
        userId,
        courseId,
        topic
      }
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to create request" });
  }
};

export const findBuddies = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { courseId } = req.query;

    if (!courseId || typeof courseId !== 'string') {
        return res.status(400).json({ error: "Course ID required" });
    }

    // Find requests for the same course, excluding the user's own requests
    const buddies = await prisma.studyBuddyRequest.findMany({
      where: {
        courseId: courseId,
        userId: { not: userId },
        status: 'OPEN'
      },
      include: {
        user: {
            select: { name: true, avatar: true } // Only expose safe public info
        }
      }
    });

    res.json(buddies);
  } catch (error) {
    res.status(500).json({ error: "Failed to find buddies" });
  }
};

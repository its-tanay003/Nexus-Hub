import { Request, Response } from 'express';
import { prisma } from '../../utils/prisma';
import { geminiService } from '../../services/gemini.service';
import { socketService } from '../../services/socket.service';

export const getTodaysMenu = async (req: Request, res: Response) => {
  try {
    // Get menu for 'Breakfast', 'Lunch', 'Dinner' for today
    const menus = await prisma.messMenu.findMany({
      where: {
        date: {
            // Simplified date check (In prod, use ranges for full day)
            gte: new Date(new Date().setHours(0,0,0,0)) 
        }
      }
    });
    
    // Fallback if DB is empty
    if (menus.length === 0) {
        return res.json({ 
            success: true, 
            data: { message: "No menu uploaded for today", fallback: true } 
        });
    }

    res.json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu" });
  }
};

export const rateMeal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { menuId, rating, comment } = req.body;
    
    // 1. Analyze Sentiment using Gemini
    let sentimentScore = 0;
    if (comment) {
        sentimentScore = await geminiService.analyzeSentiment(comment);
    }

    // 2. Save Review
    await prisma.messReview.create({
        data: {
            userId,
            menuId,
            rating,
            comment,
            sentiment: sentimentScore
        }
    });

    res.json({ success: true, message: "Rating submitted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit rating" });
  }
};

export const getLiveStatus = async (req: Request, res: Response) => {
  // Logic: In a real app, this connects to IoT Camera counters or Wi-Fi triangulation
  // For now, we simulate basic data or fetch from a 'MessCrowdLog' table if we had one.
  const crowdLevel = Math.floor(Math.random() * 100); 
  const waitTime = crowdLevel > 70 ? "15 mins" : "No wait";

  res.json({ 
    level: crowdLevel, 
    status: crowdLevel > 70 ? "High" : "Moderate",
    waitTime 
  });
};

// Admin/IoT endpoint to update status manually
export const updateLiveStatus = async (req: Request, res: Response) => {
    const { level, waitTime } = req.body;
    
    const stats = {
        level: level || Math.floor(Math.random() * 100),
        status: (level || 0) > 75 ? "High" : (level || 0) > 40 ? "Moderate" : "Low",
        waitTime: waitTime || "10 mins",
        timestamp: new Date()
    };

    socketService.broadcastMessStats(stats);
    res.json({ success: true, stats });
};
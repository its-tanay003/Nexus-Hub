
import { Request, Response } from 'express';
import { aiService } from '../../services/ai.service';
import { prisma } from '../../utils/prisma';

export const handleQuery = async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const { query, language } = req.body;
    const userId = (req as any).user?.id || 'guest';

    if (!query) return res.status(400).json({ error: "Query required" });

    // 1. Process AI
    const result = await aiService.processQuery(userId, query, language);
    const duration = Date.now() - start;

    // 2. Async Logging (Fire and Forget)
    // We wrap this in a promise that doesn't block the response
    prisma.chatLog.create({
      data: {
        userId: userId !== 'guest' ? userId : undefined, // Only link if real user
        userQuery: query,
        aiResponse: result.text,
        language: language || 'en',
        intentDetected: result.navigate_to || 'General',
        processingTime: duration,
        wasFallback: !!result.is_fallback
      }
    }).then(log => {
        // Optionally attach chatId to response for feedback
        // But for now we just log it
    }).catch(err => console.error("Chat Log Failed (Non-fatal):", err.message));

    // 3. Return Response
    res.json({ 
      success: true, 
      data: { ...result, chatId: 'log-id-placeholder' } 
    });

  } catch (error) {
    console.error("Assistant Controller Error:", error);
    res.status(500).json({ 
      success: false, 
      data: { text: "System Malfunction. Please try again." } 
    });
  }
};

export const submitFeedback = async (req: Request, res: Response) => {
  const { chatId, rating } = req.body;
  await aiService.logFeedback(chatId, rating);
  res.json({ success: true });
};

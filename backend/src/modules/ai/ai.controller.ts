
import { Request, Response } from 'express';
import { geminiService } from '../../services/gemini.service';

export const summarizeText = async (req: Request, res: Response) => {
    try {
        const { subject, body } = req.body;
        
        if (!subject && !body) {
            return res.status(400).json({ error: "Missing content to summarize" });
        }

        const result = await geminiService.summarizeEmail(subject || "No Subject", body || "");
        
        // Return 200 even if fallback is used, let frontend handle the UI state
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error during summarization" 
        });
    }
};

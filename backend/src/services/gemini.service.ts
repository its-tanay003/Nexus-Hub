
import { GoogleGenAI } from "@google/genai";

// Simple in-memory cache to save AI tokens
const summaryCache = new Map<string, any>();

export class GeminiService {
  private ai: GoogleGenAI;
  private modelFlash: string = 'gemini-3-flash-preview'; 
  private modelPro: string = 'gemini-3-pro-preview'; 
  // NOTE: In production, use Redis for caching
  
  constructor() {
    // Prevent crash if API_KEY is missing during development
    const apiKey = process.env.API_KEY || 'PLACEHOLDER_KEY';
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Helper: Generate a fallback summary when AI fails
   */
  private generateFallback(text: string, reason: string) {
    return {
      summary: text.length > 80 ? text.substring(0, 80) + "..." : text,
      urgent: text.toLowerCase().includes('urgent') || text.toLowerCase().includes('immediate'),
      category: 'General',
      isFallback: true,
      fallbackReason: reason
    };
  }

  /**
   * Pipeline 1: Text Summarization (Resilient)
   */
  async summarizeEmail(subject: string, body: string) {
    const cacheKey = `summary:${subject}:${body.length}`;
    if (summaryCache.has(cacheKey)) {
      console.log("Serving summary from cache");
      return summaryCache.get(cacheKey);
    }

    try {
      // 1. Validate Input
      if (!body) return this.generateFallback(subject, "Empty Body");

      // 2. Attempt AI Generation
      const response = await this.ai.models.generateContent({
        model: this.modelFlash,
        contents: `
          Role: Executive Assistant.
          Task: Summarize this email in <15 words. Detect urgency.
          Input: Subject: "${subject}", Body: "${body}"
          Output JSON: { "summary": "string", "urgent": boolean, "category": "Academic|Social|Admin" }
        `,
        config: { responseMimeType: "application/json" }
      });

      // 3. Parse and Cache
      const result = JSON.parse(response.text || "{}");
      summaryCache.set(cacheKey, result);
      
      // Clear cache if too large (simple eviction)
      if (summaryCache.size > 100) summaryCache.clear();

      return result;

    } catch (error: any) {
      // 4. Error Handling & Fallback
      let reason = "Unknown Error";
      
      if (error.toString().includes("429") || error?.status === 429 || error?.code === 429) {
         console.warn("⚠️ Gemini Quota Exceeded. Switching to Fallback.");
         reason = "High Traffic (Quota Limit)";
      } else if (error.toString().includes("503") || error.message?.includes("overloaded")) {
         console.warn("⚠️ Gemini Service Overloaded.");
         reason = "System Overload";
      } else if (error.toString().includes("API key not valid") || error.status === 400 || error.status === 403) {
         console.warn("⚠️ Gemini API Key Invalid or Missing.");
         reason = "AI Config Error";
      } else {
         console.error("❌ AI Summary Error:", error);
         reason = "Processing Failed";
      }

      const fallback = this.generateFallback(body || subject, reason);
      return fallback;
    }
  }

  /**
   * Pipeline 2: Sentiment Analysis
   */
  async analyzeSentiment(comment: string): Promise<number> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelFlash,
        contents: `
          Task: Analyze sentiment of this student feedback.
          Input: "${comment}"
          Output: Return ONLY a number between -1.0 (negative) and 1.0 (positive).
        `
      });
      const score = parseFloat(response.text?.trim() || "0");
      return isNaN(score) ? 0 : score;
    } catch (e) {
      console.error("Sentiment Analysis Failed (Fallback to Neutral)");
      return 0; // Fallback to neutral
    }
  }

  // ... keep other methods (generateStudyPlan, etc.) with similar try/catch blocks
  
  async moderateContent(text: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelFlash,
        contents: `
          Role: Moderator. Detect unsafe content.
          Input: "${text}"
          Output JSON: { "isFlagged": boolean, "tags": string[], "sentiment": number }
        `,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) {
      // Fail-safe: If AI fails, assume content needs review but don't block blindly
      return { isFlagged: false, tags: ["Unverified"], sentiment: 0 };
    }
  }
}

export const geminiService = new GeminiService();

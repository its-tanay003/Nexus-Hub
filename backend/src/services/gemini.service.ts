import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;
  private modelFlash: string = 'gemini-3-flash-preview';
  private modelPro: string = 'gemini-3-pro-preview';

  constructor() {
    const apiKey = process.env.API_KEY;
    this.ai = new GoogleGenAI({ apiKey: apiKey || 'mock-key' });
  }

  /**
   * Pipeline 1: Text Summarization
   * Uses Flash model for low latency.
   */
  async summarizeEmail(subject: string, body: string) {
    try {
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
      return JSON.parse(response.text || "{}");
    } catch (error: any) {
      if (error.toString().includes("429") || error?.status === 429 || error?.code === 429) {
         console.warn("Gemini Rate Limit (429) hit. Returning fallback.");
         return { summary: "Summary unavailable (High Traffic)", urgent: false };
      }
      console.error("AI Summary Error:", error);
      return { summary: "Processing failed", urgent: false };
    }
  }

  /**
   * Pipeline 2: Sentiment Analysis for Feedback
   * Used for aggregating mess ratings.
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
      return 0;
    }
  }

  /**
   * Pipeline 3: Study Recommendations
   * Uses Pro model for reasoning complex schedules.
   */
  async generateStudyPlan(schedule: any[], assignments: any[]) {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelPro,
        contents: `
          Role: Academic Advisor.
          Context: Student has the following schedule: ${JSON.stringify(schedule)}
          Pending Assignments: ${JSON.stringify(assignments)}
          Task: Suggest 3 optimal study slots for today.
          Output JSON: { "slots": [{ "time": "HH:MM", "duration": "mins", "focus": "Topic" }] }
        `,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { slots: [] };
    }
  }

  /**
   * Pipeline 4: Crowd Prediction Modeling
   */
  async predictMessCrowd(hour: number, day: string) {
    const response = await this.ai.models.generateContent({
      model: this.modelFlash,
      contents: `
        Context: University Cafeteria.
        Input: ${day} at ${hour}:00.
        Logic: Lunch peak is 12-2pm. Dinner is 7-9pm. Weekends are lighter.
        Output JSON: { "predictedLevel": number (0-100), "trend": "Rising|Falling|Stable" }
      `,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  }

  /**
   * Pipeline 5: Content Moderation & Tagging (Vent Box)
   */
  async moderateContent(text: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelFlash,
        contents: `
          Role: Mental Health Content Moderator.
          Task: Analyze this anonymous student post.
          1. Detect if it contains dangerous content (Self-harm, Violence, severe harassment). Set 'isFlagged' to true if unsafe.
          2. Assign 1-2 tags: [Academic, Relationship, Homesick, Anxiety, General, Career].
          3. Sentiment score (-1.0 to 1.0).
          
          Input: "${text}"
          Output JSON: { "isFlagged": boolean, "tags": string[], "sentiment": number }
        `,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { isFlagged: false, tags: ["General"], sentiment: 0 };
    }
  }
}

export const geminiService = new GeminiService();


import { GoogleGenAI } from "@google/genai";
import { navigationService } from "./navigation.service";

interface AIResponse {
  text: string;
  navigate_to?: string;
  language: 'en' | 'hi';
  is_fallback?: boolean;
}

export class AIService {
  private ai: GoogleGenAI;
  private modelName: string = 'gemini-3-flash-preview';
  
  // Circuit Breaker State
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly FAILURE_THRESHOLD = 3;
  private readonly COOLDOWN_MS = 60000; // 1 minute cooldown

  constructor() {
    // Use placeholder if key missing to prevent crash on startup
    const apiKey = process.env.API_KEY || 'placeholder_key';
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Safe Generate Content with Retry and Circuit Breaker
   */
  async processQuery(userId: string, query: string, language: 'en' | 'hi' = 'en'): Promise<AIResponse> {
    
    // 1. FAST PATH: Check Deterministic Navigation First (Zero Latency)
    const directRoute = navigationService.resolveRoute(query);
    if (directRoute && query.split(' ').length < 5) {
      // If query is short and matches a route directly (e.g., "Show mess menu"), skip AI
      return {
        text: language === 'hi' ? "Yeh lijiye." : directRoute.response,
        navigate_to: directRoute.path,
        language,
        is_fallback: true
      };
    }

    // 2. CIRCUIT BREAKER CHECK
    if (this.shouldSkipAI()) {
      console.warn("⚠️ Circuit Breaker Open: Skipping AI request");
      return this.generateFallback(query, language, directRoute?.path);
    }

    try {
      // 3. AI REQUEST
      const systemPrompt = `
        You are Nexus, a smart university assistant.
        Language: ${language === 'hi' ? 'Hindi (Hinglish)' : 'English'}.
        User Context: UserID ${userId}.
        
        App Capabilities:
        ${navigationService.getCapabilities()}
        
        Instructions:
        1. If the user wants to go somewhere, set 'navigate_to' to the path.
        2. Keep 'text' response brief (under 20 words).
        3. Be helpful and friendly.
        
        Output JSON format: { "text": "string", "navigate_to": "string | null" }
      `;

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: `System: ${systemPrompt}\nUser: ${query}`,
        config: { responseMimeType: "application/json" }
      });

      // Reset failure count on success
      this.failureCount = 0;

      const result = JSON.parse(response.text || "{}");
      return {
        text: result.text || "I'm not sure how to answer that.",
        navigate_to: result.navigate_to,
        language
      };

    } catch (error: any) {
      // 4. ERROR HANDLING
      this.handleAIError(error);
      
      // Return Fallback
      return this.generateFallback(query, language, directRoute?.path);
    }
  }

  private shouldSkipAI(): boolean {
    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      const now = Date.now();
      if (now - this.lastFailureTime < this.COOLDOWN_MS) {
        return true;
      }
      // Reset after cooldown
      this.failureCount = 0; 
    }
    return false;
  }

  private handleAIError(error: any) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (error.status === 429 || error.toString().includes('429')) {
      console.warn("⚠️ Gemini Quota Exceeded.");
    } else {
      console.error("❌ AI Service Error:", error);
    }
  }

  private generateFallback(query: string, language: 'en' | 'hi', route?: string): AIResponse {
    // If we found a route via keywords earlier, use it now as fallback
    if (route) {
      return {
        text: language === 'hi' ? "Connection weak. Main aapko le ja raha hoon." : "Network busy. Taking you there now.",
        navigate_to: route,
        language,
        is_fallback: true
      };
    }

    return {
      text: language === 'hi' 
        ? "Maaf kijiye, abhi server busy hai. Kripya menu se navigate karein." 
        : "I'm having trouble connecting to the brain. Please use the menu for now.",
      language,
      is_fallback: true
    };
  }

  async logFeedback(chatId: string, rating: number) {
    // Placeholder for RLHF
    console.log(`[RLHF] Chat ${chatId} rated ${rating}/5`);
  }
}

export const aiService = new AIService();

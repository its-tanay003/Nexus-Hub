import { GoogleGenAI } from "@google/genai";
import { MailSummary } from "../types";

const processEmailSummary = async (rawText: string, sender: string, subject: string): Promise<MailSummary> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key missing");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // We use gemini-3-flash-preview for fast, low-latency summarization
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are an AI assistant for a university student app.
        Summarize the following email into a SINGLE concise sentence (max 15 words).
        Determine if it is "urgent" (e.g., deadline changes, cancellations, security).
        
        Return JSON format: { "summary": "string", "urgent": boolean }
        
        Email Subject: ${subject}
        Email Body: ${rawText}
      `,
       config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text || "{}";
    const parsed = JSON.parse(jsonText);

    return {
      id: Math.random().toString(36).substr(2, 9),
      sender,
      subject,
      summary: parsed.summary || "Could not summarize.",
      urgent: parsed.urgent || false,
      timestamp: new Date(),
    };

  } catch (error: any) {
    // Handle Rate Limiting / Quota Exceeded specifically
    if (error.toString().includes("429") || error?.status === 429 || error?.code === 429) {
      console.warn("Gemini API Quota Exceeded. Using fallback summary.");
      return {
        id: Math.random().toString(36).substr(2, 9),
        sender,
        subject,
        // Simple fallback: truncate the body or use the subject
        summary: rawText.length > 50 ? rawText.substring(0, 50) + "..." : rawText, 
        urgent: false,
        timestamp: new Date(),
      };
    }

    console.error("Gemini Summarization Failed:", error);
    // Fallback if AI fails for other reasons
    return {
      id: Math.random().toString(36).substr(2, 9),
      sender,
      subject,
      summary: subject + " (AI Unavailable)",
      urgent: false,
      timestamp: new Date(),
    };
  }
};

export const fetchSimulatedMailSummaries = async (): Promise<MailSummary[]> => {
  // Simulating an inbox to feed the AI
  const mockEmails = [
    {
      sender: "Registrar Office",
      subject: "Course Registration Deadline Extended",
      body: "Dear Students, due to server maintenance, the deadline for Add/Drop has been extended by 24 hours to 5 PM tomorrow. Please finalize your schedules."
    },
    {
      sender: "Prof. Alan Turing",
      subject: "CS101 Class Cancelled",
      body: "I am unwell today. The lecture on Algorithms is cancelled. Please review Chapter 4."
    },
    {
      sender: "Campus Security",
      subject: "Bear Sighting near North Gate",
      body: "URGENT: A bear has been spotted near the North Dorms. Please stay indoors until further notice."
    }
  ];

  const summaries: MailSummary[] = [];
  
  // In a real app, this would be a backend worker. Here we do it client-side for demo.
  for (const email of mockEmails) {
    // Artificial delay to prevent rate limits in demo
    await new Promise(r => setTimeout(r, 500)); // Increased delay to 500ms
    const summary = await processEmailSummary(email.body, email.sender, email.subject);
    summaries.push(summary);
  }

  return summaries;
};
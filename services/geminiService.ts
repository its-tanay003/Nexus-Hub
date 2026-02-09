
import { MailSummary } from "../types";

// Helper to interact with the backend AI service
const summarizeViaBackend = async (subject: string, body: string): Promise<MailSummary> => {
  try {
    // Try to connect to backend
    const response = await fetch('http://localhost:4000/api/v1/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body })
    });

    if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
    }

    const json = await response.json();
    const result = json.data;

    return {
      id: Math.random().toString(36).substr(2, 9),
      sender: "System", // In a real app, this comes from the email
      subject,
      summary: result.summary,
      urgent: result.urgent,
      type: result.category,
      timestamp: new Date(),
      timeAgo: "Just now",
      // Pass through fallback flags for UI
      isFallback: result.isFallback,
      fallbackReason: result.fallbackReason
    } as MailSummary & { isFallback?: boolean, fallbackReason?: string }; 

  } catch (error: any) {
    // Differentiate between Network Error (Backend down) and Application Error
    if (error.message === 'Failed to fetch') {
        console.warn("Backend Unreachable: Using offline fallback.");
    } else {
        console.error("AI Service Error:", error);
    }

    // Client-side Fallback if backend is unreachable
    return {
      id: Math.random().toString(36).substr(2, 9),
      sender: "System",
      subject,
      summary: body.substring(0, 50) + "... (Offline Mode)",
      urgent: false,
      timestamp: new Date(),
      isFallback: true,
      fallbackReason: "Network Error"
    } as any;
  }
};

export const fetchSimulatedMailSummaries = async (): Promise<MailSummary[]> => {
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
  
  // Parallelize requests for speed, backend handles caching/rate-limiting
  const promises = mockEmails.map(email => 
      summarizeViaBackend(email.subject, email.body).then(summary => ({
          ...summary,
          sender: email.sender // Restore sender
      }))
  );

  return Promise.all(promises);
};

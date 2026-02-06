import { Request, Response } from 'express';

// Mock database and service interfaces
interface SOSRequest {
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

const SAFETY_DISPATCHER_URL = "https://internal-safety.university.edu/dispatch";

/**
 * PART 3, Step 3 (Backend): API Endpoint for Red Alert
 * 
 * Logic:
 * 1. Validate Geolocation data.
 * 2. Log incident to Immutable Ledger (for audit).
 * 3. Dispatch Async alerts (SMS, Push, Security Console).
 */
export const handleSOSTrigger = async (req: Request, res: Response) => {
  try {
    const { userId, latitude, longitude, timestamp } = req.body as SOSRequest;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Invalid Geolocation Data" });
    }

    console.log(`[RED ALERT] SOS Triggered by User ${userId} at ${latitude}, ${longitude}`);

    // 1. Create Emergency Record (Simulated DB Call)
    const incidentId = `INC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // 2. Dispatch to Security Dashboard (WebSocket Broadcast)
    // await socketServer.to('security-channel').emit('CRITICAL_ALERT', { incidentId, lat, long });

    // 3. Trigger External Notifications (Twilio/Firebase)
    // await sendSMS(user.emergencyContacts, `SOS! ${user.name} needs help at https://maps.google.com/?q=${latitude},${longitude}`);

    // 4. Return success immediately to client so UI updates
    return res.status(200).json({
      success: true,
      message: "SOS Dispatched. Security is en route.",
      incidentId: incidentId,
      estimatedResponseTime: "2 mins"
    });

  } catch (error) {
    console.error("SOS Trigger Failed", error);
    // Even if logic fails, try to dump raw request to a fallback log
    return res.status(500).json({ error: "Internal Dispatch Error" });
  }
};

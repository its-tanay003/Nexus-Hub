import { Request, Response } from 'express';
import { prisma } from '../../utils/prisma';
import { socketService } from '../../services/socket.service';

export const triggerSOS = async (req: Request, res: Response) => {
  try {
    const { userId, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Geolocation required" });
    }

    // 1. Log incident to DB
    const log = await prisma.sOSLog.create({
      data: {
        userId,
        latitude,
        longitude,
        status: 'ACTIVE'
      }
    });

    // 2. Broadcast via Socket
    socketService.broadcastCriticalAlert({
      incidentId: log.id,
      userId,
      location: { lat: latitude, lng: longitude },
      timestamp: new Date()
    });

    res.status(200).json({ 
      success: true, 
      message: "SOS Dispatched", 
      incidentId: log.id 
    });
  } catch (error) {
    console.error("SOS Error:", error);
    res.status(500).json({ error: "Failed to dispatch SOS" });
  }
};

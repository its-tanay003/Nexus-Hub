
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

export class SocketService {
  private static instance: SocketService;
  private io: Server | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public initialize(server: HttpServer) {
    this.io = new Server(server, {
      cors: { origin: "*", methods: ["GET", "POST"] },
      pingTimeout: 60000,
    });
    this.setupListeners();
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error("Socket.io not initialized!");
    }
    return this.io;
  }

  private setupListeners() {
    if (!this.io) return;

    // 1. General Campus Namespace
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);
      socket.on('join-user', (userId: string) => socket.join(`user:${userId}`));
    });

    // 2. Mess Hall Namespace
    this.io.of('/mess').on('connection', (socket) => {
      console.log(`Client subscribed to Mess Updates: ${socket.id}`);
      socket.join('live-updates');
    });

    // 3. Security Namespace
    this.io.of('/security').on('connection', (socket) => {
      console.log(`Security Monitor Connected: ${socket.id}`);
    });

    // 4. Academic Namespace (Timetable)
    this.io.of('/academic').on('connection', (socket) => {
        console.log(`Student subscribing to Timetable Updates: ${socket.id}`);
        socket.join('timetable-updates');
    });
  }

  // --- Broadcasting Methods ---

  public broadcastMessStats(stats: any) {
    if (this.io) {
      this.io.of('/mess').emit('CROWD_UPDATE', stats);
    }
  }

  public broadcastCriticalAlert(alertData: any) {
    if (this.io) {
        this.io.of('/security').emit('CRITICAL_ALERT', alertData);
        console.log("CRITICAL ALERT BROADCASTED:", alertData);
    }
  }

  public broadcastScheduleUpdate(updateData: any) {
      if (this.io) {
          // Broadcast to everyone in academic namespace for simplicity
          // In prod, you might emit to specific course rooms: `course:${subjectId}`
          this.io.of('/academic').emit('SCHEDULE_UPDATE', updateData);
      }
  }

  public sendNotification(userId: string, notification: any) {
    this.io?.to(`user:${userId}`).emit('notification', notification);
  }
}

export const socketService = SocketService.getInstance();

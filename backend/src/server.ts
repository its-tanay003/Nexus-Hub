import http from 'http';
import app from './app';
import { socketService } from './services/socket.service';

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// Initialize WebSockets
socketService.initialize(server);

// DEMO: Simulate Mess Crowd updates every 5 seconds
// In production, this would be replaced by real IoT sensors pushing data to the API.
setInterval(() => {
    const level = Math.floor(Math.random() * 100);
    const stats = {
        level,
        status: level > 75 ? "High" : level > 40 ? "Moderate" : "Low",
        waitTime: level > 75 ? "20+ mins" : level > 40 ? "10 mins" : "No wait",
        timestamp: new Date()
    };
    // Broadcast to frontend
    socketService.broadcastMessStats(stats);
}, 5000);

server.listen(PORT, () => {
  console.log(`🚀 Nexus Backend running on port ${PORT}`);
  console.log(`📡 WebSockets enabled`);
});
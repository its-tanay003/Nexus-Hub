
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';

// Import Routes
import authRoutes from './modules/auth/auth.routes';
import messRoutes from './modules/mess/mess.routes';
import aiRoutes from './modules/ai/ai.routes';
import academicRoutes from './modules/academic/academic.routes';
import safetyRoutes from './modules/safety/safety.routes';
import marketplaceRoutes from './modules/marketplace/marketplace.routes';
import wellbeingRoutes from './modules/wellbeing/wellbeing.routes';
import profileRoutes from './modules/profile/profile.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';

const app = express();

// Middleware
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false, 
}));
app.use(express.json());
app.use(morgan('dev'));

// Static File Serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/mess', messRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/academic', academicRoutes);
app.use('/api/v1/safety', safetyRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/wellbeing', wellbeingRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/attendance', attendanceRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'Nexus API' });
});

export default app;

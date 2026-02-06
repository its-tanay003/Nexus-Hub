
import { Router } from 'express';
import { getTimetable, getAssignments } from './academic.controller';
import { getDailyTimetable, getFullTimetable, downloadCalendar, triggerScheduleUpdate } from './timetable.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Legacy routes
router.get('/timetable/legacy', authenticate, getTimetable);
router.get('/assignments', authenticate, getAssignments);

// New Production Timetable Routes
router.get('/timetable/today', authenticate, getDailyTimetable);
router.get('/timetable/day/:day', authenticate, getDailyTimetable);
router.get('/timetable/full', authenticate, getFullTimetable);
router.get('/timetable/export', authenticate, downloadCalendar);

// Test Route for Real-time updates
router.post('/timetable/trigger-update', authenticate, triggerScheduleUpdate);

export default router;

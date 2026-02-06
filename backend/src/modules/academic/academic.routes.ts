import { Router } from 'express';
import { getTimetable, getAssignments } from './academic.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/timetable', authenticate, getTimetable);
router.get('/assignments', authenticate, getAssignments);

export default router;

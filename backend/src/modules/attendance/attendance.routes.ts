
import { Router } from 'express';
import { getAttendanceSummary, getSubjectDetails } from './attendance.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/summary', authenticate, getAttendanceSummary);
router.get('/subject/:subjectId', authenticate, getSubjectDetails);

export default router;

import { Router } from 'express';
import { createVent, getVents, replyToVent, requestStudyBuddy, findBuddies } from './wellbeing.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Vent Box Routes
router.get('/vents', getVents);
router.post('/vents', authenticate, createVent);
router.post('/vents/:postId/reply', authenticate, replyToVent);

// Study Buddy Routes
router.post('/study/request', authenticate, requestStudyBuddy);
router.get('/study/find', authenticate, findBuddies);

export default router;

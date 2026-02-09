
import { Router } from 'express';
import { handleQuery, submitFeedback } from './assistant.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Allow authenticated users to query
router.post('/query', authenticate, handleQuery);
router.post('/feedback', authenticate, submitFeedback);

export default router;

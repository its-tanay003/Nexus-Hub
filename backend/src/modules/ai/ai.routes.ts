
import { Router } from 'express';
import { summarizeText } from './ai.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Allow public access for demo, or protect with authenticate
router.post('/summarize', summarizeText);

export default router;

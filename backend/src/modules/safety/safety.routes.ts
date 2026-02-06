import { Router } from 'express';
import { triggerSOS } from './safety.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/sos', authenticate, triggerSOS);

export default router;

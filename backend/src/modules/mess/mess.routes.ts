import { Router } from 'express';
import { getTodaysMenu, rateMeal, getLiveStatus, updateLiveStatus } from './mess.controller';

const router = Router();

router.get('/today', getTodaysMenu);
router.post('/rate', rateMeal);
router.get('/live-status', getLiveStatus);
router.post('/update', updateLiveStatus);

export default router;
import { Router } from 'express';
import { geminiService } from '../../services/gemini.service';

const router = Router();

router.post('/summarize', async (req, res) => {
    const { subject, body } = req.body;
    const result = await geminiService.summarizeEmail(subject, body);
    res.json(result);
});

export default router;

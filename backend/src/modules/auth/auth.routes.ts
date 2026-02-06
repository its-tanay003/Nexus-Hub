
import { Router } from 'express';
import { loginStudent, loginAdmin, register, logout, refreshToken, biometricLogin, getSession } from './auth.controller';
import { loginRateLimit } from '../../middleware/rateLimit.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Distinct Login Flows
router.post('/login/student', loginRateLimit, loginStudent);
router.post('/login/admin', loginRateLimit, loginAdmin);

// Common Auth
router.post('/register', register); // Mostly for students in this demo
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/biometric', biometricLogin);
router.get('/session', authenticate, getSession);

export default router;

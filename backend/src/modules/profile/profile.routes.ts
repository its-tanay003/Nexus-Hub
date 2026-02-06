
import { Router } from 'express';
import { getProfile, updateProfile, uploadProfilePhoto } from './profile.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { uploadAvatar } from '../../middleware/upload.middleware';

const router = Router();

router.get('/', authenticate, getProfile);
router.patch('/update', authenticate, updateProfile);
router.post('/photo', authenticate, uploadAvatar.single('avatar'), uploadProfilePhoto);

export default router;

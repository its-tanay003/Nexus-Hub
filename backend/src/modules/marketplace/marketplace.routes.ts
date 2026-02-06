import { Router } from 'express';
import { getListings, createListing } from './marketplace.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', getListings);
router.post('/', authenticate, createListing);

export default router;

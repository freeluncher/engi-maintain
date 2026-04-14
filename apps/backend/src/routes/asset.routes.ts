import { Router } from 'express';
import { getAllAssets } from '../controllers/asset.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getAllAssets);

export default router;

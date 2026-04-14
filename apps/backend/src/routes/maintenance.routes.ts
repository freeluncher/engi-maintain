import { Router } from 'express';
import { createMaintenanceLog, getMaintenanceHistory } from '../controllers/maintenance.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

// Posisinya akan di mount ke /api/v1/assets/:assetId/maintenance
router.post('/', requireAuth, createMaintenanceLog);
router.get('/', requireAuth, getMaintenanceHistory);

export default router;

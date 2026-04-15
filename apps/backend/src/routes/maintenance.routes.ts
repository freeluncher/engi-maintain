import { Router } from 'express';
import { createMaintenanceLog, getMaintenanceHistory } from '../controllers/maintenance.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

// Posisinya akan di mount ke /api/v1/assets/:assetId/maintenance
// Engineer bisa create laporan maintenance, semua role bisa membaca histori
router.post('/', requireAuth, requireRole('Engineer'), createMaintenanceLog);
router.get('/', requireAuth, getMaintenanceHistory);

export default router;

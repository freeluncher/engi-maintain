import { Router } from 'express';
import { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset } from '../controllers/asset.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

// Middleware upload untuk 2 jenis file: manualFile & sopFile
const assetUploads = uploadMiddleware.fields([
  { name: 'manualFile', maxCount: 1 },
  { name: 'sopFile', maxCount: 1 }
]);

router.get('/', requireAuth, getAllAssets);
router.get('/:id', requireAuth, getAssetById);

// Endpoint CREATE & UPDATE perlu proses upload file
router.post('/', requireAuth, assetUploads, createAsset);
router.put('/:id', requireAuth, assetUploads, updateAsset);

router.delete('/:id', requireAuth, deleteAsset);

// Nested routes untuk modul maintenance log
import maintenanceRoutes from './maintenance.routes';
router.use('/:assetId/maintenance', maintenanceRoutes);

import { createSchedule, getAssetSchedules } from '../controllers/schedule.controller';
router.post('/:assetId/schedules', requireAuth, createSchedule);
router.get('/:assetId/schedules', requireAuth, getAssetSchedules);

export default router;

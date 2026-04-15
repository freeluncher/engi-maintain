import { Router } from 'express';
import { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset } from '../controllers/asset.controller';
import { createSchedule, getAssetSchedules } from '../controllers/schedule.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import maintenanceRoutes from './maintenance.routes';

const router = Router();

// Middleware upload untuk 2 jenis file: manualFile & sopFile
const assetUploads = uploadMiddleware.fields([
  { name: 'manualFile', maxCount: 1 },
  { name: 'sopFile', maxCount: 1 },
]);

// READ: Semua role yang login bisa melihat aset
router.get('/', requireAuth, getAllAssets);
router.get('/:id', requireAuth, getAssetById);

// WRITE: Hanya Admin yang bisa membuat, edit, dan hapus aset
router.post('/', requireAuth, requireRole('Admin'), assetUploads, createAsset);
router.put('/:id', requireAuth, requireRole('Admin'), assetUploads, updateAsset);
router.delete('/:id', requireAuth, requireRole('Admin'), deleteAsset);

// Nested maintenance logs — Engineer bisa create, semua bisa read
router.use('/:assetId/maintenance', maintenanceRoutes);

// Jadwal PM — Admin & Manager bisa membuat jadwal (nested di bawah asset)
router.post('/:assetId/schedules', requireAuth, requireRole('Admin', 'Manager'), createSchedule);
router.get('/:assetId/schedules', requireAuth, getAssetSchedules);

export default router;

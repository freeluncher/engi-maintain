import { Router } from 'express';
import {
  getAllSpareParts,
  createSparePart,
  updateSparePart,
  deleteSparePart,
} from '../controllers/sparePart.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();

// GET: Semua role bisa melihat daftar spare part (untuk dropdown saat log maintenance)
router.get('/', requireAuth, getAllSpareParts);

// POST/PUT/DELETE: Hanya Admin yang bisa kelola master library
router.post('/', requireAuth, requireRole('Admin'), createSparePart);
router.put('/:id', requireAuth, requireRole('Admin'), updateSparePart);
router.delete('/:id', requireAuth, requireRole('Admin'), deleteSparePart);

export default router;

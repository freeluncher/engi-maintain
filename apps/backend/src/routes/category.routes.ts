import { Router } from 'express';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getAllCategories);
router.post('/', requireAuth, requireRole('Admin'), createCategory);
router.put('/:id', requireAuth, requireRole('Admin'), updateCategory);
router.delete('/:id', requireAuth, requireRole('Admin'), deleteCategory);

export default router;
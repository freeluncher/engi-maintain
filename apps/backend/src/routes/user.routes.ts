import { Router } from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();

// Semua endpoint user management hanya bisa diakses Admin
router.get('/', requireAuth, requireRole('Admin'), getAllUsers);
router.post('/', requireAuth, requireRole('Admin'), createUser);
router.put('/:id', requireAuth, requireRole('Admin'), updateUser);
router.delete('/:id', requireAuth, requireRole('Admin'), deleteUser);

export default router;

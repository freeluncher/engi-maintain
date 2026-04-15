import { Router } from 'express';
import { getUpcomingAlerts, executeSchedule } from '../controllers/schedule.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();

// /api/v1/schedules/...
// Semua bisa melihat upcoming — Engineer butuh ini untuk notifikasi PM
router.get('/upcoming', requireAuth, getUpcomingAlerts);

// Hanya Engineer yang mengeksekusi jadwal PM di lapangan
router.post('/:scheduleId/execute', requireAuth, requireRole('Engineer'), executeSchedule);

export default router;

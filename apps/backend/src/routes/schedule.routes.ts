import { Router } from 'express';
import { getUpcomingAlerts, executeSchedule } from '../controllers/schedule.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// /api/v1/schedules/...
router.get('/upcoming', requireAuth, getUpcomingAlerts);
router.post('/:scheduleId/execute', requireAuth, executeSchedule);

export default router;

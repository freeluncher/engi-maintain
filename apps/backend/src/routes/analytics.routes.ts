import { Router } from 'express';
import {
  getDashboardAnalytics,
  getMtbfAnalytics,
  getSparePartsReport,
  exportMaintenanceReport,
} from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();

// Dashboard: Admin & Manager (Engineer tidak perlu analytics strategis)
router.get('/dashboard', requireAuth, requireRole('Admin', 'Manager'), getDashboardAnalytics);

// MTBF & Spare Parts Report: Admin & Manager
router.get('/mtbf', requireAuth, requireRole('Admin', 'Manager'), getMtbfAnalytics);
router.get('/spare-parts', requireAuth, requireRole('Admin', 'Manager'), getSparePartsReport);

// Export CSV: Admin & Manager
router.get('/export', requireAuth, requireRole('Admin', 'Manager'), exportMaintenanceReport);

export default router;

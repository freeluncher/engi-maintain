import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await analyticsService.getDashboardAnalytics();
    res.json({ data });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Gagal memproses data analitik dashboard.' });
  }
};

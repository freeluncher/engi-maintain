import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Hitung Availability Rate
    const totalAssets = await prisma.asset.count();
    const brokenAssets = await prisma.asset.count({
      where: {
        OR: [
          { status: 'Breakdown' },
          { status: 'UnderMaintenance' }
        ]
      }
    });

    const operationalAssets = totalAssets - brokenAssets;
    const availabilityRate = totalAssets > 0 
      ? Math.round((operationalAssets / totalAssets) * 100) 
      : 0;

    // 2. Downtime Summary (30 Hari Terakhir)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const maintenanceLogs = await prisma.maintenanceLog.findMany({
      where: {
        maintenanceDate: {
          gte: thirtyDaysAgo
        },
      },
      select: { downtimeHours: true }
    });

    const totalDowntimeHours = maintenanceLogs.reduce((acc, log) => acc + (log.downtimeHours || 0), 0);

    // 3. Category Distribution
    const categoryAggregates = await prisma.asset.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    const categoryDistribution = categoryAggregates.map(cat => ({
      name: cat.category,
      value: cat._count.id
    }));

    // Data terstruktur untuk dipakai UI Recharts
    res.json({
      data: {
        availability: {
           rate: availabilityRate,
           operational: operationalAssets,
           total: totalAssets
        },
        downtime: {
           hours: totalDowntimeHours,
           daysSpan: 30
        },
        categoryDistribution
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Gagal memproses data analitik dashboard.' });
  }
};

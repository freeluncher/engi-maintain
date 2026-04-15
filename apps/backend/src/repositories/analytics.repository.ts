import { AssetStatus } from '../generated/prisma/enums';
import { prisma } from '../config/database';

export const analyticsRepository = {
  countAllAssets: async () => {
    return prisma.asset.count();
  },

  countAssetsByStatuses: async (statuses: AssetStatus[]) => {
    return prisma.asset.count({
      where: { status: { in: statuses } },
    });
  },

  getRecentMaintenanceLogs: async (since: Date) => {
    return prisma.maintenanceLog.findMany({
      where: { maintenanceDate: { gte: since } },
      select: { downtimeHours: true },
    });
  },

  getCategoryDistribution: async () => {
    return prisma.asset.groupBy({
      by: ['category'],
      _count: { id: true },
    });
  },
};

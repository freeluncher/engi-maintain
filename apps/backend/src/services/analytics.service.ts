import { analyticsRepository } from '../repositories/analytics.repository';
import { AssetStatus } from '../generated/prisma/enums';

export const analyticsService = {
  getDashboardAnalytics: async () => {
    // 1. Availability Rate
    const totalAssets = await analyticsRepository.countAllAssets();
    const brokenAssets = await analyticsRepository.countAssetsByStatuses([
      AssetStatus.Breakdown,
      AssetStatus.UnderMaintenance,
    ]);
    const operationalAssets = totalAssets - brokenAssets;
    const availabilityRate =
      totalAssets > 0 ? Math.round((operationalAssets / totalAssets) * 100) : 0;

    // 2. Downtime Summary (30 Hari Terakhir)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const maintenanceLogs = await analyticsRepository.getRecentMaintenanceLogs(thirtyDaysAgo);
    const totalDowntimeHours = maintenanceLogs.reduce(
      (acc, log) => acc + (log.downtimeHours || 0),
      0,
    );

    // 3. Category Distribution
    const categoryAggregates = await analyticsRepository.getCategoryDistribution();
    const categoryDistribution = categoryAggregates.map((cat) => ({
      name: cat.category,
      value: cat._count.id,
    }));

    return {
      availability: {
        rate: availabilityRate,
        operational: operationalAssets,
        total: totalAssets,
      },
      downtime: {
        hours: totalDowntimeHours,
        daysSpan: 30,
      },
      categoryDistribution,
    };
  },
};

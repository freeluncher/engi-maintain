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
        hours: parseFloat(totalDowntimeHours.toFixed(1)),
        daysSpan: 30,
      },
      categoryDistribution,
    };
  },

  /**
   * MTBF = (Total Operational Time) / (Number of Failures)
   * Dihitung per aset berdasarkan jumlah log Corrective maintenance.
   */
  getMtbfByAsset: async () => {
    const assets = await analyticsRepository.getAssetsWithCorrectiveLogs();

    return assets.map((asset) => {
      const failures = asset.maintenanceLogs.length;
      let mtbfHours = 0;

      if (failures > 1) {
        // Hitung selisih waktu antar breakdown
        let totalGapMs = 0;
        for (let i = 1; i < asset.maintenanceLogs.length; i++) {
          const prev = new Date(asset.maintenanceLogs[i - 1]!.maintenanceDate).getTime();
          const curr = new Date(asset.maintenanceLogs[i]!.maintenanceDate).getTime();
          totalGapMs += curr - prev;
        }
        const avgGapMs = totalGapMs / (failures - 1);
        mtbfHours = parseFloat((avgGapMs / (1000 * 60 * 60)).toFixed(1));
      } else if (failures === 1) {
        // Hanya 1 kegagalan — MTBF = waktu sejak kegagalan pertama sampai sekarang
        const firstFailure = new Date(asset.maintenanceLogs[0]!.maintenanceDate).getTime();
        const now = Date.now();
        mtbfHours = parseFloat(((now - firstFailure) / (1000 * 60 * 60)).toFixed(1));
      }

      return {
        assetId: asset.id,
        assetName: asset.name,
        serialNumber: asset.serialNumber,
        category: asset.category,
        failures,
        mtbfHours,
      };
    });
  },

  /**
   * Laporan penggunaan spare parts per bulan dalam range waktu tertentu.
   */
  getSparePartsReport: async (monthsBack = 6) => {
    const until = new Date();
    const since = new Date();
    since.setMonth(since.getMonth() - monthsBack);

    const usageData = await analyticsRepository.getSparePartsUsageByMonth(since, until);

    // Group by month and by spare part
    const monthlyMap: Record<string, Record<string, { name: string; qty: number; cost: number }>> =
      {};

    for (const item of usageData) {
      const date = new Date(item.maintenanceLog.maintenanceDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const partName = item.sparePart.name;
      const cost = (item.sparePart.unitPrice || 0) * item.quantityUsed;

      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = {};
      if (!monthlyMap[monthKey][partName]) {
        monthlyMap[monthKey][partName] = { name: partName, qty: 0, cost: 0 };
      }
      monthlyMap[monthKey][partName].qty += item.quantityUsed;
      monthlyMap[monthKey][partName].cost += cost;
    }

    // Summary total per spare part
    const partTotals: Record<string, { name: string; totalQty: number; totalCost: number }> = {};
    for (const item of usageData) {
      const partName = item.sparePart.name;
      const cost = (item.sparePart.unitPrice || 0) * item.quantityUsed;
      if (!partTotals[partName]) partTotals[partName] = { name: partName, totalQty: 0, totalCost: 0 };
      partTotals[partName].totalQty += item.quantityUsed;
      partTotals[partName].totalCost += cost;
    }

    // Build monthly chart data array sorted by month
    const chartData = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, parts]) => ({
        month,
        totalQty: Object.values(parts).reduce((s, p) => s + p.qty, 0),
        totalCost: Object.values(parts).reduce((s, p) => s + p.cost, 0),
        parts: Object.values(parts),
      }));

    return {
      chartData,
      topParts: Object.values(partTotals)
        .sort((a, b) => b.totalQty - a.totalQty)
        .slice(0, 10),
      period: { since: since.toISOString(), until: until.toISOString(), monthsBack },
    };
  },

  /**
   * Export maintenance history sebagai data terstruktur (CSV generation di controller).
   */
  getExportData: async (since: Date, until: Date) => {
    const logs = await analyticsRepository.getMaintenanceLogsForExport(since, until);
    return logs.map((log) => ({
      id: log.id,
      tanggal: new Date(log.maintenanceDate).toLocaleDateString('id-ID'),
      assetName: log.asset.name,
      serialNumber: log.asset.serialNumber,
      kategori: log.asset.category,
      lokasi: log.asset.location,
      jenisMaintenance: log.type,
      teknisi: log.technicianName,
      deskripsi: log.description,
      downtimeJam: log.downtimeHours ?? 0,
      spareParts: log.spareParts
        .map((sp) => `${sp.sparePart.name} (${sp.sparePart.partNumber}) x${sp.quantityUsed}`)
        .join('; '),
    }));
  },
};

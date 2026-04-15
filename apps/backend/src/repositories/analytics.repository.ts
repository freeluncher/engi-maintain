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

  // Untuk MTBF: ambil semua asset + maintenance log Corrective-nya
  getAssetsWithCorrectiveLogs: async () => {
    return prisma.asset.findMany({
      select: {
        id: true,
        name: true,
        serialNumber: true,
        category: true,
        maintenanceLogs: {
          where: { type: 'Corrective' },
          select: { maintenanceDate: true, downtimeHours: true },
          orderBy: { maintenanceDate: 'asc' },
        },
      },
    });
  },

  // Untuk Spare Parts Report: penggunaan per bulan
  getSparePartsUsageByMonth: async (since: Date, until: Date) => {
    return prisma.maintenanceSparePart.findMany({
      where: {
        maintenanceLog: {
          maintenanceDate: { gte: since, lte: until },
        },
      },
      include: {
        sparePart: { select: { name: true, partNumber: true, unitPrice: true } },
        maintenanceLog: { select: { maintenanceDate: true } },
      },
      orderBy: { maintenanceLog: { maintenanceDate: 'asc' } },
    });
  },

  // Untuk Export: histori maintenance lengkap dalam range tanggal
  getMaintenanceLogsForExport: async (since: Date, until: Date) => {
    return prisma.maintenanceLog.findMany({
      where: {
        maintenanceDate: { gte: since, lte: until },
      },
      include: {
        asset: { select: { name: true, serialNumber: true, category: true, location: true } },
        spareParts: {
          include: { sparePart: { select: { name: true, partNumber: true } } },
        },
      },
      orderBy: { maintenanceDate: 'asc' },
    });
  },
};

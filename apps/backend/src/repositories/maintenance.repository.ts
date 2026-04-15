import { AssetStatus } from '../generated/prisma/enums';
import { prisma } from '../config/database';

export const maintenanceRepository = {
  findByAssetId: async (assetId: string) => {
    return prisma.maintenanceLog.findMany({
      where: { assetId },
      orderBy: { maintenanceDate: 'desc' },
      include: {
        spareParts: {
          include: { sparePart: true },
        },
      },
    });
  },

  /**
   * Buat log maintenance + opsional update status aset dalam satu transaksi.
   */
  createWithTransaction: async (
    logData: {
      asset: { connect: { id: string } };
      type: string;
      description: string;
      technicianName: string;
      downtimeHours?: number | null;
    },
    assetId: string,
    newAssetStatus?: string,
    currentAssetStatus?: string,
  ) => {
    return prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.create({
        data: logData as Parameters<typeof tx.maintenanceLog.create>[0]['data'],
      });

      if (newAssetStatus && newAssetStatus !== currentAssetStatus) {
        await tx.asset.update({
          where: { id: assetId },
          data: { status: newAssetStatus as AssetStatus },
        });
      }

      return log;
    });
  },

  getRecentLogs: async (since: Date) => {
    return prisma.maintenanceLog.findMany({
      where: { maintenanceDate: { gte: since } },
      select: { downtimeHours: true },
    });
  },
};

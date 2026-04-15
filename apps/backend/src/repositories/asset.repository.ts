import { AssetStatus } from '../generated/prisma/enums';
import { prisma } from '../config/database';

export const assetRepository = {
  findAll: async () => {
    return prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id: string) => {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        maintenanceLogs: {
          orderBy: { maintenanceDate: 'desc' },
          take: 5,
        },
      },
    });
  },

  findBySerialNumber: async (serialNumber: string) => {
    return prisma.asset.findUnique({ where: { serialNumber } });
  },

  create: async (data: {
    name: string;
    brand: string;
    serialNumber: string;
    category: string;
    status: string;
    location: string;
    purchaseDate?: Date | null;
    warrantyEnd?: Date | null;
    manualFileUrl?: string | null;
    sopFileUrl?: string | null;
  }) => {
    return prisma.asset.create({ data: data as Parameters<typeof prisma.asset.create>[0]['data'] });
  },

  update: async (id: string, data: Record<string, unknown>) => {
    return prisma.asset.update({ where: { id }, data: data as Parameters<typeof prisma.asset.update>[0]['data'] });
  },

  updateQrCode: async (id: string, qrCode: string) => {
    return prisma.asset.update({ where: { id }, data: { qrCode } });
  },

  countAll: async () => {
    return prisma.asset.count();
  },

  countByStatuses: async (statuses: AssetStatus[]) => {
    return prisma.asset.count({
      where: {
        status: { in: statuses },
      },
    });
  },

  getCategoryDistribution: async () => {
    return prisma.asset.groupBy({
      by: ['category'],
      _count: { id: true },
    });
  },

  delete: async (id: string) => {
    return prisma.asset.delete({ where: { id } });
  },
};

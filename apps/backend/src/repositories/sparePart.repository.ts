import { prisma } from '../config/database';

export const sparePartRepository = {
  findAll: async () => {
    return prisma.sparePart.findMany({
      orderBy: { name: 'asc' },
    });
  },

  findById: async (id: string) => {
    return prisma.sparePart.findUnique({ where: { id } });
  },

  findByPartNumber: async (partNumber: string) => {
    return prisma.sparePart.findUnique({ where: { partNumber } });
  },

  create: async (data: {
    name: string;
    partNumber: string;
    description?: string | null;
    stockQuantity: number;
    minStockLevel: number;
    unitPrice?: number | null;
    supplier?: string | null;
  }) => {
    return prisma.sparePart.create({ data });
  },

  update: async (
    id: string,
    data: {
      name?: string;
      partNumber?: string;
      description?: string | null;
      stockQuantity?: number;
      minStockLevel?: number;
      unitPrice?: number | null;
      supplier?: string | null;
    },
  ) => {
    return prisma.sparePart.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.sparePart.delete({ where: { id } });
  },

  // Untuk analytics: total penggunaan per spare part dalam periode
  getUsageReport: async (since: Date, until: Date) => {
    return prisma.maintenanceSparePart.findMany({
      where: {
        maintenanceLog: {
          maintenanceDate: { gte: since, lte: until },
        },
      },
      include: {
        sparePart: { select: { name: true, partNumber: true, unitPrice: true } },
        maintenanceLog: { select: { maintenanceDate: true, assetId: true } },
      },
    });
  },
};

import { prisma } from '../config/database';

export const scheduleRepository = {
  findByAssetId: async (assetId: string) => {
    return prisma.schedule.findMany({
      where: { assetId },
      orderBy: { nextDueDate: 'asc' },
    });
  },

  findById: async (id: string) => {
    return prisma.schedule.findUnique({ where: { id } });
  },

  create: async (data: {
    asset: { connect: { id: string } };
    title: string;
    description?: string;
    frequencyType: string;
    frequencyValue?: number | null;
    nextDueDate: Date;
  }) => {
    return prisma.schedule.create({ data: data as Parameters<typeof prisma.schedule.create>[0]['data'] });
  },

  findUpcomingAlerts: async (until: Date) => {
    return prisma.schedule.findMany({
      where: {
        isActive: true,
        nextDueDate: { lte: until },
      },
      include: {
        asset: { select: { id: true, name: true, serialNumber: true } },
      },
      orderBy: { nextDueDate: 'asc' },
    });
  },

  /**
   * Update jadwal setelah eksekusi PM dalam satu transaksi bersama pembuatan log.
   */
  executeWithTransaction: async (
    scheduleId: string,
    logData: {
      assetId: string;
      type: string;
      description: string;
      technicianName: string;
      maintenanceDate: Date;
    },
    scheduleUpdateData: {
      lastExecutedAt: Date;
      nextDueDate: Date;
      isOverdue: boolean;
    },
  ) => {
    return prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.create({
        data: logData as Parameters<typeof tx.maintenanceLog.create>[0]['data'],
      });

      const updatedSchedule = await tx.schedule.update({
        where: { id: scheduleId },
        data: scheduleUpdateData,
      });

      return { log, updatedSchedule };
    });
  },
};

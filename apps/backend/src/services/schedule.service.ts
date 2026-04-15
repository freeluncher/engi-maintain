import { scheduleRepository } from '../repositories/schedule.repository';
import { NotFoundError } from '../utils/errors';

/** Helper: Hitung nextDueDate berdasarkan tipe frekuensi */
const calculateNextDueDate = (baseDate: Date, type: string, customValue?: number): Date => {
  const nextDate = new Date(baseDate);
  switch (type) {
    case 'DAILY':     nextDate.setDate(nextDate.getDate() + 1); break;
    case 'WEEKLY':    nextDate.setDate(nextDate.getDate() + 7); break;
    case 'MONTHLY':   nextDate.setMonth(nextDate.getMonth() + 1); break;
    case 'QUARTERLY': nextDate.setMonth(nextDate.getMonth() + 3); break;
    case 'YEARLY':    nextDate.setFullYear(nextDate.getFullYear() + 1); break;
    case 'CUSTOM':    nextDate.setDate(nextDate.getDate() + (customValue || 1)); break;
    default:          nextDate.setMonth(nextDate.getMonth() + 1);
  }
  return nextDate;
};

export const scheduleService = {
  createSchedule: async (
    assetId: string,
    body: {
      title: string;
      description?: string;
      frequencyType: string;
      frequencyValue?: number;
      startDate?: string;
    },
  ) => {
    const { title, description, frequencyType, frequencyValue, startDate } = body;

    const baseDate = startDate ? new Date(startDate) : new Date();
    const nextDueDate = calculateNextDueDate(baseDate, frequencyType, frequencyValue);

    const createData: Parameters<typeof scheduleRepository.create>[0] = {
      asset: { connect: { id: assetId } },
      title,
      frequencyType,
      frequencyValue: frequencyValue ?? null,
      nextDueDate,
    };
    if (description !== undefined) createData.description = description;

    return scheduleRepository.create(createData);
  },

  getAssetSchedules: async (assetId: string) => {
    return scheduleRepository.findByAssetId(assetId);
  },

  getUpcomingAlerts: async () => {
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const alerts = await scheduleRepository.findUpcomingAlerts(next7Days);

    return alerts.map((sch) => {
      const isOverdue = sch.nextDueDate < today;
      return {
        ...sch,
        isOverdue,
        statusFlag: isOverdue ? 'OVERDUE' : 'UPCOMING',
      };
    });
  },

  executeSchedule: async (
    scheduleId: string,
    body: { technicianName: string; description?: string },
  ) => {
    const { technicianName, description } = body;

    const schedule = await scheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundError('Jadwal tidak ditemukan');
    }

    const now = new Date();
    const nextDueDate = calculateNextDueDate(
      now,
      schedule.frequencyType,
      schedule.frequencyValue ?? undefined,
    );

    const logData = {
      assetId: schedule.assetId,
      type: 'Preventive',
      description: `[PM: ${schedule.title}] - ${description || 'Pelaksanaan Rutin'}`,
      technicianName,
      maintenanceDate: now,
    };

    const scheduleUpdate = {
      lastExecutedAt: now,
      nextDueDate,
      isOverdue: false,
    };

    return scheduleRepository.executeWithTransaction(scheduleId, logData, scheduleUpdate);
  },
};

import { Request, Response } from 'express';
import { prisma } from '../config/database';

// Helper: Menambah hari berdasarkan frekuensi
const calculateNextDueDate = (baseDate: Date, type: string, customValue?: number): Date => {
  const nextDate = new Date(baseDate);
  switch (type) {
    case 'DAILY': nextDate.setDate(nextDate.getDate() + 1); break;
    case 'WEEKLY': nextDate.setDate(nextDate.getDate() + 7); break;
    case 'MONTHLY': nextDate.setMonth(nextDate.getMonth() + 1); break;
    case 'QUARTERLY': nextDate.setMonth(nextDate.getMonth() + 3); break;
    case 'YEARLY': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
    case 'CUSTOM': nextDate.setDate(nextDate.getDate() + (customValue || 1)); break;
    default: nextDate.setMonth(nextDate.getMonth() + 1);
  }
  return nextDate;
};

export const createSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetId } = req.params;
    const { title, description, frequencyType, frequencyValue, startDate } = req.body;

    const baseDate = startDate ? new Date(startDate) : new Date();
    const nextDueDate = calculateNextDueDate(baseDate, frequencyType, frequencyValue);

    const schedule = await prisma.schedule.create({
      data: {
        assetId,
        title,
        description,
        frequencyType,
        frequencyValue: frequencyValue || null,
        nextDueDate,
      }
    });

    res.status(201).json({ message: 'Jadwal PM berhasil dibuat', data: schedule });
  } catch (error) {
    console.error('Create Schedule Error:', error);
    res.status(500).json({ message: 'Sistem gagal membuat penjadwalan.' });
  }
};

export const getAssetSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
     const { assetId } = req.params;
     const schedules = await prisma.schedule.findMany({
        where: { assetId },
        orderBy: { nextDueDate: 'asc' }
     });
     res.json({ data: schedules });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menarik daftar jadwal rutin.' });
  }
};

export const getUpcomingAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
     // Menarik jadwal yang: overdue ATAU jatuh tempo dalam 7 hari ke depan
     const today = new Date();
     const next7Days = new Date();
     next7Days.setDate(today.getDate() + 7);

     const alerts = await prisma.schedule.findMany({
        where: {
           isActive: true,
           nextDueDate: {
              lte: next7Days // Kurang dari atau sama dengan 7 hari ke depan (termasuk yang lampau/overdue)
           }
        },
        include: {
           asset: {
              select: { id: true, name: true, serialNumber: true }
           }
        },
        orderBy: { nextDueDate: 'asc' }
     });

     // Memetakan mana yang overdue mana yang upcoming
     const mappedAlerts = alerts.map(sch => {
        const isOverdue = sch.nextDueDate < today;
        return {
           ...sch,
           isOverdue,
           statusFlag: isOverdue ? 'OVERDUE' : 'UPCOMING'
        };
     });

     res.json({ data: mappedAlerts });
  } catch (error) {
     console.error('Fetch Alerts Error:', error);
     res.status(500).json({ message: 'Sistem gagal mengevaluasi alert penjadwalan.' });
  }
};

export const executeSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scheduleId } = req.params;
    const { technicianName, description } = req.body;

    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) { res.status(404).json({ message: 'Jadwal tidak ditemukan' }); return; }

    const now = new Date();
    const nextDueDate = calculateNextDueDate(now, schedule.frequencyType, schedule.frequencyValue || undefined);

    const transaction = await prisma.$transaction(async (tx) => {
       // Buat log eksekusi Preventive
       const log = await tx.maintenanceLog.create({
          data: {
             assetId: schedule.assetId,
             type: 'Preventive',
             description: `[PM: ${schedule.title}] - ${description || 'Pelaksanaan Rutin'}`,
             technicianName,
             maintenanceDate: now
          }
       });

       // Geser tanggal jatuh tempo schedule
       const updatedSchedule = await tx.schedule.update({
          where: { id: scheduleId },
          data: {
             lastExecutedAt: now,
             nextDueDate,
             isOverdue: false
          }
       });

       return { log, updatedSchedule };
    });

    res.json({ message: 'Eksekusi Preventive tercatat.', data: transaction });
  } catch (error) {
    console.error('Execute Schedule Error:', error);
    res.status(500).json({ message: 'Sistem gagal memproses log eksekusi jadwal rutin.' });
  }
};

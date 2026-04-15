import { Request, Response } from 'express';
import { scheduleService } from '../services/schedule.service';
import { AppError } from '../utils/errors';

export const createSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const schedule = await scheduleService.createSchedule(req.params['assetId'] as string, req.body);
    res.status(201).json({ message: 'Jadwal PM berhasil dibuat', data: schedule });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Create Schedule Error:', error);
    res.status(500).json({ message: 'Sistem gagal membuat penjadwalan.' });
  }
};

export const getAssetSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const schedules = await scheduleService.getAssetSchedules(req.params['assetId'] as string);
    res.json({ data: schedules });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menarik daftar jadwal rutin.' });
  }
};

export const getUpcomingAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await scheduleService.getUpcomingAlerts();
    res.json({ data: alerts });
  } catch (error) {
    console.error('Fetch Alerts Error:', error);
    res.status(500).json({ message: 'Sistem gagal mengevaluasi alert penjadwalan.' });
  }
};

export const executeSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await scheduleService.executeSchedule(req.params['scheduleId'] as string, req.body);
    res.json({ message: 'Eksekusi Preventive tercatat.', data: result });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Execute Schedule Error:', error);
    res.status(500).json({ message: 'Sistem gagal memproses log eksekusi jadwal rutin.' });
  }
};

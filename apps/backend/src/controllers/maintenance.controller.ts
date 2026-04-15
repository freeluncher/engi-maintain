import { Request, Response } from 'express';
import { maintenanceService } from '../services/maintenance.service';
import { AppError } from '../utils/errors';

export const createMaintenanceLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const assetId = req.params['assetId'] as string;
    const log = await maintenanceService.createMaintenanceLog(assetId, req.body);
    res.status(201).json({ message: 'Laporan maintenance berhasil direkam', data: log });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Create Maintenance Log Error:', error);
    res.status(500).json({ message: 'Sistem gagal menyimpan laporan perbaikan.' });
  }
};

export const getMaintenanceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const assetId = req.params['assetId'] as string;
    const logs = await maintenanceService.getMaintenanceHistory(assetId);
    res.json({ data: logs });
  } catch (error) {
    console.error('Fetch Maintenance Logs Error:', error);
    res.status(500).json({ message: 'Sistem gagal memuat histori perbaikan.' });
  }
};

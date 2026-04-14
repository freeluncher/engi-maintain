import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const createMaintenanceLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetId } = req.params;
    const { type, description, technicianName, downtimeHours, newAssetStatus } = req.body;

    // Pastikan aset tersedia
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      res.status(404).json({ message: 'Aset tidak ditemukan' });
      return;
    }

    // Gunakan Prisma Transcation untuk memastikan data sinkron
    const transaction = await prisma.$transaction(async (tx) => {
       // 1. Buat log perbaikan
       const log = await tx.maintenanceLog.create({
         data: {
           assetId,
           type: type || 'Corrective',
           description,
           technicianName,
           downtimeHours: downtimeHours ? parseFloat(downtimeHours) : null,
         }
       });

       // 2. Jika opsi ganti status disertakan (misal setelah perbaikan mesin kembali Operational)
       if (newAssetStatus && newAssetStatus !== asset.status) {
          await tx.asset.update({
            where: { id: assetId },
            data: { status: newAssetStatus }
          });
       }

       return log;
    });

    res.status(201).json({ message: 'Laporan maintenance berhasil direkam', data: transaction });
  } catch (error) {
    console.error('Create Maintenance Log Error:', error);
    res.status(500).json({ message: 'Sistem gagal menyimpan laporan perbaikan.' });
  }
};

export const getMaintenanceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
     const { assetId } = req.params;
     const logs = await prisma.maintenanceLog.findMany({
       where: { assetId },
       orderBy: { maintenanceDate: 'desc' },
       include: {
         spareParts: {
           include: {
             sparePart: true
           }
         }
       }
     });

     res.json({ data: logs });
  } catch (error) {
     console.error('Fetch Maintenance Logs Error:', error);
     res.status(500).json({ message: 'Sistem gagal memuat histori perbaikan.' });
  }
};

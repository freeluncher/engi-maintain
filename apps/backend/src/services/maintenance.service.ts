import { maintenanceRepository } from '../repositories/maintenance.repository';
import { assetRepository } from '../repositories/asset.repository';
import { sparePartService } from './sparePart.service';
import { NotFoundError, ConflictError } from '../utils/errors';

export const maintenanceService = {
  createMaintenanceLog: async (
    assetId: string,
    body: {
      type?: string;
      description: string;
      technicianName: string;
      downtimeHours?: string | number;
      newAssetStatus?: string;
      sparePartConsumptions?: Array<{ sparePartId: string; quantityUsed: number }>;
    },
  ) => {
    const { type, description, technicianName, downtimeHours, newAssetStatus, sparePartConsumptions } = body;

    const asset = await assetRepository.findById(assetId);
    if (!asset) {
      throw new NotFoundError('Aset tidak ditemukan');
    }

    // Consume spare parts if provided
    if (sparePartConsumptions && sparePartConsumptions.length > 0) {
      await sparePartService.consumeSpareParts(sparePartConsumptions);
    }

    const logData = {
      asset: { connect: { id: assetId } },
      type: type || 'Corrective',
      description,
      technicianName,
      downtimeHours: downtimeHours ? parseFloat(String(downtimeHours)) : null,
    };

    return maintenanceRepository.createWithTransaction(
      logData,
      assetId,
      newAssetStatus,
      asset.status,
    );
  },

  getMaintenanceHistory: async (assetId: string) => {
    return maintenanceRepository.findByAssetId(assetId);
  },

  closeMaintenanceLog: async (
    logId: string,
    body: { endTime?: string },
  ) => {
    const log = await maintenanceRepository.findById(logId);
    if (!log) {
      throw new NotFoundError('Log maintenance tidak ditemukan');
    }

    if (log.maintenanceDate && body.endTime) {
      const start = new Date(log.maintenanceDate);
      const end = new Date(body.endTime);
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      const existingHours = log.downtimeHours || 0;
      const totalDowntime = existingHours + diffHours;
      
      return maintenanceRepository.update(logId, { downtimeHours: totalDowntime });
    }

    return log;
  },
};

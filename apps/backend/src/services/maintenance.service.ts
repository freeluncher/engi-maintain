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

  getActiveMaintenance: async (assetId: string) => {
    const logs = await maintenanceRepository.findByAssetId(assetId);
    // Return the most recent log that is not "Operational" on the asset
    const asset = await assetRepository.findById(assetId);
    if (!asset) return null;
    
    if (asset.status === 'Breakdown' || asset.status === 'UnderMaintenance') {
      // Find the most recent maintenance log that likely caused this status
      return logs[0] || null;
    }
    return null;
  },

  closeMaintenanceLog: async (
    logId: string,
    body: { endTime?: string; newAssetStatus?: string },
  ) => {
    const log = await maintenanceRepository.findById(logId);
    if (!log) {
      throw new NotFoundError('Log maintenance tidak ditemukan');
    }

    const now = new Date();
    let totalDowntime = log.downtimeHours || 0;

    // Calculate downtime if start time exists
    if (log.maintenanceDate) {
      const start = new Date(log.maintenanceDate);
      const end = body.endTime ? new Date(body.endTime) : now;
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      totalDowntime = diffHours > 0 ? diffHours : 0;
    }

    // Update the log
    const updatedLog = await maintenanceRepository.update(logId, { 
      downtimeHours: totalDowntime 
    });

    // Update asset status if provided
    if (body.newAssetStatus) {
      await assetRepository.update(log.assetId, { 
        status: body.newAssetStatus as any 
      });
    }

    return updatedLog;
  },
};

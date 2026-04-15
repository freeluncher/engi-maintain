import { maintenanceRepository } from '../repositories/maintenance.repository';
import { assetRepository } from '../repositories/asset.repository';
import { NotFoundError } from '../utils/errors';

export const maintenanceService = {
  createMaintenanceLog: async (
    assetId: string,
    body: {
      type?: string;
      description: string;
      technicianName: string;
      downtimeHours?: string | number;
      newAssetStatus?: string;
    },
  ) => {
    const { type, description, technicianName, downtimeHours, newAssetStatus } = body;

    // Pastikan aset tersedia
    const asset = await assetRepository.findById(assetId);
    if (!asset) {
      throw new NotFoundError('Aset tidak ditemukan');
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
};

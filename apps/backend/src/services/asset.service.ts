import QRCode from 'qrcode';
import { assetRepository } from '../repositories/asset.repository';
import { ConflictError, NotFoundError } from '../utils/errors';

export const assetService = {
  getAllAssets: async () => {
    return assetRepository.findAll();
  },

  getAssetById: async (id: string) => {
    const asset = await assetRepository.findById(id);
    if (!asset) {
      throw new NotFoundError('Aset tidak ditemukan');
    }
    return asset;
  },

  createAsset: async (
    body: {
      name: string;
      brand: string;
      serialNumber: string;
      category: string;
      status?: string;
      location: string;
      purchaseDate?: string;
      warrantyEnd?: string;
    },
    files?: { [fieldname: string]: Express.Multer.File[] },
  ) => {
    const { name, brand, serialNumber, category, status, location, purchaseDate, warrantyEnd } = body;

    // Cek duplikat serial number
    const existing = await assetRepository.findBySerialNumber(serialNumber);
    if (existing) {
      throw new ConflictError('Serial Number sudah terdaftar pada aset lain.');
    }

    const manualFileUrl = files?.['manualFile']?.[0]
      ? `/uploads/${files['manualFile'][0].filename}`
      : null;
    const sopFileUrl = files?.['sopFile']?.[0]
      ? `/uploads/${files['sopFile'][0].filename}`
      : null;

    // Buat asset
    const newAsset = await assetRepository.create({
      name,
      brand,
      serialNumber,
      category,
      status: status || 'Operational',
      location,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      warrantyEnd: warrantyEnd ? new Date(warrantyEnd) : null,
      manualFileUrl,
      sopFileUrl,
    });

    // Generate QR Code
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const actionUrl = `${frontendUrl}/assets/${newAsset.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(actionUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    // Simpan QR Code ke record asset
    return assetRepository.updateQrCode(newAsset.id, qrCodeDataUrl);
  },

  regenerateQrCode: async (id: string) => {
    const asset = await assetRepository.findById(id);
    if (!asset) {
      throw new NotFoundError('Aset tidak ditemukan');
    }
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const actionUrl = `${frontendUrl}/assets/${asset.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(actionUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
    return assetRepository.updateQrCode(id, qrCodeDataUrl);
  },

  updateAsset: async (
    id: string,
    body: {
      name?: string;
      brand?: string;
      serialNumber?: string;
      category?: string;
      status?: string;
      location?: string;
      purchaseDate?: string;
      warrantyEnd?: string;
    },
    files?: { [fieldname: string]: Express.Multer.File[] },
  ) => {
    const { name, brand, serialNumber, category, status, location, purchaseDate, warrantyEnd } = body;

    const updateData: Record<string, unknown> = {
      name,
      brand,
      serialNumber,
      category,
      status,
      location,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      warrantyEnd: warrantyEnd ? new Date(warrantyEnd) : null,
    };

    if (files?.['manualFile']?.[0]) {
      updateData.manualFileUrl = `/uploads/${files['manualFile'][0].filename}`;
    }
    if (files?.['sopFile']?.[0]) {
      updateData.sopFileUrl = `/uploads/${files['sopFile'][0].filename}`;
    }

    return assetRepository.update(id, updateData);
  },

  deleteAsset: async (id: string) => {
    return assetRepository.delete(id);
  },
};

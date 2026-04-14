import { Request, Response } from 'express';
import { prisma } from '../config/database';
import QRCode from 'qrcode';

export const getAllAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // Memberikan return standar REST JSON
    res.json({ data: assets });
  } catch (error) {
    console.error('Fetch Assets Error:', error);
    res.status(500).json({ message: 'Sistem gagal memuat daftar aset dari database.' });
  }
};

export const getAssetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        maintenanceLogs: {
          orderBy: { maintenanceDate: 'desc' },
          take: 5
        }
      }
    });

    if (!asset) {
      res.status(404).json({ message: 'Aset tidak ditemukan' });
      return;
    }

    res.json({ data: asset });
  } catch (error) {
    console.error('Fetch Asset By ID Error:', error);
    res.status(500).json({ message: 'Sistem gagal memuat detail aset.' });
  }
};

export const createAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, brand, serialNumber, category, status, location, purchaseDate, warrantyEnd } = req.body;

    // Menarik path URL lokasi upload file
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const manualFileUrl = files?.['manualFile']?.[0] ? `/uploads/${files['manualFile'][0].filename}` : null;
    const sopFileUrl = files?.['sopFile']?.[0] ? `/uploads/${files['sopFile'][0].filename}` : null;

    // Cek apakah serial number sudah ada
    const existingAsset = await prisma.asset.findUnique({ where: { serialNumber } });
    if (existingAsset) {
      res.status(400).json({ message: 'Serial Number sudah terdaftar pada aset lain.' });
      return;
    }

    // Insert awal ke database untuk mendapatkan ID Asset
    const newAsset = await prisma.asset.create({
      data: {
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
      }
    });

    // Sesuaikan host sesuai konfigurasi frontend (Action URL)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const actionUrl = `${frontendUrl}/assets/${newAsset.id}`;
    
    // Generate QR Code sebagai base64 string
    const qrCodeDataUrl = await QRCode.toDataURL(actionUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    });

    // Update asset records menyertakan qrCode string
    const assetWithQr = await prisma.asset.update({
      where: { id: newAsset.id },
      data: { qrCode: qrCodeDataUrl }
    });

    res.status(201).json({ message: 'Aset baru berhasil dicatat', data: assetWithQr });
  } catch (error) {
    console.error('Create Asset Error:', error);
    res.status(500).json({ message: 'Sistem gagal merekam aset ke database.' });
  }
};

export const updateAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, brand, serialNumber, category, status, location, purchaseDate, warrantyEnd } = req.body;

    // Ambil path file baru bila ada upload
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updateData: any = {
      name,
      brand,
      serialNumber,
      category,
      status, // 'Operational', 'UnderMaintenance', 'Breakdown'
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

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: updateData
    });

    res.json({ message: 'Informasi aset berhasil diperbarui', data: updatedAsset });
  } catch (error) {
    console.error('Update Asset Error:', error);
    res.status(500).json({ message: 'Sistem gagal menyimpan perubahan aset.' });
  }
};

export const deleteAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.asset.delete({ where: { id } });
    res.json({ message: 'Aset berhasil dieliminasi dari sistem.' });
  } catch (error) {
    console.error('Delete Asset Error:', error);
    res.status(500).json({ message: 'Sistem gagal menghapus aset.' });
  }
};

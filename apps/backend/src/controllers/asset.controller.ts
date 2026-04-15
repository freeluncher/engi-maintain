import { Request, Response } from 'express';
import { assetService } from '../services/asset.service';
import { AppError } from '../utils/errors';

export const getAllAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const assets = await assetService.getAllAssets();
    res.json({ data: assets });
  } catch (error) {
    console.error('Fetch Assets Error:', error);
    res.status(500).json({ message: 'Sistem gagal memuat daftar aset dari database.' });
  }
};

export const getAssetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const asset = await assetService.getAssetById(req.params['id'] as string);
    res.json({ data: asset });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Fetch Asset By ID Error:', error);
    res.status(500).json({ message: 'Sistem gagal memuat detail aset.' });
  }
};

export const createAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const asset = await assetService.createAsset(req.body, files);
    res.status(201).json({ message: 'Aset baru berhasil dicatat', data: asset });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Create Asset Error:', error);
    res.status(500).json({ message: 'Sistem gagal merekam aset ke database.' });
  }
};

export const updateAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const asset = await assetService.updateAsset(req.params['id'] as string, req.body, files);
    res.json({ message: 'Informasi aset berhasil diperbarui', data: asset });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Update Asset Error:', error);
    res.status(500).json({ message: 'Sistem gagal menyimpan perubahan aset.' });
  }
};

export const deleteAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    await assetService.deleteAsset(req.params['id'] as string);
    res.json({ message: 'Aset berhasil dieliminasi dari sistem.' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Delete Asset Error:', error);
    res.status(500).json({ message: 'Sistem gagal menghapus aset.' });
  }
};

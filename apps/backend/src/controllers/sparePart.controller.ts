import { Request, Response } from 'express';
import { sparePartService } from '../services/sparePart.service';
import { AppError } from '../utils/errors';

export const getAllSpareParts = async (req: Request, res: Response): Promise<void> => {
  try {
    const parts = await sparePartService.getAllSpareParts();
    res.json({ data: parts });
  } catch (error) {
    console.error('Get All SpareParts Error:', error);
    res.status(500).json({ message: 'Gagal memuat daftar spare part.' });
  }
};

export const createSparePart = async (req: Request, res: Response): Promise<void> => {
  try {
    const part = await sparePartService.createSparePart(req.body);
    res.status(201).json({ message: 'Spare part baru berhasil ditambahkan ke library.', data: part });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Create SparePart Error:', error);
    res.status(500).json({ message: 'Gagal menyimpan spare part.' });
  }
};

export const updateSparePart = async (req: Request, res: Response): Promise<void> => {
  try {
    const part = await sparePartService.updateSparePart(req.params['id'] as string, req.body);
    res.json({ message: 'Data spare part berhasil diperbarui.', data: part });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Update SparePart Error:', error);
    res.status(500).json({ message: 'Gagal memperbarui spare part.' });
  }
};

export const deleteSparePart = async (req: Request, res: Response): Promise<void> => {
  try {
    await sparePartService.deleteSparePart(req.params['id'] as string);
    res.json({ message: 'Spare part berhasil dihapus dari library.' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Delete SparePart Error:', error);
    res.status(500).json({ message: 'Gagal menghapus spare part.' });
  }
};

import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { AppError } from '../utils/errors';

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ data: categories });
  } catch (error) {
    console.error('Fetch Categories Error:', error);
    res.status(500).json({ message: 'Sistem gagal memuat daftar kategori.' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ message: 'Kategori berhasil dibuat', data: category });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Create Category Error:', error);
    res.status(500).json({ message: 'Sistem gagal membuat kategori.' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await categoryService.updateCategory(req.params['id'] as string, req.body);
    res.json({ message: 'Kategori berhasil diperbarui', data: category });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Update Category Error:', error);
    res.status(500).json({ message: 'Sistem gagal memperbarui kategori.' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    await categoryService.deleteCategory(req.params['id'] as string);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Delete Category Error:', error);
    res.status(500).json({ message: 'Sistem gagal menghapus kategori.' });
  }
};
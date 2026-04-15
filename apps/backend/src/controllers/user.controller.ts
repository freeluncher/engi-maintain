import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { AppError } from '../utils/errors';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    res.json({ data: users });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: 'Gagal memuat daftar pengguna.' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ message: 'Akun pengguna baru berhasil dibuat.', data: user });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Create User Error:', error);
    res.status(500).json({ message: 'Gagal membuat akun pengguna.' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userService.updateUser(req.params['id'] as string, req.body);
    res.json({ message: 'Data pengguna berhasil diperbarui.', data: user });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'Gagal memperbarui data pengguna.' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await userService.deleteUser(req.params['id'] as string);
    res.json({ message: 'Akun pengguna berhasil dihapus.' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Gagal menghapus akun pengguna.' });
  }
};

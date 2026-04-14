import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth.middleware';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ message: 'Email dan password wajib diisi' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Email yang Anda masukkan tidak terdaftar' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Password yang Anda masukkan salah' });
      return;
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = generateToken(payload);

    res.json({
      message: 'Authentication Successful',
      token,
      user: payload,
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan sistem di server', detail: error.message, stack: error.stack });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Sesi anda tidak ditemukan' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    
    if (!user) {
      res.status(404).json({ message: 'Data pengguna tidak lagi ada di sistem' });
      return;
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat kapabilitas user' });
  }
};

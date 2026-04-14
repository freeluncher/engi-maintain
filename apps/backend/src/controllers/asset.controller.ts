import { Request, Response } from 'express';
import { prisma } from '../config/database';

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

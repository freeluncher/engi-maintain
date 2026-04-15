import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Akses ditolak: Token kredensial tidak ditemukan' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token tidak valid' });
    return;
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // berisi schema { id, email, role, name, iat, exp }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Sesi anda telah berakhir atau token tidak valid' });
  }
};

/**
 * Middleware RBAC: Hanya izinkan request dari role yang tercantum.
 * Harus digunakan SETELAH requireAuth.
 * @example router.post('/users', requireAuth, requireRole('Admin'), createUser)
 */
export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ 
        message: `Akses ditolak: Hanya ${roles.join(' / ')} yang diizinkan untuk aksi ini.` 
      });
      return;
    }
    next();
  };

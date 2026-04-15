import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { userRepository } from '../repositories/user.repository';
import { UnauthorizedError, NotFoundError } from '../utils/errors';

export const authService = {
  login: async (email: string, password: string) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Email yang Anda masukkan tidak terdaftar');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Password yang Anda masukkan salah');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = generateToken(payload);
    return { token, user: payload };
  },

  getMe: async (userId: string) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Data pengguna tidak lagi ada di sistem');
    }
    return user;
  },
};

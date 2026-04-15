import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors';

export const userService = {
  getAllUsers: async () => {
    return userRepository.findAll();
  },

  createUser: async (body: {
    email: string;
    name: string;
    password: string;
    role: string;
  }) => {
    const { email, name, password, role } = body;

    if (!['Admin', 'Manager', 'Engineer'].includes(role)) {
      throw new BadRequestError('Role tidak valid. Pilih: Admin, Manager, atau Engineer.');
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email sudah terdaftar pada akun lain.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return userRepository.create({ email, name, password: hashedPassword, role });
  },

  updateUser: async (
    id: string,
    body: { email?: string; name?: string; password?: string; role?: string },
  ) => {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('Pengguna tidak ditemukan.');

    if (body.role && !['Admin', 'Manager', 'Engineer'].includes(body.role)) {
      throw new BadRequestError('Role tidak valid. Pilih: Admin, Manager, atau Engineer.');
    }

    if (body.email && body.email !== user.email) {
      const existing = await userRepository.findByEmail(body.email);
      if (existing) throw new ConflictError('Email sudah digunakan oleh akun lain.');
    }

    const updateData: { email?: string; name?: string; password?: string; role?: string } = {
      ...(body.email && { email: body.email }),
      ...(body.name && { name: body.name }),
      ...(body.role && { role: body.role }),
    };

    // Hash password baru jika dikirimkan
    if (body.password && body.password.trim() !== '') {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    return userRepository.update(id, updateData);
  },

  deleteUser: async (id: string) => {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('Pengguna tidak ditemukan.');
    return userRepository.delete(id);
  },
};

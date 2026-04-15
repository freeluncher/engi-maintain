import { prisma } from '../config/database';

export const userRepository = {
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  },

  findAll: async () => {
    return prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  create: async (data: { email: string; name: string; password: string; role: string }) => {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role as any,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  },

  update: async (id: string, data: { email?: string; name?: string; password?: string; role?: string }) => {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.name && { name: data.name }),
        ...(data.password && { password: data.password }),
        ...(data.role && { role: data.role as any }),
      },
      select: { id: true, email: true, name: true, role: true, updatedAt: true },
    });
  },

  delete: async (id: string) => {
    return prisma.user.delete({ where: { id } });
  },
};

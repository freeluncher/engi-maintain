import { prisma } from '../config/database';

export const categoryRepository = {
  findAll: async () => {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  },

  findById: async (id: string) => {
    return prisma.category.findUnique({ where: { id } });
  },

  findByName: async (name: string) => {
    return prisma.category.findUnique({ where: { name } });
  },

  create: async (data: { name: string; description?: string | null }) => {
    return prisma.category.create({ data });
  },

  update: async (id: string, data: { name?: string; description?: string | null }) => {
    return prisma.category.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.category.update({ where: { id }, data: { isActive: false } });
  },
};
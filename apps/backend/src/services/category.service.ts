import { categoryRepository } from '../repositories/category.repository';
import { ConflictError, NotFoundError } from '../utils/errors';

export const categoryService = {
  getAllCategories: async () => {
    return categoryRepository.findAll();
  },

  getCategoryById: async (id: string) => {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Kategori tidak ditemukan.');
    return category;
  },

  createCategory: async (body: { name: string; description?: string }) => {
    const existing = await categoryRepository.findByName(body.name);
    if (existing) throw new ConflictError('Nama kategori sudah digunakan.');

    return categoryRepository.create({
      name: body.name,
      description: body.description || null,
    });
  },

  updateCategory: async (
    id: string,
    body: { name?: string; description?: string },
  ) => {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Kategori tidak ditemukan.');

    if (body.name && body.name !== category.name) {
      const existing = await categoryRepository.findByName(body.name);
      if (existing) throw new ConflictError('Nama kategori sudah digunakan.');
    }

    return categoryRepository.update(id, {
      name: body.name,
      description: body.description,
    });
  },

  deleteCategory: async (id: string) => {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Kategori tidak ditemukan.');
    return categoryRepository.delete(id);
  },
};
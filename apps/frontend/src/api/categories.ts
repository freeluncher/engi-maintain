import { apiClient } from './client';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res: any = await apiClient.get('categories').json();
    return res.data;
  },

  create: async (payload: CreateCategoryPayload): Promise<Category> => {
    const res: any = await apiClient.post('categories', { json: payload }).json();
    return res.data;
  },

  update: async (id: string, payload: Partial<CreateCategoryPayload>): Promise<Category> => {
    const res: any = await apiClient.put(`categories/${id}`, { json: payload }).json();
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`categories/${id}`).json();
  },
};
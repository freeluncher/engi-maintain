import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Engineer';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  email: string;
  name: string;
  password: string;
  role: 'Admin' | 'Manager' | 'Engineer';
}

export interface UpdateUserPayload {
  email?: string;
  name?: string;
  password?: string;
  role?: 'Admin' | 'Manager' | 'Engineer';
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const res: any = await apiClient.get('users').json();
    return res.data;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const res: any = await apiClient.post('users', { json: payload }).json();
    return res.data;
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const res: any = await apiClient.put(`users/${id}`, { json: payload }).json();
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`users/${id}`).json();
  },
};

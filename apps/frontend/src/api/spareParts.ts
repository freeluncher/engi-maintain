import { apiClient } from './client';

export interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  description?: string | null;
  stockQuantity: number;
  minStockLevel: number;
  unitPrice?: number | null;
  supplier?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSparePartPayload {
  name: string;
  partNumber: string;
  description?: string;
  stockQuantity?: number;
  minStockLevel?: number;
  unitPrice?: number;
  supplier?: string;
}

export const sparePartsApi = {
  getAll: async (): Promise<SparePart[]> => {
    const res: any = await apiClient.get('spare-parts').json();
    return res.data;
  },

  create: async (payload: CreateSparePartPayload): Promise<SparePart> => {
    const res: any = await apiClient.post('spare-parts', { json: payload }).json();
    return res.data;
  },

  update: async (id: string, payload: Partial<CreateSparePartPayload>): Promise<SparePart> => {
    const res: any = await apiClient.put(`spare-parts/${id}`, { json: payload }).json();
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`spare-parts/${id}`).json();
  },
};

import { sparePartRepository } from '../repositories/sparePart.repository';
import { ConflictError, NotFoundError } from '../utils/errors';

export const sparePartService = {
  getAllSpareParts: async () => {
    return sparePartRepository.findAll();
  },

  getSparePartById: async (id: string) => {
    const part = await sparePartRepository.findById(id);
    if (!part) throw new NotFoundError('Spare part tidak ditemukan.');
    return part;
  },

  createSparePart: async (body: {
    name: string;
    partNumber: string;
    description?: string;
    stockQuantity?: number;
    minStockLevel?: number;
    unitPrice?: number;
    supplier?: string;
  }) => {
    const existing = await sparePartRepository.findByPartNumber(body.partNumber);
    if (existing) throw new ConflictError('Part Number sudah terdaftar pada spare part lain.');

    return sparePartRepository.create({
      name: body.name,
      partNumber: body.partNumber,
      description: body.description ?? null,
      stockQuantity: body.stockQuantity ?? 0,
      minStockLevel: body.minStockLevel ?? 0,
      unitPrice: body.unitPrice ?? null,
      supplier: body.supplier ?? null,
    });
  },

  updateSparePart: async (
    id: string,
    body: {
      name?: string;
      partNumber?: string;
      description?: string;
      stockQuantity?: number;
      minStockLevel?: number;
      unitPrice?: number;
      supplier?: string;
    },
  ) => {
    const part = await sparePartRepository.findById(id);
    if (!part) throw new NotFoundError('Spare part tidak ditemukan.');

    if (body.partNumber && body.partNumber !== part.partNumber) {
      const existing = await sparePartRepository.findByPartNumber(body.partNumber);
      if (existing) throw new ConflictError('Part Number sudah digunakan oleh spare part lain.');
    }

    return sparePartRepository.update(id, {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.partNumber !== undefined && { partNumber: body.partNumber }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.stockQuantity !== undefined && { stockQuantity: Number(body.stockQuantity) }),
      ...(body.minStockLevel !== undefined && { minStockLevel: Number(body.minStockLevel) }),
      ...(body.unitPrice !== undefined && { unitPrice: Number(body.unitPrice) }),
      ...(body.supplier !== undefined && { supplier: body.supplier }),
    });
  },

  deleteSparePart: async (id: string) => {
    const part = await sparePartRepository.findById(id);
    if (!part) throw new NotFoundError('Spare part tidak ditemukan.');
    return sparePartRepository.delete(id);
  },
};

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { sparePartsApi, type SparePart } from '../../api/spareParts';
import { Package, X, CheckCircle, Loader2, Minus, Plus } from 'lucide-react';

const pmExecutionSchema = z.object({
  description: z.string().min(5, 'Deskripsi wajib diisi (min 5 karakter)'),
  newAssetStatus: z.enum(['Operational', 'UnderMaintenance']).default('Operational'),
});

type PMExecutionSchema = z.infer<typeof pmExecutionSchema>;

interface PMExecutionModalProps {
  assetId: string;
  scheduleId: string;
  scheduleTitle: string;
  onClose: () => void;
}

export default function PMExecutionModal({ assetId, scheduleId, scheduleTitle, onClose }: PMExecutionModalProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PMExecutionSchema>({
    resolver: zodResolver(pmExecutionSchema),
    defaultValues: {
      newAssetStatus: 'Operational',
    }
  });

  const [selectedParts, setSelectedParts] = useState<Array<{ sparePartId: string; quantityUsed: number }>>([]);
  const [searchPart, setSearchPart] = useState('');

  const { data: spareParts, isLoading: loadingParts } = useQuery({
    queryKey: ['spare-parts'],
    queryFn: sparePartsApi.getAll,
  });

  const filteredParts = spareParts?.filter(p => 
    p.name.toLowerCase().includes(searchPart.toLowerCase()) ||
    p.partNumber.toLowerCase().includes(searchPart.toLowerCase())
  ) || [];

  const mutation = useMutation({
    mutationFn: async (data: PMExecutionSchema) => {
      const payload = {
        type: 'Preventive',
        description: `[PM: ${scheduleTitle}] - ${data.description}`,
        technicianName: user?.name || '',
        newAssetStatus: data.newAssetStatus,
        sparePartConsumptions: selectedParts.length > 0 ? selectedParts : undefined,
      };
      const response: any = await apiClient.post(`assets/${assetId}/maintenance`, { json: payload }).json();
      
      await apiClient.post(`schedules/${scheduleId}/execute`, {
        json: {
          technicianName: user?.name || '',
          description: data.description,
        }
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['schedules_upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['spare-parts'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Execute PM error:', error);
      alert('Gagal mengeksekusi PM. ' + (error.message || 'Coba lagi nanti.'));
    }
  });

  const onSubmit = (data: PMExecutionSchema) => {
    mutation.mutate(data);
  };

  const addPart = (part: SparePart) => {
    if (!selectedParts.find(p => p.sparePartId === part.id)) {
      setSelectedParts([...selectedParts, { sparePartId: part.id, quantityUsed: 1 }]);
    }
  };

  const removePart = (partId: string) => {
    setSelectedParts(selectedParts.filter(p => p.sparePartId !== partId));
  };

  const updateQuantity = (partId: string, delta: number) => {
    setSelectedParts(selectedParts.map(p => {
      if (p.sparePartId === partId) {
        const newQty = Math.max(0, p.quantityUsed + delta);
        return newQty > 0 ? { ...p, quantityUsed: newQty } : p;
      }
      return p;
    }).filter(p => p.quantityUsed > 0));
  };

  const getPartDetails = (partId: string) => spareParts?.find(p => p.id === partId);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
          <div className="flex items-center text-green-700">
            <CheckCircle className="w-6 h-6 mr-3" />
            <div>
              <h2 className="text-xl font-bold">Eksekusi Preventive Maintenance</h2>
              <p className="text-sm text-green-600 font-medium">{scheduleTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="pm-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800">
              Catat pelaksanaan servis rutin. Jika ada komponen yang diganti, catat di bawah agar stok otomatis berkurang.
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status Mesin Setelah Servis</label>
              <select {...register('newAssetStatus')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500">
                <option value="Operational">✅ Operational (Kembali Beroperasi)</option>
                <option value="UnderMaintenance">⚠️ Still Under Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Pekerjaan</label>
              <textarea {...register('description')} rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 resize-none" placeholder="Contoh: Pembersihan filter, pelumasan bearing, adjustment V-belt..." />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Komponen Diganti (Opsional)</label>
              
              {selectedParts.length > 0 && (
                <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded-lg">
                  {selectedParts.map(sp => {
                    const part = getPartDetails(sp.sparePartId);
                    return part ? (
                      <div key={sp.sparePartId} className="flex items-center justify-between bg-white p-2 rounded-lg border">
                        <div>
                          <p className="text-sm font-semibold">{part.name}</p>
                          <p className="text-xs text-gray-500">Stok: {part.stockQuantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => updateQuantity(sp.sparePartId, -1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold w-8 text-center">{sp.quantityUsed}</span>
                          <button type="button" onClick={() => updateQuantity(sp.sparePartId, 1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200" disabled={sp.quantityUsed >= part.stockQuantity}>
                            <Plus className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => removePart(sp.sparePartId)} className="ml-2 text-red-500 hover:text-red-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari komponen (V-Belt, Bearing, Sensor...)"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                  value={searchPart}
                  onChange={(e) => setSearchPart(e.target.value)}
                />
                <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {searchPart && filteredParts.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                  {filteredParts.slice(0, 5).map(part => (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => { addPart(part); setSearchPart(''); }}
                      className="w-full px-3 py-2 text-left hover:bg-green-50 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium text-sm">{part.name}</span>
                        <span className="ml-2 text-xs text-gray-500">{part.partNumber}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${part.stockQuantity <= part.minStockLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {part.stockQuantity} unit
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {selectedParts.length > 0 && `${selectedParts.reduce((sum, sp) => sum + sp.quantityUsed, 0)} komponen akan dikurangi dari stok`}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={mutation.isPending} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" form="pm-form" disabled={mutation.isPending} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-md">
              {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><CheckCircle className="w-4 h-4" /> Eksekusi PM</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
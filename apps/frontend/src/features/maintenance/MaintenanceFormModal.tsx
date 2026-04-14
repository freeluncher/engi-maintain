import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const maintenanceSchema = z.object({
  type: z.enum(['Corrective', 'Preventive']),
  description: z.string().min(5, 'Deskripsi kerusakan wajib detail (min 5 karakter)'),
  technicianName: z.string().min(1, 'Nama mekanik/teknisi pelapor wajib diisi'),
  downtimeHours: z.string().optional(),
  newAssetStatus: z.enum(['Operational', 'Breakdown', 'UnderMaintenance']).optional(),
});

type MaintenanceSchema = z.infer<typeof maintenanceSchema>;

interface MaintenanceFormModalProps {
  assetId: string;
  currentStatus: string;
  onClose: () => void;
}

export default function MaintenanceFormModal({ assetId, currentStatus, onClose }: MaintenanceFormModalProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<MaintenanceSchema>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      type: 'Corrective',
      technicianName: user?.name || '',
      newAssetStatus: 'Breakdown'
    }
  });

  const typeValue = watch('type');

  const mutation = useMutation({
    mutationFn: async (data: MaintenanceSchema) => {
      const response: any = await apiClient.post(`assets/${assetId}/maintenance`, {
        json: data // Mengirim payload JSON standar
      }).json();
      return response;
    },
    onSuccess: () => {
      // Invalidate the specific asset to refresh the timeline & current status
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['analytics_dashboard'] });
      onClose();
    },
    onError: (error) => {
      console.error('Submit maintenance error', error);
      alert('Gagal mengirimkan laporan. Coba beberapa saat lagi.');
    }
  });

  const onSubmit = (data: MaintenanceSchema) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
          <div className="flex items-center text-red-600">
            <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold">Laporan Intervensi Maintenance</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form id="maintenance-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-sm text-orange-800">
               Catat detail intervensi mesin untuk rekam jejak. Jika mesin ini rusak total akibat kejadian ini, pastikan status aset menjadi <strong>Breakdown</strong>.
            </div>

            <div className="flex flex-col space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Tindakan *</label>
                <div className="flex gap-4">
                  <label className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 flex-1">
                     <input type="radio" {...register('type')} value="Corrective" className="w-4 h-4 text-blue-600" />
                     <span className="ml-2 text-sm font-semibold">Corrective (Rusak)</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 flex-1">
                     <input type="radio" {...register('type')} value="Preventive" className="w-4 h-4 text-blue-600" />
                     <span className="ml-2 text-sm font-semibold">Preventive (Rutin)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ubah Status Mesin Menjadi / Tetap *</label>
                <select {...register('newAssetStatus')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none transition-all font-semibold text-gray-800">
                   <option value="Breakdown">🚨 Breakdown (Tidak Bisa Beroperasi)</option>
                   <option value="UnderMaintenance">⚠️ Under Maintenance (Sedang Diperbaiki)</option>
                   <option value="Operational">✅ Operational (Beroperasi Normal)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Mekanik Terlibat *</label>
                <input {...register('technicianName')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none" placeholder="Budi Santoso" />
                {errors.technicianName && <p className="text-red-500 text-xs mt-1">{errors.technicianName.message}</p>}
              </div>
              
              {typeValue === 'Corrective' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estimasi Downtime (Jam)</label>
                  <input type="number" step="0.1" {...register('downtimeHours')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none" placeholder="Contoh: 2.5" />
                </div>
              )}

               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Masalah & Solusi *</label>
                <textarea {...register('description')} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none resize-none" placeholder="Pompa pneumatik sebelah kiri macet mengakibatkan kebocoran..." />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} disabled={mutation.isPending} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Batalkan
          </button>
          <button type="submit" form="maintenance-form" disabled={mutation.isPending} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-md shadow-red-500/20 transition-all">
            {mutation.isPending ? 'Merekam Laporan...' : 'Kirim Log Maintenance'}
          </button>
        </div>

      </div>
    </div>
  );
}

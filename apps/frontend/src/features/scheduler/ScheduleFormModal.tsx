import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

const scheduleSchema = z.object({
  title: z.string().min(5, 'Judul jadwal harus jelas'),
  description: z.string().optional(),
  frequencyType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM']),
  startDate: z.string().min(1, 'Pilih tanggal mulai penjadwalan')
});

type ScheduleSchema = z.infer<typeof scheduleSchema>;

interface ScheduleFormModalProps {
  assetId: string;
  onClose: () => void;
}

export default function ScheduleFormModal({ assetId, onClose }: ScheduleFormModalProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<ScheduleSchema>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { frequencyType: 'MONTHLY' }
  });

  const mutation = useMutation({
    mutationFn: async (data: ScheduleSchema) => {
      // payload sesuai ekspektasi controller (title, desc, frequencyType, startdate)
      const response: any = await apiClient.post(`assets/${assetId}/schedules`, {
        json: data
      }).json();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      queryClient.invalidateQueries({ queryKey: ['schedules_upcoming'] });
      onClose();
    },
    onError: (error) => {
      console.error('Submit schedule error', error);
      alert('Gagal meregistrasi jadwal PM.');
    }
  });

  const onSubmit = (data: ScheduleSchema) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
          <div className="flex items-center text-blue-600">
            <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-bold">Atur Jadwal Kalibrasi Rutin</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="schedule-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="flex flex-col space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Kalibrasi / Servis *</label>
                <input {...register('title')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Contoh: Kalibrasi Motor Filter" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Dimulai *</label>
                  <input type="date" {...register('startDate')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Frekuensi *</label>
                  <select {...register('frequencyType')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-gray-800">
                     <option value="DAILY">Harian</option>
                     <option value="WEEKLY">Mingguan</option>
                     <option value="MONTHLY">Bulanan</option>
                     <option value="QUARTERLY">Triwulan (3 Bulan)</option>
                     <option value="YEARLY">Tahunan</option>
                  </select>
                </div>
              </div>

               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Referensi / Deskripsi Opsional</label>
                <textarea {...register('description')} rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" placeholder="Catatan untuk tim terkait..." />
              </div>

            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} disabled={mutation.isPending} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Batalkan
          </button>
          <button type="submit" form="schedule-form" disabled={mutation.isPending} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md transition-all">
            {mutation.isPending ? 'Menyusun...' : 'Simpan Jadwal'}
          </button>
        </div>

      </div>
    </div>
  );
}

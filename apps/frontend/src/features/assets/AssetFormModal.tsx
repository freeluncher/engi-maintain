import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

const assetSchema = z.object({
  name: z.string().min(3, 'Nama aset minimal 3 karakter'),
  brand: z.string().optional(),
  serialNumber: z.string().min(1, 'Serial Number wajib diisi'),
  category: z.string().min(1, 'Kategori wajib dipilih'),
  location: z.string().optional(),
});

type AssetSchema = z.infer<typeof assetSchema>;

interface AssetFormModalProps {
  onClose: () => void;
}

export default function AssetFormModal({ onClose }: AssetFormModalProps) {
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [sopFile, setSopFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState('');

  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<AssetSchema>({
    resolver: zodResolver(assetSchema),
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Ky v2 expects body: FormData for multipart, not json: {}
      const response: any = await apiClient.post('assets', { body: formData }).json();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      onClose();
    },
    onError: (error: any) => {
      console.error(error);
      setPdfError('Gagal menyimpan aset. Periksa koneksi dan ukuran file.');
    }
  });

  const onSubmit = (data: AssetSchema) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('serialNumber', data.serialNumber);
    formData.append('category', data.category);
    
    if (data.brand) formData.append('brand', data.brand);
    if (data.location) formData.append('location', data.location);
    
    if (manualFile) formData.append('manualFile', manualFile);
    if (sopFile) formData.append('sopFile', sopFile);

    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Registrasi Infrastruktur Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="asset-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {pdfError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">{pdfError}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Aset/Mesin *</label>
                <input {...register('name')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="Genset 500kVA" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand / Manufaktur</label>
                <input {...register('brand')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="Caterpillar" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Serial Number *</label>
                <input {...register('serialNumber')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="SN-XXXX-YYYY" />
                {errors.serialNumber && <p className="text-red-500 text-xs mt-1">{errors.serialNumber.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori Utama *</label>
                <select {...register('category')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-700">
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Pneumatic">Pneumatic</option>
                  <option value="Hydraulic">Hydraulic</option>
                  <option value="HVAC">HVAC</option>
                  <option value="IT Infrastructure">IT Infrastructure</option>
                  <option value="Others">Others</option>
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lokasi Spesifik</label>
              <input {...register('location')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="Plant Area 1 - Blok B" />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Dokumen Terlampir (PDF Maks 10MB)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <label className="flex flex-col items-center justify-center cursor-pointer text-sm font-medium text-gray-600">
                    <span className="mb-2 text-blue-600 bg-blue-50 p-2 rounded-full">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </span>
                    <span className="truncate max-w-full px-2">{manualFile ? manualFile.name : 'Upload Manual Manufaktur'}</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setManualFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <label className="flex flex-col items-center justify-center cursor-pointer text-sm font-medium text-gray-600">
                    <span className="mb-2 text-blue-600 bg-blue-50 p-2 rounded-full">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </span>
                    <span className="truncate max-w-full px-2">{sopFile ? sopFile.name : 'Upload SOP Perusahaan'}</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setSopFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            </div>
            
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button onClick={onClose} disabled={mutation.isPending} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Batalkan
          </button>
          <button type="submit" form="asset-form" disabled={mutation.isPending} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center">
            {mutation.isPending ? 'Menyimpan...' : 'Registrasi Aset'}
          </button>
        </div>

      </div>
    </div>
  );
}

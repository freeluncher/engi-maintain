import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Save, Loader2, X, Upload } from 'lucide-react';

const assetSchema = {
  name: '',
  brand: '',
  serialNumber: '',
  category: '',
  location: '',
  status: '',
  purchaseDate: '',
  warrantyEnd: '',
};

export default function AssetEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  
  const [formData, setFormData] = useState(assetSchema);
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [sopFile, setSopFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const response: any = await apiClient.get(`assets/${id}`).json();
      return response.data;
    },
    onSuccess: (data) => {
      setFormData({
        name: data.name || '',
        brand: data.brand || '',
        serialNumber: data.serialNumber || '',
        category: data.category || '',
        location: data.location || '',
        status: data.status || 'Operational',
        purchaseDate: data.purchaseDate ? data.purchaseDate.split('T')[0] : '',
        warrantyEnd: data.warrantyEnd ? data.warrantyEnd.split('T')[0] : '',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('serialNumber', formData.serialNumber);
      fd.append('category', formData.category);
      fd.append('status', formData.status);
      if (formData.brand) fd.append('brand', formData.brand);
      if (formData.location) fd.append('location', formData.location);
      if (formData.purchaseDate) fd.append('purchaseDate', formData.purchaseDate);
      if (formData.warrantyEnd) fd.append('warrantyEnd', formData.warrantyEnd);
      if (manualFile) fd.append('manualFile', manualFile);
      if (sopFile) fd.append('sopFile', sopFile);

      const response: any = await apiClient.put(`assets/${id}`, { body: fd }).json();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      navigate(`/assets/${id}`);
    },
    onError: (err: any) => {
      setError(err.message || 'Gagal menyimpan perubahan');
      setIsSaving(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    updateMutation.mutate();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Aset tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <header className="bg-slate-900 text-white sticky top-0 z-10 shadow-lg">
        <div className="px-4 md:px-8">
          <div className="flex items-center justify-between h-14 md:h-16 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate(`/assets/${id}`)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
              >
                <ArrowLeft size={18} className="text-gray-300" />
              </button>
              <h1 className="text-base md:text-xl font-bold tracking-tight truncate">Edit Aset: {asset.name}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800">Informasi Dasar</h2>
          </div>
          
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Aset/Mesin *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand / Manufaktur</label>
                <input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Serial Number *</label>
                <input
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-700"
                >
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Pneumatic">Pneumatic</option>
                  <option value="Hydraulic">Hydraulic</option>
                  <option value="HVAC">HVAC</option>
                  <option value="IT Infrastructure">IT Infrastructure</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-700"
                >
                  <option value="Operational">Operational</option>
                  <option value="UnderMaintenance">Under Maintenance</option>
                  <option value="Breakdown">Breakdown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lokasi Spesifik</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Pembelian</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Garansi Berakhir</label>
                <input
                  type="date"
                  name="warrantyEnd"
                  value={formData.warrantyEnd}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Dokumen (PDF Maks 10MB) - Kosongkan jika tidak diganti
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <label className="flex flex-col items-center justify-center cursor-pointer text-sm font-medium text-gray-600">
                    <span className="mb-2 text-blue-600 bg-blue-50 p-2 rounded-full">
                      <Upload className="w-5 h-5" />
                    </span>
                    <span className="truncate max-w-full px-2 text-center">
                      {manualFile ? manualFile.name : asset.manualFileUrl ? 'Manual Tersedia' : 'Upload Manual'}
                    </span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setManualFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <label className="flex flex-col items-center justify-center cursor-pointer text-sm font-medium text-gray-600">
                    <span className="mb-2 text-blue-600 bg-blue-50 p-2 rounded-full">
                      <Upload className="w-5 h-5" />
                    </span>
                    <span className="truncate max-w-full px-2 text-center">
                      {sopFile ? sopFile.name : asset.sopFileUrl ? 'SOP Tersedia' : 'Upload SOP'}
                    </span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setSopFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate(`/assets/${id}`)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <X size={16} />
              Batalkan
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
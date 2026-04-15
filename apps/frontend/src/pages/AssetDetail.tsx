import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import MaintenanceFormModal from '../features/maintenance/MaintenanceFormModal';
import ScheduleFormModal from '../features/scheduler/ScheduleFormModal';
import {
  ArrowLeft,
  AlertTriangle,
  CalendarPlus,
  QrCode,
  Download,
  FileText,
  MapPin,
  Cpu,
  Hash,
  Calendar,
  Shield,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';

const STATUS_CONFIG = {
  Operational: { label: 'Beroperasi Normal', dot: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
  UnderMaintenance: { label: 'Sedang Perawatan', dot: 'bg-amber-500 animate-pulse', badge: 'bg-amber-100 text-amber-700' },
  Breakdown: { label: 'Breakdown / Rusak', dot: 'bg-red-500 animate-pulse', badge: 'bg-red-100 text-red-700' },
};

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const role = user?.role || '';

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const { data: asset, isLoading, isError } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const response: any = await apiClient.get(`assets/${id}`).json();
      return response.data;
    },
  });

  const handleDownloadQr = () => {
    if (!asset?.qrCode) return;
    const a = document.createElement('a');
    a.href = asset.qrCode;
    a.download = `QR-${asset.serialNumber}.png`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium text-sm">Memuat informasi aset...</p>
        </div>
      </div>
    );
  }

  if (isError || !asset) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aset Tidak Ditemukan</h2>
          <p className="text-gray-500 mb-6">Aset yang Anda cari mungkin sudah dihapus atau tidak terdaftar.</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold w-full hover:bg-blue-700 transition">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[asset.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Operational;

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* ── Sticky Header ── */}
      <header className="bg-slate-900 text-white sticky top-0 z-10 shadow-lg">
        <div className="px-4 md:px-8">
          <div className="flex items-center justify-between h-14 md:h-16 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
              >
                <ArrowLeft size={18} className="text-gray-300" />
              </button>
              <h1 className="text-base md:text-xl font-bold tracking-tight truncate">{asset.name}</h1>
            </div>

            {/* Action buttons per role */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Engineer: Lapor Kerusakan */}
              {role === 'Engineer' && (
                <button
                  onClick={() => setIsMaintenanceModalOpen(true)}
                  className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors shadow-sm"
                >
                  <AlertTriangle size={15} />
                  <span className="hidden sm:inline">Lapor Kerusakan</span>
                  <span className="sm:hidden">Lapor</span>
                </button>
              )}

              {/* Admin: Jadwal PM + Edit */}
              {role === 'Admin' && (
                <>
                  <button
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors"
                  >
                    <CalendarPlus size={15} />
                    <span className="hidden sm:inline">Jadwal PM</span>
                  </button>
                  <button
                    onClick={() => navigate(`/assets/${asset.id}/edit`)}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 transition-colors"
                    title="Edit Aset"
                  >
                    <Pencil size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* ── Status Banner ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Status Operasional</p>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${statusCfg.badge}`}>
              <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{asset.brand || '—'}</span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs font-semibold">{asset.category}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Main Content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Asset Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Informasi Aset</h3>
              </div>
              <div className="p-5">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: 'Serial Number', value: <span className="font-mono font-bold bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200 text-sm">{asset.serialNumber}</span>, icon: <Hash size={14} /> },
                    { label: 'Lokasi Fisik', value: asset.location || '—', icon: <MapPin size={14} /> },
                    { label: 'Tanggal Pembelian', value: asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '—', icon: <Calendar size={14} /> },
                    { label: 'Garansi Berakhir', value: asset.warrantyEnd ? new Date(asset.warrantyEnd).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '—', icon: <Shield size={14} /> },
                    { label: 'Kategori', value: asset.category, icon: <Cpu size={14} /> },
                    { label: 'Brand', value: asset.brand || '—', icon: <Cpu size={14} /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label}>
                      <dt className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {icon} {label}
                      </dt>
                      <dd className="text-sm text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Document links */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-2">
                {asset.manualFileUrl ? (
                  <a href={`http://localhost:5000${asset.manualFileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-xs font-semibold">
                    <FileText size={13} /> Manual Mesin
                  </a>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-gray-100 text-gray-400 rounded-lg text-xs font-semibold">
                    <FileText size={13} /> Manual Tidak Tersedia
                  </span>
                )}
                {asset.sopFileUrl && (
                  <a href={`http://localhost:5000${asset.sopFileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-xs font-semibold">
                    <FileText size={13} /> SOP Mesin
                  </a>
                )}
              </div>
            </div>

            {/* Maintenance History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Histori Pemeliharaan</h3>
              </div>
              <div className="p-5">
                {asset.maintenanceLogs && asset.maintenanceLogs.length > 0 ? (
                  <div className="relative border-l-2 border-gray-200 ml-3 space-y-7">
                    {asset.maintenanceLogs.map((log: any) => (
                      <div key={log.id} className="relative pl-6">
                        <span className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white ${log.type === 'Corrective' ? 'bg-red-500' : 'bg-blue-500'}`} />
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-gray-900">
                            {log.type === 'Corrective' ? '🔧 Perbaikan Breakdown' : '✅ Perawatan Rutin'}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.type === 'Corrective' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {log.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          {new Date(log.maintenanceDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {' • '}Teknisi: <span className="font-semibold">{log.technicianName}</span>
                          {log.downtimeHours ? ` • Downtime: ${log.downtimeHours} jam` : ''}
                        </p>
                        <p className="text-sm text-gray-700">{log.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-sm">Belum ada riwayat perbaikan pada mesin ini.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="space-y-4">

            {/* QR Code — semua role bisa download */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-center">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <QrCode size={16} className="text-gray-500" />
                <h3 className="font-bold text-gray-800 text-sm">QR Code Identitas</h3>
              </div>
              <div className="p-5 flex flex-col items-center">
                {asset.qrCode ? (
                  <>
                    <div className="p-2 border border-gray-200 rounded-xl bg-white shadow-sm mb-3">
                      <img src={asset.qrCode} alt={`QR ${asset.serialNumber}`} className="w-44 h-44 object-contain" />
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Scan untuk buka halaman ini langsung.</p>
                    <button
                      onClick={handleDownloadQr}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                    >
                      <Download size={14} /> Unduh QR Code
                    </button>
                  </>
                ) : (
                  <div className="py-8 text-gray-400 text-sm">QR Code belum digenerate.</div>
                )}
              </div>
            </div>

            {/* Admin-only actions */}
            {role === 'Admin' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 text-sm">Aksi Admin</h3>
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <button
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-left"
                  >
                    <CalendarPlus size={15} className="text-blue-500" /> Jadwalkan PM Rutin
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition text-left">
                    <Pencil size={15} className="text-gray-400" /> Edit Spesifikasi Aset
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition text-left">
                    <Trash2 size={15} /> Pensiunkan / Hapus Aset
                  </button>
                </div>
              </div>
            )}

            {/* Engineer-only quick action */}
            {role === 'Engineer' && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Laporan Cepat</p>
                <p className="text-sm text-red-700 mb-3">
                  Temukan kerusakan? Laporkan sekarang agar tim dapat segera ditindaklanjuti.
                </p>
                <button
                  onClick={() => setIsMaintenanceModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-bold transition active:scale-95"
                >
                  <AlertTriangle size={15} /> Lapor Kerusakan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMaintenanceModalOpen && (
        <MaintenanceFormModal
          assetId={asset.id}
          currentStatus={asset.status}
          onClose={() => setIsMaintenanceModalOpen(false)}
        />
      )}

      {isScheduleModalOpen && (
        <ScheduleFormModal
          assetId={asset.id}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}
    </div>
  );
}

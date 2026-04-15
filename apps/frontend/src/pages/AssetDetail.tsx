import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import MaintenanceFormModal from '../features/maintenance/MaintenanceFormModal';
import ScheduleFormModal from '../features/scheduler/ScheduleFormModal';

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const { data: asset, isLoading, isError } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const response: any = await apiClient.get(`assets/${id}`).json();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
         <div className="flex flex-col items-center">
            <svg className="w-10 h-10 animate-spin text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 font-medium">Memuat Informasi Aset...</p>
         </div>
      </div>
    );
  }

  if (isError || !asset) {
    return (
      <div className="flex h-screen bg-gray-50 justify-center items-center">
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Aset Tidak Ditemukan</h2>
            <p className="text-gray-500 mb-6">Aset yang Anda cari mungkin sudah dihapus atau tidak terdaftar.</p>
            <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold w-full hover:bg-blue-700 transition">Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => navigate('/')} className="mr-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold tracking-tight truncate">{asset.name}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setIsMaintenanceModalOpen(true)} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors shadow-sm shadow-red-500/20">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Lapor Kerusakan
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Main Content (Left) */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Quick Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
               <div className="flex-1">
                 <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Status Operasional</p>
                 <div className="flex items-center">
                    {asset.status === 'Operational' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center"><span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></span> Beroperasi Normal</span>}
                    {asset.status === 'UnderMaintenance' && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold flex items-center"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-2"></span> Sedang Perawatan</span>}
                    {asset.status === 'Breakdown' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold flex items-center"><span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2 animate-pulse"></span> Breakdown / Rusak</span>}
                 </div>
               </div>
               <div className="flex-1">
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Spesifikasi</p>
                  <p className="text-gray-900 font-medium">{asset.brand || 'No Brand'} &bull; {asset.category}</p>
               </div>
            </div>

            {/* General Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 text-lg">Informasi Aset</h3>
               </div>
               <div className="p-6">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                      <dd className="mt-1 text-base font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md w-max border border-gray-200">{asset.serialNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Lokasi Fisik</dt>
                      <dd className="mt-1 text-base text-gray-900 flex items-center font-medium">
                        <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {asset.location || '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tanggal Akuisisi / Pembelian</dt>
                      <dd className="mt-1 text-base text-gray-900">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('id-ID') : '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Masa Garansi Berakhir</dt>
                      <dd className="mt-1 text-base text-gray-900">{asset.warrantyEnd ? new Date(asset.warrantyEnd).toLocaleDateString('id-ID') : '-'}</dd>
                    </div>
                  </dl>
               </div>
               
               {/* Document Attachments */}
               <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex gap-4">
                  {asset.manualFileUrl ? (
                    <a href={`http://localhost:5000${asset.manualFileUrl}`} target="_blank" rel="noreferrer" className="flex items-center px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-semibold">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Lihat Manual
                    </a>
                  ) : (
                    <button className="flex items-center px-4 py-2 border border-gray-200 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed text-sm font-semibold" disabled>
                      Manual Tidak Tersedia
                    </button>
                  )}

                  {asset.sopFileUrl ? (
                     <a href={`http://localhost:5000${asset.sopFileUrl}`} target="_blank" rel="noreferrer" className="flex items-center px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-semibold">
                     <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                     Lihat SOP Mesin
                   </a>
                  ) : null}
               </div>
            </div>

            {/* Maintenance History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 text-lg">Histori Pemeliharaan Terakhir</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-semibold">Lihat Semua</button>
               </div>
               <div className="p-6">
                  {asset.maintenanceLogs && asset.maintenanceLogs.length > 0 ? (
                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                       {asset.maintenanceLogs.map((log: any, idx: number) => (
                         <div key={idx} className="relative pl-6">
                           <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></span>
                           <p className="text-sm font-bold text-gray-900">{log.type === 'Corrective' ? 'Perbaikan Breakdown' : 'Perawatan Rutin'}</p>
                           <p className="text-xs font-semibold text-gray-500 mb-2">{new Date(log.maintenanceDate).toLocaleDateString('id-ID')} &bull; Teknisi: {log.technicianName}</p>
                           <p className="text-sm text-gray-700">{log.description}</p>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Belum ada riwayat perbaikan pada mesin ini.</p>
                    </div>
                  )}
               </div>
            </div>

          </div>

          {/* Sidebar (Right) */}
          <div className="w-full lg:w-1/3 space-y-6">
             {/* QR Code Action Item */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-800">QR Code Identitas</h3>
                </div>
                <div className="p-6 flex flex-col items-center">
                   {asset.qrCode ? (
                     <>
                       <div className="p-2 border border-gray-200 rounded-2xl bg-white shadow-sm mb-4">
                         <img src={asset.qrCode} alt={`QR Code ${asset.serialNumber}`} className="w-48 h-48 object-contain" />
                       </div>
                       <p className="text-sm text-gray-500 mb-4 max-w-50">Cetak QR Code ini dan tempel pada fisik aset untuk quick-scan.</p>
                       <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition w-full">Unduh QR Code</button>
                     </>
                   ) : (
                     <div className="p-8 text-gray-400 flex flex-col items-center">
                        <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" /></svg>
                        <p className="text-sm">QR Code belum digenerate</p>
                     </div>
                   )}
                </div>
             </div>
             
             {/* Admin Actions */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-800">Aksi Administratif</h3>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <button onClick={() => setIsScheduleModalOpen(true)} className="text-left px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-sm font-semibold text-gray-700 transition flex items-center justify-between group">
                     Jadwalkan PM Rutin 
                     <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                  <button className="text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700 transition">Ubah Spesifikasi</button>
                  <button className="text-left px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-semibold text-red-600 transition">Pensiunkan / Hapus Aset</button>
                </div>
             </div>
             
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

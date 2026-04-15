import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import AssetFormModal from '../features/assets/AssetFormModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const user = useAuthStore((s) => s.user);
  const role = user?.role || '';

  // Raw assets query for the table below
  const { data: assetsData, isLoading: assetsLoading, isError: assetsError } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const response: any = await apiClient.get('assets').json();
      return response.data;
    },
  });

  // Analytics query for the insight charts
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics_dashboard'],
    queryFn: async () => {
      const response: any = await apiClient.get('analytics/dashboard').json();
      return response.data;
    },
  });

  // Fetch Upcoming Alerts
  const { data: alertsData } = useQuery({
    queryKey: ['schedules_upcoming'],
    queryFn: async () => {
      const response: any = await apiClient.get('schedules/upcoming').json();
      return response.data;
    },
  });

  // Filter assets based on search and status
  const filteredAssets = useMemo(() => {
    if (!assetsData) return [];
    let result = assetsData;
    if (search) {
      const query = search.toLowerCase();
      result = result.filter((a: any) =>
        a.name.toLowerCase().includes(query) ||
        a.serialNumber?.toLowerCase().includes(query) ||
        a.category?.toLowerCase().includes(query) ||
        a.location?.toLowerCase().includes(query) ||
        a.brand?.toLowerCase().includes(query)
      );
    }
    if (filterStatus) {
      result = result.filter((a: any) => a.status === filterStatus);
    }
    return result;
  }, [assetsData, search, filterStatus]);

  // Get unique statuses
  const statusOptions = useMemo(() => {
    if (!assetsData) return [];
    return Array.from(new Set(assetsData.map((a: any) => a.status)));
  }, [assetsData]);

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h2>
          <p className="text-xs text-gray-500 mt-0.5 hidden md:block">Selamat datang kembali, {user?.name}</p>
        </div>
        {role === 'Admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm shadow-blue-500/30 active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah Aset</span>
          </button>
        )}
      </header>

      {/* Content Wrapper */}
      <div className="flex-1 overflow-auto p-8">

        {/* Analytics Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Left Metrics */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden h-36 flex flex-col justify-center">
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
              <p className="text-sm font-semibold text-gray-500">Ketersediaan Mesin (Availability)</p>
              <div className="flex items-baseline mt-2">
                <h3 className="text-4xl font-black text-gray-900">{analyticsData?.availability?.rate || 0}%</h3>
                <span className="ml-2 text-sm text-gray-500 font-medium">dari {analyticsData?.availability?.total || 0} Aset</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden h-36 flex flex-col justify-center">
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-red-400"></div>
              <p className="text-sm font-semibold text-gray-500">Downtime 30 Hari Terakhir</p>
              <div className="flex items-baseline mt-2">
                <h3 className="text-4xl font-black text-gray-900">{analyticsData?.downtime?.hours || 0}</h3>
                <span className="ml-2 text-sm text-gray-500 font-medium">Jam Total</span>
              </div>
            </div>
          </div>

          {/* Right Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] lg:col-span-2 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Distribusi Kategori Infrastruktur</h3>
            <div className="w-full" style={{ minHeight: '256px' }}>
              <ResponsiveContainer width="100%" height={256}>
                <PieChart>
                  <Pie
                    data={analyticsData?.categoryDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analyticsData?.categoryDistribution?.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} Aset`, 'Jumlah']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Assets Table */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 gap-4 flex-wrap">
              <h3 className="text-lg font-bold text-gray-800">Daftar Infrastruktur</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari mesin..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow w-48"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Semua Status</option>
                  {statusOptions.map((status: string) => (
                    <option key={status} value={status}>
                      {status === 'Operational' ? 'Beroperasi' :
                       status === 'UnderMaintenance' ? 'Perawatan' :
                       status === 'Breakdown' ? 'Rusak' : 'Pensiun'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              {assetsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <svg className="w-8 h-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : assetsError ? (
                <div className="flex justify-center items-center h-64 text-red-500 font-semibold bg-red-50/50 p-4">
                  Gagal mendapatkan data aset. Info Error: {assetsError instanceof Error ? assetsError.message : String(assetsError)}
                </div>
              ) : (
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Informasi Aset</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Lokasi</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 rounded-tr-lg">Aksi</th>
                    </tr>
                  </thead>
<tbody className="divide-y divide-gray-100">
                      {filteredAssets.map((asset: any) => (
                      <tr key={asset.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 text-base">{asset.name}</div>
                          <div className="text-gray-500 mt-1 flex items-center">
                            <span className="font-medium mr-2">{asset.brand}</span>
                            <span className="font-mono text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">{asset.serialNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top pt-5">
                          <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold whitespace-nowrap">
                            {asset.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top pt-5">
                          <span className="text-gray-600 font-medium flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {asset.location}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top pt-5">
                          {asset.status === 'Operational' ? (
                            <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold flex items-center w-max border border-green-100">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Beroperasi
                            </span>
                          ) : asset.status === 'UnderMaintenance' ? (
                            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold flex items-center w-max border border-amber-100">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span> Perawatan
                            </span>
                          ) : asset.status === 'Breakdown' ? (
                            <span className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold flex items-center w-max border border-red-100">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span> Rusak
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-semibold flex items-center w-max border border-gray-200">
                              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span> Pensiun
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top pt-5">
                          <Link to={`/assets/${asset.id}`} className="text-gray-600 hover:text-blue-800 font-bold text-sm mr-4 transition-colors opacity-80 group-hover:opacity-100 focus:opacity-100">
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {(!filteredAssets || filteredAssets.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="font-medium text-gray-800">
                            {search || filterStatus ? 'Tidak ada hasil pencarian' : 'Tidak ada data aset'}
                          </p>
                          <p className="mt-1 text-sm">
                            {search || filterStatus ? 'Coba kata kunci lain atau filter berbeda' : 'Tambahkan aset pertama Anda untuk mulai mengelola.'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination (dummy footer) */}
            {filteredAssets && filteredAssets.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm text-gray-500">
                <div>
                  Menampilkan <span className="font-semibold text-gray-900">{filteredAssets.length}</span> infrastruktur
                  {(search || filterStatus) && <span className="text-xs ml-1">(dari {assetsData?.length || 0} total)</span>}
                </div>
                <div className="flex space-x-2">
                  <button className="px-3.5 py-1.5 border border-gray-200 rounded-lg hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none" disabled>Sebelumnya</button>
                  <button className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm transition-all shadow-sm">Selanjutnya</button>
                </div>
              </div>
            )}
          </div>

          {/* PM Schedule Alerts Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-blue-50/50 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-800">Upcoming Maintenance</h3>
              </div>

              <div className="p-4 flex flex-col gap-3">
                {!alertsData || alertsData.length === 0 ? (
                  <div className="text-center p-6 text-gray-500">
                    <p className="text-sm">Tidak ada jadwal kalibrasi dalam 7 hari ke depan.</p>
                  </div>
                ) : (
                  alertsData.map((alert: any) => (
                    <div key={alert.id} className={`p-4 rounded-xl border ${alert.isOverdue ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100 shadow-sm'} flex flex-col`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${alert.isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {alert.statusFlag}
                        </span>
                        <span className={`text-xs font-semibold ${alert.isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                          {new Date(alert.nextDueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{alert.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{alert.asset.name} ({alert.asset.serialNumber})</p>

                      <Link to={`/assets/${alert.asset.id}`} className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center group">
                        Eksekusi PM
                        <svg className="w-3 h-3 ml-1 translate-x-0 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal - Render conditionally */}
      {isModalOpen && <AssetFormModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
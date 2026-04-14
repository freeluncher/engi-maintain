
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';

export default function Assets() {
  const { data: assetsData, isLoading, isError } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const response: any = await apiClient.get('assets').json();
      return response.data;
    },
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Daftar Aset</h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Daftar Infrastruktur</h3>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </span>
                <input type="text" placeholder="Cari mesin..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow w-64" />
              </div>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <svg className="w-8 h-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : isError ? (
                <div className="flex justify-center items-center h-64 text-red-500 font-semibold bg-red-50/50 p-4">
                  Gagal memuat data aset.
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
                    {assetsData?.map((asset: any) => (
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
                    {(!assetsData || assetsData.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                          </div>
                          <p className="font-medium text-gray-800">Tidak ada data aset</p>
                          <p className="mt-1 text-sm">Tambahkan aset pertama Anda untuk mulai mengelola.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

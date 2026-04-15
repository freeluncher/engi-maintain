import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Package, Wrench, ChevronRight, ShieldCheck, Search } from 'lucide-react';
import { usersApi } from '../../api/users';
import { sparePartsApi } from '../../api/spareParts';
import { apiClient } from '../../api/client';
import { useState, useMemo } from 'react';
import type { Asset } from '../../types/asset';

export default function AdminPanel() {
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: usersApi.getAll });
  const { data: spareParts } = useQuery({ queryKey: ['spare-parts'], queryFn: sparePartsApi.getAll });
  const { data: assets } = useQuery({ queryKey: ['assets'], queryFn: async () => {
    const response = await apiClient.get('assets').json();
    return response.data as Asset[];
  }});

  const [searchQuery, setSearchQuery] = useState('');
  
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !assets) return [];
    const query = searchQuery.toLowerCase();
    return assets.filter((a: Asset) =>
      a.name.toLowerCase().includes(query) ||
      a.serialNumber?.toLowerCase().includes(query) ||
      a.category?.toLowerCase().includes(query) ||
      a.location?.toLowerCase().includes(query) ||
      a.brand?.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [assets, searchQuery]);

  const cards = [
    {
      title: 'Manajemen User',
      desc: 'Buat & kelola akun Engineer, Manager, dan Admin.',
      icon: <Users size={28} className="text-purple-400" />,
      to: '/admin/users',
      badge: `${users?.length ?? 0} akun`,
      color: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
      iconBg: 'bg-purple-500/10',
    },
    {
      title: 'Library Spare Parts',
      desc: 'Kelola master daftar komponen & pantau stok minimum.',
      icon: <Package size={28} className="text-emerald-400" />,
      to: '/admin/spare-parts',
      badge: `${spareParts?.length ?? 0} item`,
      color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
    },
    {
      title: 'Onboarding Aset',
      desc: 'Daftarkan mesin baru ke sistem dengan QR Code.',
      icon: <Wrench size={28} className="text-blue-400" />,
      to: '/assets',
      badge: 'Kelola Aset',
      color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
      iconBg: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center gap-3">
        <ShieldCheck size={22} className="text-purple-500" />
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Panel Admin</h2>
          <p className="text-xs text-gray-500 mt-0.5">Konfigurasi sistem dan manajemen data master</p>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total User', value: users?.length ?? 0, color: 'text-purple-600' },
            { label: 'Admin', value: users?.filter((u) => u.role === 'Admin').length ?? 0, color: 'text-purple-500' },
            { label: 'Manager', value: users?.filter((u) => u.role === 'Manager').length ?? 0, color: 'text-blue-500' },
            { label: 'Engineer', value: users?.filter((u) => u.role === 'Engineer').length ?? 0, color: 'text-emerald-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search Infrastructure */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Search size={16} className="text-blue-500" />
            <h3 className="text-sm font-bold text-gray-800">Pencarian Infrastruktur</h3>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama, SN, kategori, atau lokasi..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          {searchQuery && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((asset: Asset) => (
                    <Link
                      key={asset.id}
                      to={`/assets/${asset.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setSearchQuery('')}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{asset.name}</p>
                        <p className="text-xs text-gray-500">
                          {asset.serialNumber} • {asset.category}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                        asset.status === 'Operational' ? 'bg-green-100 text-green-700' :
                        asset.status === 'UnderMaintenance' ? 'bg-amber-100 text-amber-700' :
                        asset.status === 'Breakdown' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {asset.status === 'Operational' ? 'Aktif' :
                         asset.status === 'UnderMaintenance' ? 'Maintenance' :
                         asset.status === 'Breakdown' ? 'Rusak' : 'Pensiun'}
                      </span>
                    </Link>
                  ))}
                  {assets && assets.length > 5 && (
                    <Link
                      to="/assets"
                      className="block text-center text-sm text-blue-600 font-semibold pt-2 hover:text-blue-700"
                      onClick={() => setSearchQuery('')}
                    >
                      Lihat semua ({assets.length}) →
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">Tidak ada hasil</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation Cards */}
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Kelola Sistem</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className={`group flex flex-col p-5 rounded-2xl bg-gradient-to-br border ${card.color} hover:shadow-md transition-all duration-200 hover:scale-[1.01]`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>{card.icon}</div>
                <span className="text-xs font-semibold bg-white/60 border border-gray-200 text-gray-600 px-2 py-1 rounded-lg">
                  {card.badge}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-1">{card.title}</h4>
              <p className="text-sm text-gray-500 flex-1">{card.desc}</p>
              <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 group-hover:gap-2 gap-1 transition-all">
                Kelola <ChevronRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

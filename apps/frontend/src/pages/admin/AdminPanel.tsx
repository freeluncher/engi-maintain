import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Package, Wrench, ChevronRight, ShieldCheck } from 'lucide-react';
import { usersApi } from '../../api/users';
import { sparePartsApi } from '../../api/spareParts';

export default function AdminPanel() {
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: usersApi.getAll });
  const { data: spareParts } = useQuery({ queryKey: ['spare-parts'], queryFn: sparePartsApi.getAll });

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

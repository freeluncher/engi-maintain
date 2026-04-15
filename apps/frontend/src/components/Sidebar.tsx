import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Wrench,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles: string[];
  matchStart?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/',
    icon: <LayoutDashboard size={20} />,
    roles: ['Admin', 'Manager', 'Engineer'],
  },
  {
    label: 'Daftar Aset',
    to: '/assets',
    icon: <Wrench size={20} />,
    roles: ['Admin', 'Manager', 'Engineer'],
    matchStart: true,
  },
  {
    label: 'Laporan & Analitik',
    to: '/reports',
    icon: <BarChart3 size={20} />,
    roles: ['Admin', 'Manager'],
  },
];

const ADMIN_ITEMS: NavItem[] = [
  {
    label: 'Panel Admin',
    to: '/admin',
    icon: <ShieldCheck size={20} />,
    roles: ['Admin'],
  },
  {
    label: 'Manajemen User',
    to: '/admin/users',
    icon: <Users size={20} />,
    roles: ['Admin'],
  },
  {
    label: 'Library Spare Parts',
    to: '/admin/spare-parts',
    icon: <Package size={20} />,
    roles: ['Admin'],
  },
];

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  Admin: { label: 'Admin', color: 'bg-purple-500/20 text-purple-300 border border-purple-500/40' },
  Manager: { label: 'Manager', color: 'bg-blue-500/20 text-blue-300 border border-blue-500/40' },
  Engineer: { label: 'Engineer', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' },
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = user?.role || '';

  const isActive = (item: NavItem) =>
    item.matchStart ? pathname.startsWith(item.to) : pathname === item.to;

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      active
        ? 'bg-blue-600/20 text-blue-400 shadow-inner'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(role));
  const visibleAdmin = ADMIN_ITEMS.filter((item) => item.roles.includes(role));

  const badge = ROLE_BADGE[role];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <h1 className="text-xl font-black tracking-tight text-white">
          Engi<span className="text-blue-400">Maintain</span>
        </h1>
        <p className="text-[10px] text-slate-500 mt-0.5 tracking-widest uppercase">
          Maintenance System
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* General nav */}
        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          Menu Utama
        </p>
        {visibleNav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={linkClass(isActive(item))}
            onClick={() => setMobileOpen(false)}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {isActive(item) && <ChevronRight size={14} className="text-blue-400" />}
          </Link>
        ))}

        {/* Admin-only section */}
        {visibleAdmin.length > 0 && (
          <>
            <div className="pt-3 pb-1">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Administrasi
              </p>
            </div>
            {visibleAdmin.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={linkClass(isActive(item))}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {isActive(item) && <ChevronRight size={14} className="text-blue-400" />}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-3">
        <div className="bg-slate-800/60 rounded-xl p-3 flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            {badge && (
              <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 ${badge.color}`}>
                {badge.label}
              </span>
            )}
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile: Hamburger trigger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700"
        aria-label="Buka menu"
      >
        <Menu size={20} />
      </button>

      {/* ── Mobile: Overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: Drawer ── */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* ── Desktop: Fixed sidebar ── */}
      <aside className="hidden md:flex w-60 bg-slate-900 flex-col min-h-screen shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
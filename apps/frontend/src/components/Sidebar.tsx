import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { pathname } = useLocation();

  const navLinkClass = (isActive: boolean) =>
    `flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${
      isActive
        ? 'bg-blue-600/20 text-blue-400'
        : 'text-gray-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wider text-blue-400">
          Engi<span className="text-white">Maintain</span>
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link
          to="/"
          className={navLinkClass(pathname === '/')}
          aria-current={pathname === '/' ? 'page' : undefined}
        >
          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Dashboard
        </Link>
        <Link
          to="/assets"
          className={navLinkClass(pathname.startsWith('/assets'))}
          aria-current={pathname.startsWith('/assets') ? 'page' : undefined}
        >
          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Aset
        </Link>
        <button
          className="w-full flex items-center px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors cursor-not-allowed opacity-50"
          title="Coming Soon"
          type="button"
          tabIndex={-1}
          aria-disabled="true"
        >
          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Tugas Pemeliharaan
        </button>
      </nav>
      <div className="p-4">
        <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="overflow-hidden mr-2">
            <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role || 'Operator'}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/20 transition-colors shrink-0"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type User, type CreateUserPayload } from '../../api/users';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  UserCircle,
  BarChart3,
  Wrench,
  Loader2,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';

const ROLE_CONFIG = {
  Admin: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <ShieldCheck size={12} /> },
  Manager: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <BarChart3 size={12} /> },
  Engineer: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <Wrench size={12} /> },
};

type FormState = CreateUserPayload & { id?: string };

const DEFAULT_FORM: FormState = { email: '', name: '', password: '', role: 'Engineer' };

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const createMut = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); closeModal(); },
    onError: (e: any) => setError(e?.message || 'Gagal membuat user.'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: FormState) => usersApi.update(id!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); closeModal(); },
    onError: (e: any) => setError(e?.message || 'Gagal memperbarui user.'),
  });

  const deleteMut = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setDeleteConfirm(null); },
  });

  const openCreate = () => { setForm(DEFAULT_FORM); setError(''); setShowPw(false); setModal('create'); };
  const openEdit = (u: User) => { setForm({ id: u.id, email: u.email, name: u.name, password: '', role: u.role }); setError(''); setShowPw(false); setModal('edit'); };
  const closeModal = () => { setModal(null); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (modal === 'create') createMut.mutate(form);
    else updateMut.mutate(form);
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={22} className="text-purple-500" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Manajemen User</h2>
            <p className="text-xs text-gray-500 mt-0.5">{users.length} akun terdaftar</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah User</span>
        </button>
      </header>

      <div className="p-4 md:p-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* Mobile: Card list */}
            <div className="md:hidden space-y-3">
              {users.map((u) => {
                const rc = ROLE_CONFIG[u.role];
                return (
                  <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{u.name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${rc.color}`}>
                        {rc.icon} {u.role}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-50">
                      <button onClick={() => openEdit(u)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                        <Pencil size={14} /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirm(u)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Pengguna</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Dibuat</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => {
                    const rc = ROLE_CONFIG[u.role];
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-gray-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${rc.color}`}>
                            {rc.icon} {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(u)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => setDeleteConfirm(u)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">
                {modal === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
              </h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 font-medium">
                  {error}
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Budi Santoso"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="budi@perusahaan.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Password {modal === 'edit' && <span className="normal-case font-normal text-gray-400">(kosongkan jika tidak diubah)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required={modal === 'create'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={modal === 'create' ? 'Minimal 8 karakter' : '••••••••'}
                    className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition bg-white"
                >
                  <option value="Engineer">Engineer / Teknisi</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {modal === 'create' ? 'Buat Akun' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="text-center font-bold text-gray-900 text-lg">Hapus Pengguna?</h3>
            <p className="text-center text-sm text-gray-500 mt-2 mb-6">
              Akun <span className="font-semibold text-gray-800">{deleteConfirm.name}</span> akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => deleteMut.mutate(deleteConfirm.id)}
                disabled={deleteMut.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition disabled:opacity-60"
              >
                {deleteMut.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

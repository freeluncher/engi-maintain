import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, type Category, type CreateCategoryPayload } from '../../api/categories';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Save,
  Cpu,
} from 'lucide-react';

type FormState = Partial<CreateCategoryPayload> & { id?: string };
const DEFAULT_FORM: FormState = { name: '', description: '' };

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [search, setSearch] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const createMut = useMutation({
    mutationFn: (d: CreateCategoryPayload) => categoriesApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); closeModal(); },
    onError: (e: any) => setError(e?.message || 'Gagal membuat kategori.'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...d }: FormState) => categoriesApi.update(id!, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); closeModal(); },
    onError: (e: any) => setError(e?.message || 'Gagal memperbarui kategori.'),
  });

  const deleteMut = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setDeleteConfirm(null); },
  });

  const openCreate = () => { setForm(DEFAULT_FORM); setError(''); setModal('create'); };
  const openEdit = (c: Category) => {
    setForm({ id: c.id, name: c.name, description: c.description || '' });
    setError('');
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal === 'create') createMut.mutate(form);
    else updateMut.mutate(form);
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cpu size={22} className="text-purple-500" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Master Kategori</h2>
            <p className="text-xs text-gray-500 mt-0.5">Kelola kategori mesin & infrastruktur</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah Kategori</span>
        </button>
      </header>

      <div className="p-4 md:p-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center gap-4">
            <input
              type="text"
              placeholder="Cari kategori..."
              className="flex-1 max-w-xs px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="text-xs text-gray-500">{filteredCategories.length} kategori</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-7 h-7 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredCategories.map((category) => (
                <div key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-purple-500 shrink-0" />
                      <span className="font-semibold text-gray-900">{category.name}</span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-0.5 ml-6">{category.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(category)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {filteredCategories.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <Tag size={32} className="mb-2 text-gray-300" />
                  <p className="text-sm">
                    {search ? 'Tidak ada kategori yang cocok' : 'Belum ada kategori'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {modal === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Contoh: Mechanical, Electrical, CNC"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Deskripsi opsional..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50"
                >
                  {isPending ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Save size={16} /> Simpan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Kategori?</h3>
              <p className="text-sm text-gray-500">
                Kategori "{deleteConfirm.name}" akan dihapus. Pastikan tidak ada aset yang menggunakan kategori ini.
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => deleteMut.mutate(deleteConfirm.id)}
                disabled={deleteMut.isPending}
                className="flex-1 px-5 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 border-l border-red-700"
              >
                {deleteMut.isPending ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
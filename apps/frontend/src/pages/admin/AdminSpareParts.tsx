import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sparePartsApi, type SparePart, type CreateSparePartPayload } from '../../api/spareParts';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Save,
  AlertTriangle,
} from 'lucide-react';

type FormState = Partial<CreateSparePartPayload> & { id?: string };
const DEFAULT_FORM: FormState = {
  name: '',
  partNumber: '',
  description: '',
  stockQuantity: 0,
  minStockLevel: 0,
  unitPrice: undefined,
  supplier: '',
};

export default function AdminSpareParts() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<SparePart | null>(null);
  const [search, setSearch] = useState('');

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['spare-parts'],
    queryFn: sparePartsApi.getAll,
  });

  const createMut = useMutation({
    mutationFn: (d: CreateSparePartPayload) => sparePartsApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['spare-parts'] }); closeModal(); },
    onError: (e: any) => setError(e?.message || 'Gagal menyimpan spare part.'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...d }: FormState) => sparePartsApi.update(id!, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['spare-parts'] }); closeModal(); },
    onError: (e: any) => setError(e?.message || 'Gagal memperbarui spare part.'),
  });

  const deleteMut = useMutation({
    mutationFn: sparePartsApi.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['spare-parts'] }); setDeleteConfirm(null); },
  });

  const openCreate = () => { setForm(DEFAULT_FORM); setError(''); setModal('create'); };
  const openEdit = (p: SparePart) => {
    setForm({ id: p.id, name: p.name, partNumber: p.partNumber, description: p.description || '', stockQuantity: p.stockQuantity, minStockLevel: p.minStockLevel, unitPrice: p.unitPrice ?? undefined, supplier: p.supplier || '' });
    setError(''); setModal('edit');
  };
  const closeModal = () => { setModal(null); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, stockQuantity: Number(form.stockQuantity || 0), minStockLevel: Number(form.minStockLevel || 0), unitPrice: form.unitPrice ? Number(form.unitPrice) : undefined };
    if (modal === 'create') createMut.mutate(payload as CreateSparePartPayload);
    else updateMut.mutate(payload);
  };

  const filtered = parts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.partNumber.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplier || '').toLowerCase().includes(search.toLowerCase()),
  );

  const lowStock = parts.filter((p) => p.stockQuantity <= p.minStockLevel);

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={22} className="text-emerald-500" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Library Spare Parts</h2>
            <p className="text-xs text-gray-500 mt-0.5">{parts.length} item terdaftar</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah Part</span>
        </button>
      </header>

      <div className="p-4 md:p-8 space-y-4">
        {/* Low stock warning */}
        {lowStock.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                {lowStock.length} item di bawah stok minimum
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {lowStock.map((p) => p.name).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Cari nama, part number, atau supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            {/* Mobile: Cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((p) => {
                const isLow = p.stockQuantity <= p.minStockLevel;
                return (
                  <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{p.name}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{p.partNumber}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        Stok: {p.stockQuantity}
                      </span>
                    </div>
                    {p.supplier && <p className="text-xs text-gray-500 mb-3">📦 {p.supplier}</p>}
                    {p.unitPrice && <p className="text-sm font-semibold text-gray-700 mb-3">Rp {p.unitPrice.toLocaleString('id-ID')}</p>}
                    <div className="flex gap-2 pt-2 border-t border-gray-50">
                      <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                        <Pencil size={14} /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirm(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
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
                    <th className="px-5 py-4">Nama / Part Number</th>
                    <th className="px-5 py-4">Stok</th>
                    <th className="px-5 py-4">Min. Stok</th>
                    <th className="px-5 py-4">Harga Satuan</th>
                    <th className="px-5 py-4">Supplier</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((p) => {
                    const isLow = p.stockQuantity <= p.minStockLevel;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <p className="text-xs font-mono text-gray-400 mt-0.5">{p.partNumber}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isLow && <AlertTriangle size={11} />} {p.stockQuantity}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500">{p.minStockLevel}</td>
                        <td className="px-5 py-4 text-gray-700 font-medium">
                          {p.unitPrice ? `Rp ${p.unitPrice.toLocaleString('id-ID')}` : '—'}
                        </td>
                        <td className="px-5 py-4 text-gray-500">{p.supplier || '—'}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => setDeleteConfirm(p)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-bold text-gray-900 text-lg">
                {modal === 'create' ? 'Tambah Spare Part' : 'Edit Spare Part'}
              </h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 font-medium">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nama Part *</label>
                  <input required type="text" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Filter Oli Mesin" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Part Number *</label>
                  <input required type="text" value={form.partNumber || ''} onChange={(e) => setForm({ ...form, partNumber: e.target.value })} placeholder="SP-1001" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Stok Saat Ini</label>
                  <input type="number" min={0} value={form.stockQuantity ?? 0} onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Stok Minimum</label>
                  <input type="number" min={0} value={form.minStockLevel ?? 0} onChange={(e) => setForm({ ...form, minStockLevel: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Harga Satuan (Rp)</label>
                  <input type="number" min={0} value={form.unitPrice ?? ''} onChange={(e) => setForm({ ...form, unitPrice: e.target.value ? Number(e.target.value) : undefined })} placeholder="150000" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Supplier</label>
                  <input type="text" value={form.supplier || ''} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="PT Indopart Sentosa" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Deskripsi</label>
                <textarea rows={2} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Keterangan singkat tentang spare part ini..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none" />
              </div>

              <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60">
                {createMut.isPending || updateMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {modal === 'create' ? 'Simpan ke Library' : 'Simpan Perubahan'}
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
            <h3 className="text-center font-bold text-gray-900 text-lg">Hapus Spare Part?</h3>
            <p className="text-center text-sm text-gray-500 mt-2 mb-6">
              <span className="font-semibold text-gray-800">{deleteConfirm.name}</span> akan dihapus dari library.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={() => deleteMut.mutate(deleteConfirm.id)} disabled={deleteMut.isPending} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60">
                {deleteMut.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

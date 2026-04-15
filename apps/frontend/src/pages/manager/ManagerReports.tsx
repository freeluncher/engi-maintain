import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics';
import {
  BarChart3,
  Download,
  Loader2,
  TrendingDown,
  Package,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'Mei', '06': 'Jun',
  '07': 'Jul', '08': 'Agu', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des',
};

const formatMonth = (key: string) => {
  const [year, month] = key.split('-');
  return `${MONTH_LABELS[month]} ${year}`;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export default function ManagerReports() {
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  const [exporting, setExporting] = useState(false);
  const [months, setMonths] = useState(6);

  const { data: mtbf = [], isLoading: mtbfLoading } = useQuery({
    queryKey: ['analytics-mtbf'],
    queryFn: analyticsApi.getMtbf,
  });

  const { data: spReport, isLoading: spLoading } = useQuery({
    queryKey: ['analytics-spare-parts', months],
    queryFn: () => analyticsApi.getSparePartsReport(months),
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      await analyticsApi.exportReport(exportStart || undefined, exportEnd || undefined);
    } catch (e) {
      alert('Gagal mengekspor laporan. Silakan coba kembali.');
    } finally {
      setExporting(false);
    }
  };

  const mtbfChart = mtbf
    .filter((a) => a.failures > 0)
    .sort((a, b) => a.mtbfHours - b.mtbfHours)
    .slice(0, 10);

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center gap-3">
        <BarChart3 size={22} className="text-blue-500" />
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Laporan & Analitik</h2>
          <p className="text-xs text-gray-500 mt-0.5">Data strategis untuk pengambilan keputusan</p>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6">

        {/* ── Export Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Download size={18} className="text-gray-600" />
            <h3 className="font-bold text-gray-900">Ekspor Laporan Maintenance</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar size={11} /> Tanggal Mulai
              </label>
              <input
                type="date"
                value={exportStart}
                onChange={(e) => setExportStart(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar size={11} /> Tanggal Akhir
              </label>
              <input
                type="date"
                value={exportEnd}
                onChange={(e) => setExportEnd(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap"
              >
                {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Ekspor CSV
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Jika tanggal tidak diisi, default: 1 bulan terakhir. File dapat dibuka di Excel.
          </p>
        </div>

        {/* ── MTBF Chart ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <TrendingDown size={18} className="text-red-500" />
                MTBF per Mesin
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Mean Time Between Failures — semakin tinggi, semakin andal</p>
            </div>
          </div>

          {mtbfLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
            </div>
          ) : mtbfChart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <AlertTriangle size={32} className="mb-2 text-gray-300" />
              <p className="text-sm">Belum ada data failure untuk dihitung MTBF.</p>
            </div>
          ) : (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mtbfChart} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="assetName"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} unit=" jam" />
                  <Tooltip
                    formatter={(val: number) => [`${val} jam`, 'MTBF']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                  <Bar dataKey="mtbfHours" name="MTBF (jam)" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* MTBF table (mobile friendly) */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-gray-500 uppercase tracking-wider">
                    <tr className="border-b border-gray-100">
                      <th className="py-2 pr-4">Mesin</th>
                      <th className="py-2 pr-4">Kategori</th>
                      <th className="py-2 pr-4">Failures</th>
                      <th className="py-2">MTBF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mtbf.filter((a) => a.failures > 0).map((a) => (
                      <tr key={a.assetId}>
                        <td className="py-2 pr-4 font-medium text-gray-800">{a.assetName}</td>
                        <td className="py-2 pr-4 text-gray-500">{a.category}</td>
                        <td className="py-2 pr-4">
                          <span className={`font-bold ${a.failures >= 3 ? 'text-red-600' : a.failures >= 2 ? 'text-amber-600' : 'text-gray-700'}`}>
                            {a.failures}×
                          </span>
                        </td>
                        <td className="py-2 font-semibold text-blue-600">{a.mtbfHours} jam</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Spare Parts Usage ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Package size={18} className="text-emerald-500" />
                Penggunaan Spare Parts
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Total qty & estimasi biaya per bulan</p>
            </div>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value={3}>3 Bulan Terakhir</option>
              <option value={6}>6 Bulan Terakhir</option>
              <option value={12}>12 Bulan Terakhir</option>
            </select>
          </div>

          {spLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
            </div>
          ) : !spReport || spReport.chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Package size={32} className="mb-2 text-gray-300" />
              <p className="text-sm">Belum ada data penggunaan spare parts.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={spReport.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis yAxisId="qty" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis yAxisId="cost" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(val: number, name: string) =>
                      name === 'Total Biaya' ? [formatCurrency(val), name] : [`${val} pcs`, name]
                    }
                    labelFormatter={formatMonth}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                  <Legend />
                  <Area yAxisId="qty" type="monotone" dataKey="totalQty" name="Total Qty" stroke="#3b82f6" fill="url(#colorQty)" strokeWidth={2} dot={{ r: 4 }} />
                  <Area yAxisId="cost" type="monotone" dataKey="totalCost" name="Total Biaya" stroke="#10b981" fill="url(#colorCost)" strokeWidth={2} dot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>

              {/* Top Parts table */}
              <div className="mt-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Top Spare Parts yang Paling Sering Digunakan
                </h4>
                <div className="space-y-2">
                  {spReport.topParts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium text-gray-800 truncate">{p.name}</span>
                      <span className="text-sm font-bold text-blue-600 shrink-0">{p.totalQty} pcs</span>
                      <span className="text-xs text-gray-500 shrink-0 hidden sm:inline">
                        {formatCurrency(p.totalCost)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

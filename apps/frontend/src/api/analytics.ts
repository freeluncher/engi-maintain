import { apiClient } from './client';
import { useAuthStore } from '../store/authStore';

export interface DashboardAnalytics {
  availability: { rate: number; operational: number; total: number };
  downtime: { hours: number; daysSpan: number };
  categoryDistribution: { name: string; value: number }[];
}

export interface MtbfItem {
  assetId: string;
  assetName: string;
  serialNumber: string;
  category: string;
  failures: number;
  mtbfHours: number;
}

export interface SparePartsReport {
  chartData: {
    month: string;
    totalQty: number;
    totalCost: number;
    parts: { name: string; qty: number; cost: number }[];
  }[];
  topParts: { name: string; totalQty: number; totalCost: number }[];
  period: { since: string; until: string; monthsBack: number };
}

export const analyticsApi = {
  getDashboard: async (): Promise<DashboardAnalytics> => {
    const res: any = await apiClient.get('analytics/dashboard').json();
    return res.data;
  },

  getMtbf: async (): Promise<MtbfItem[]> => {
    const res: any = await apiClient.get('analytics/mtbf').json();
    return res.data;
  },

  getSparePartsReport: async (months = 6): Promise<SparePartsReport> => {
    const res: any = await apiClient.get(`analytics/spare-parts?months=${months}`).json();
    return res.data;
  },

  /**
   * Trigger CSV export — buka di tab baru untuk download langsung
   */
  exportReport: (startDate?: string, endDate?: string) => {
    const token = useAuthStore.getState().token;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const url = `http://localhost:5000/api/v1/analytics/export?${params.toString()}`;
    // Fetch dengan Authorization header, buat blob, trigger download
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Gagal mengekspor laporan.');
        return res.blob();
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        const filename = `laporan-maintenance-${startDate || 'all'}-to-${endDate || 'today'}.csv`;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
      });
  },
};

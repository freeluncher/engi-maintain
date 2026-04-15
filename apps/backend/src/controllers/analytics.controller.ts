import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await analyticsService.getDashboardAnalytics();
    res.json({ data });
  } catch (error) {
    console.error('Analytics Dashboard Error:', error);
    res.status(500).json({ message: 'Gagal memproses data analitik dashboard.' });
  }
};

export const getMtbfAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await analyticsService.getMtbfByAsset();
    res.json({ data });
  } catch (error) {
    console.error('Analytics MTBF Error:', error);
    res.status(500).json({ message: 'Gagal memproses data MTBF.' });
  }
};

export const getSparePartsReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const monthsBack = parseInt(req.query['months'] as string) || 6;
    const data = await analyticsService.getSparePartsReport(monthsBack);
    res.json({ data });
  } catch (error) {
    console.error('Analytics Spare Parts Report Error:', error);
    res.status(500).json({ message: 'Gagal memproses laporan spare parts.' });
  }
};

export const exportMaintenanceReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const since = startDate ? new Date(startDate as string) : (() => {
      const d = new Date(); d.setMonth(d.getMonth() - 1); return d;
    })();
    const until = endDate ? new Date(endDate as string) : new Date();

    since.setHours(0, 0, 0, 0);
    until.setHours(23, 59, 59, 999);

    const rows = await analyticsService.getExportData(since, until);

    // Build CSV string
    const headers = [
      'ID', 'Tanggal', 'Nama Aset', 'Serial Number', 'Kategori', 'Lokasi',
      'Jenis Maintenance', 'Teknisi', 'Deskripsi', 'Downtime (Jam)', 'Spare Parts Digunakan',
    ];

    const escapeCSV = (val: any) => {
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const csvLines = [
      headers.join(','),
      ...rows.map((row) =>
        [
          row.id, row.tanggal, row.assetName, row.serialNumber, row.kategori,
          row.lokasi, row.jenisMaintenance, row.teknisi, row.deskripsi,
          row.downtimeJam, row.spareParts,
        ]
          .map(escapeCSV)
          .join(','),
      ),
    ];

    const csv = csvLines.join('\n');
    const filename = `laporan-maintenance-${since.toISOString().slice(0, 10)}-to-${until.toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // BOM untuk Excel compatibility
  } catch (error) {
    console.error('Export Report Error:', error);
    res.status(500).json({ message: 'Gagal mengekspor laporan maintenance.' });
  }
};

import 'dotenv/config';
import { prisma } from '../src/config/database';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Memulai proses seeding database...');

  // 1. Membersihkan database dari data lama (berurutan agar tidak ada conflict foreign key)
  await prisma.maintenanceAlert.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.maintenanceSparePart.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();

  // ============================================
  // 2. Seeding Users (Admin, Manager, Engineer)
  // ============================================
  const [pwAdmin, pwManager, pwEngineer] = await Promise.all([
    bcrypt.hash('password123', 10),
    bcrypt.hash('manager123', 10),
    bcrypt.hash('engineer123', 10),
  ]);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@engimaintain.com',
      name: 'Super Admin',
      password: pwAdmin,
      role: 'Admin',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@engimaintain.com',
      name: 'Rina Wulandari',
      password: pwManager,
      role: 'Manager',
    },
  });

  const engineer = await prisma.user.create({
    data: {
      email: 'budi.engineer@engimaintain.com',
      name: 'Budi Santoso',
      password: pwEngineer,
      role: 'Engineer',
    },
  });

  console.log('✅ Users berhasil di-seeding.');
  console.log('   👤 Admin   : admin@engimaintain.com / password123');
  console.log('   👤 Manager : manager@engimaintain.com / manager123');
  console.log('   👤 Engineer: budi.engineer@engimaintain.com / engineer123');

  // ============================================
  // 3. Seeding Spare Parts
  // ============================================
  const part1 = await prisma.sparePart.create({
    data: {
      name: 'Filter Oli Mesin',
      partNumber: 'SP-1001',
      description: 'Filter oli standar fabrikasi industri.',
      stockQuantity: 50,
      minStockLevel: 10,
      unitPrice: 150000,
      supplier: 'PT Indopart Sentosa',
    },
  });

  const part2 = await prisma.sparePart.create({
    data: {
      name: 'Sabuk V-Belt',
      partNumber: 'SP-1002',
      description: 'V-belt karet tebal untuk motor konveyor.',
      stockQuantity: 20,
      minStockLevel: 5,
      unitPrice: 220000,
      supplier: 'Maju Jaya Teknik',
    },
  });

  await prisma.sparePart.create({
    data: {
      name: 'Bearing 6205-ZZ',
      partNumber: 'SP-1003',
      description: 'Deep groove ball bearing untuk motor listrik.',
      stockQuantity: 35,
      minStockLevel: 8,
      unitPrice: 85000,
      supplier: 'SKF Indonesia',
    },
  });

  await prisma.sparePart.create({
    data: {
      name: 'Sensor Temperatur PT100',
      partNumber: 'SP-1004',
      description: 'RTD sensor untuk monitoring suhu boiler.',
      stockQuantity: 12,
      minStockLevel: 3,
      unitPrice: 450000,
      supplier: 'Omron Distributor',
    },
  });

  console.log('✅ Spare Parts berhasil di-seeding.');

  // ============================================
  // 4. Seeding Assets
  // ============================================
  const asset1 = await prisma.asset.create({
    data: {
      name: 'Kompresor Udara A1',
      brand: 'Atlas Copco',
      serialNumber: 'SN-COMP-001',
      category: 'Pneumatic',
      status: 'Operational',
      location: 'Plant Area 1 - Blok A',
      purchaseDate: new Date('2023-01-15'),
      warrantyEnd: new Date('2025-01-15'),
      qrCode: 'qr-data-SN-COMP-001',
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      name: 'Motor Kipas Exhaust',
      brand: 'Siemens',
      serialNumber: 'SN-MTR-002',
      category: 'Electrical',
      status: 'UnderMaintenance',
      location: 'Gudang Eksterior',
      purchaseDate: new Date('2022-06-10'),
      warrantyEnd: new Date('2024-06-10'),
    },
  });

  const asset3 = await prisma.asset.create({
    data: {
      name: 'Boiler Uap 5-Bar',
      brand: 'Thermax',
      serialNumber: 'SN-BLR-003',
      category: 'Boiler',
      status: 'Operational',
      location: 'Ruang Boiler - Bangunan B',
      purchaseDate: new Date('2021-03-20'),
    },
  });

  const asset4 = await prisma.asset.create({
    data: {
      name: 'CNC Milling VMC-500',
      brand: 'Haas',
      serialNumber: 'SN-CNC-004',
      category: 'CNC',
      status: 'Breakdown',
      location: 'Workshop Mesin - Area C',
      purchaseDate: new Date('2020-11-05'),
    },
  });

  console.log('✅ Assets berhasil di-seeding.');

  // ============================================
  // 5. Seeding Maintenance Logs & Spare Parts
  // ============================================

  // Log 1 - Preventive untuk asset1
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  await prisma.maintenanceLog.create({
    data: {
      assetId: asset1.id,
      type: 'Preventive',
      description: 'Inspeksi & pembersihan. Oli ditambahkan, sistem berjalan stabil.',
      technicianName: engineer.name,
      maintenanceDate: sixMonthsAgo,
      downtimeHours: 1.5,
      spareParts: { create: [{ sparePartId: part1.id, quantityUsed: 2 }] },
    },
  });

  // Log 2 - Corrective untuk asset1 (bulan lalu)
  const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  await prisma.maintenanceLog.create({
    data: {
      assetId: asset1.id,
      type: 'Corrective',
      description: 'Sabuk V-Belt putus, menyebabkan mesin berhenti total.',
      technicianName: engineer.name,
      maintenanceDate: oneMonthAgo,
      downtimeHours: 4.0,
      spareParts: { create: [{ sparePartId: part2.id, quantityUsed: 1 }] },
    },
  });

  // Log 3 - Corrective untuk asset4 (CNC Breakdown, minggu lalu)
  const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  await prisma.maintenanceLog.create({
    data: {
      assetId: asset4.id,
      type: 'Corrective',
      description: 'Spindle motor overheat, error code E-245. Mesin dihentikan untuk pendinginan.',
      technicianName: engineer.name,
      maintenanceDate: oneWeekAgo,
      downtimeHours: 8.5,
    },
  });

  // Log 4 - Corrective untuk asset4 (3 bulan lalu — untuk MTBF calculation)
  const threeMonthsAgo = new Date(); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  await prisma.maintenanceLog.create({
    data: {
      assetId: asset4.id,
      type: 'Corrective',
      description: 'Coolant pump failure, kebocoran pada seal.',
      technicianName: engineer.name,
      maintenanceDate: threeMonthsAgo,
      downtimeHours: 3.0,
    },
  });

  console.log('✅ Maintenance Logs & Relasi Spare Parts berhasil di-seeding.');

  // ============================================
  // 6. Seeding Schedules (Preventive Maintenance)
  // ============================================
  const today = new Date();

  const schedule1 = await prisma.schedule.create({
    data: {
      assetId: asset1.id,
      title: 'Pemeliharaan Kompresor Berkala',
      description: 'Cek kondisi tekanan & penggantian oli.',
      frequencyType: 'MONTHLY',
      nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
      createdBy: admin.name,
      isActive: true,
    },
  });

  const schedule2 = await prisma.schedule.create({
    data: {
      assetId: asset2.id,
      title: 'Respooling & Inspeksi Listrik',
      description: 'Pengecekan isolasi lilitan motor exhaust.',
      frequencyType: 'YEARLY',
      nextDueDate: new Date('2026-06-10'),
      createdBy: admin.name,
      isActive: false,
    },
  });

  // Schedule overdue — untuk demo
  const overdueDate = new Date(); overdueDate.setDate(overdueDate.getDate() - 3);
  const schedule3 = await prisma.schedule.create({
    data: {
      assetId: asset3.id,
      title: 'Pemeriksaan Safety Valve Boiler',
      description: 'Cek tekanan, uji safety valve, dan pembersihan sedimen.',
      frequencyType: 'QUARTERLY',
      nextDueDate: overdueDate,
      createdBy: admin.name,
      isActive: true,
      isOverdue: true,
    },
  });

  console.log('✅ Schedules berhasil di-seeding.');

  // ============================================
  // 7. Seeding Maintenance Alerts
  // ============================================
  await prisma.maintenanceAlert.create({
    data: {
      scheduleId: schedule1.id,
      assetId: asset1.id,
      alertDate: today,
      isRead: false,
      alertType: 'DueDate',
    },
  });

  await prisma.maintenanceAlert.create({
    data: {
      scheduleId: schedule3.id,
      assetId: asset3.id,
      alertDate: today,
      isRead: false,
      alertType: 'Overdue',
    },
  });

  console.log('✅ Maintenance Alerts berhasil di-seeding.');
  console.log('');
  console.log('🎉 Seeding database selesai. Rangkuman akun untuk testing:');
  console.log('   Role Admin   : admin@engimaintain.com / password123');
  console.log('   Role Manager : manager@engimaintain.com / manager123');
  console.log('   Role Engineer: budi.engineer@engimaintain.com / engineer123');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi error saat seeding: ', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

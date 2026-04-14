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
  // 2. Seeding Users
  // ============================================
  const hashedPassword1 = await bcrypt.hash('password123', 10);
  const hashedPassword2 = await bcrypt.hash('engineer123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@engimaintain.com',
      name: 'Super Admin',
      password: hashedPassword1,
      role: 'Admin',
    },
  });

  const engineer = await prisma.user.create({
    data: {
      email: 'budi.engineer@engimaintain.com',
      name: 'Budi Santoso',
      password: hashedPassword2,
      role: 'Engineer',
    },
  });

  console.log('✅ Users berhasil di-seeding.');

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

  console.log('✅ Assets berhasil di-seeding.');

  // ============================================
  // 5. Seeding Maintenance Logs & Penggunaan Part
  // ============================================
  const maintLog1 = await prisma.maintenanceLog.create({
    data: {
      assetId: asset1.id,
      type: 'Preventive',
      description: 'Inspeksi & pembersihan. Oli ditambahkan, sistem berjalan stabil.',
      technicianName: engineer.name,
      maintenanceDate: new Date(),
      downtimeHours: 1.5,
      partsUsed: JSON.stringify(['Minyak pelumas 1L']),
      spareParts: {
        create: [
          {
            sparePartId: part1.id,
            quantityUsed: 2,
          },
        ],
      },
    },
  });

  console.log('✅ Maintenance Logs & Relasi Spare Parts berhasil di-seeding.');

  // ============================================
  // 6. Seeding Schedules (Penjadwalan PM)
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
      isActive: false, // Simulasi alat sedang maintenance saat ini
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

  console.log('✅ Maintenance Alerts berhasil di-seeding.');
  console.log('🎉 Seeding database selesai seluruhnya! Anda siap mencoba aplikasi.');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi error saat seeding: ', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

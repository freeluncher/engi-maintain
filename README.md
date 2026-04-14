# 🛠️ EngiMaintain

**EngiMaintain** adalah sebuah platform modern berbasis arsitektur *monorepo* yang didesain secara spesifik untuk memanajemen aset infrastruktur dan penjadwalan pemeliharaan (Maintenance) harian, mingguan, maupun *preventive*. Platform ini membantu para *Engineer* dan *Manager* memiliki visibilitas penuh akan status operasional peralatan di lapangan.

---

## 🚀 Teknologi Utama

Project ini menggunakan pendekatan Monorepo dengan pembagian jelas antara sistem antarmuka pengguna *(Frontend)* dan API database *(Backend)*.

**Frontend:**
- ⚛️ **React 19** via **Vite**
- 🎨 **Tailwind CSS v4** (Modern styling pipeline via PostCSS)
- 🛣️ **React Router v7** (Proteksi navigasi)
- 🐻 **Zustand** (Manajemen state aplikasi super ringan)
- 📝 **React Hook Form & Zod** (Validasi *form* standar industri)
- 🔗 **TanStack Query (React Query)** (Manajemen siklus asinkronous)

**Backend & Database:**
- 🟢 **Node.js**
- 🗄️ **PostgreSQL**
- 🔰 **Prisma ORM** (Validasi dan relasi skema database tingkat lanjut, mendukung migrasi mulus)

---

## 📂 Struktur Monorepo

Project ini di-maintain menggunakan struktur folder tunggal, dimana sistem dipisahkan berdasarkan fungsi *apps*:

```text
engi-maintain/
├── apps/
│   ├── frontend/         # Aplikasi antarmuka pengguna (React + Vite)
│   └── backend/          # Server API dan konfigurasi kontrol Database (Prisma)
├── logs/                 # Folder output debugger jika ada
├── package.json          # Konfigurasi workspace dependency root
└── .gitignore            # Pencegahan file sensitif termuat ke repository
```

---

## ⚙️ Prerequisites (Prasyarat Instalasi)

Sebelum Anda menjalankan project di mesin lokal, pastikan tools di bawah telah di-install:
- [Node.js](https://nodejs.org/en/) (Disarankan `v18.x` atau lebih baru)
- Paket manajer (secara bawaan, ekosistem menggunakan `npm`)
- Database **PostgreSQL** yang menyala pada port 5432 (ataupun di-*hosting*)

---

## 🏁 Memulai Development

Ikuti langkah-langkah di bawah ini untuk menyalakan proyek di server `localhost` komputer Anda.

### 1. Install Dependencies
Masuk ke root direktori terminal, install seluruh dependensi paket:
```bash
npm install
```

### 2. Setup Lingkungan Database (Backend)
Platform ini me-utilisasi kekuatan Prisma. Siapkan file `.env` di direktori database dan pastikan ada `DATABASE_URL` yang valid ke PostgreSQL Anda.

Sesudah itu, eksekusi relasi ke database via terminal:
```bash
cd apps/backend
npx prisma format       # Validasi syntax schema.prisma Anda
npx prisma migrate dev  # Bangun infrastruktur tabel dan kolom ke database lokal
```

### 3. Eksekusi Environment Lokal
Aplikasi dapat dijalankan secara berdampingan. Jalankan command andalan dari target folder Anda:
```bash
# Menjalankan Vite server react di port default
npm run dev
```

*(Catatan: Anda juga bisa menulis command automasi di `package.json` yang spesifik me-*trigger* concurrent run antara backend API log dan Frontend)*

---

## ✨ Fitur-fitur Inti Terkini
- **User Authentication:** Login antarmuka dengan kapabilitas validasi email presonalized per perusahaan & autentikasi tersimpan.
- **Manajemen Modul Aset:** Katalogisasi data historis status aset, nomor seri, dan lokasi dari alat perusahaan.
- **Maintenance Logger:** Mencatat spare part keluar serta lama downtime (Preventive maupun Corrective maintenance).
- **Automation Scheduler Alerts:** Pengawasan mesin mana saja yang akan tiba masa kalibrasi atau perawatan berjenjang (*Overdue and Due Date Alerts*).

---

<p align="center">
  <i>Dibangun dengan ❤️ untuk otomasi operasional para praktisi Engineer.</i>
</p>

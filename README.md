# Money Tracker — Personal Finance Web Application

Aplikasi web modern untuk pencatatan dan pemantauan arus kas (pemasukan dan pengeluaran) keuangan pribadi dengan antarmuka **Premium Dark Dashboard**.

Dibangun menggunakan stack teknologi:
- **Next.js 14** (App Router)
- **TypeScript**
- **React 18**
- **Tailwind CSS**
- **MySQL Driver (mysql2/promise)** dengan Connection Pooling & TLS/SSL Aiven
- **Lucide React** (Consistent UI Icons)

---

## 🚀 Fitur Utama

### 1. Dashboard Finansial
- **Ringkasan Finansial Real-time**: Total Pemasukan, Total Pengeluaran, Saldo Bersih (`Pemasukan - Pengeluaran`), dan Jumlah Transaksi.
- **Rasio Tabungan (Savings Rate)** & status kesehatan arus kas (Surplus vs Defisit).
- **Visualisasi Pengeluaran per Kategori**: Progress bar persentase pengeluaran terhadap total arus kas keluar.
- **Daftar Transaksi Terbaru**: Menampilkan 5 transaksi terakhir dari database MySQL.
- **Quick Action**: Tombol Tambah Transaksi cepat dari header atau dashboard.

### 2. Manajemen Transaksi (CRUD Lengkap)
- **Tambah Transaksi**: Judul, Nominal (IDR), Jenis (Pemasukan / Pengeluaran), Kategori (otomatis difilter sesuai jenis), Tanggal, dan Catatan opsional.
- **Daftar Transaksi**: Menampilkan nama kategori hasil `JOIN`, tanggal format Indonesia, nominal terformat Rupiah (`Rp 1.500.000`), badge jenis transaksi.
- **Pencarian Real-time**: Cari berdasarkan judul transaksi atau keterangan catatan.
- **Filter Fleksibel**: Filter berdasarkan jenis transaksi (Semua, Pemasukan, Pengeluaran), filter kategori, dan rentang tanggal.
- **Sorting & Pagination**: Urutkan berdasarkan tanggal terbaru/terlama dan nominal terbesar/terkecil.
- **Ekspor CSV**: Unduh riwayat transaksi ke format file spreadsheet CSV.
- **Edit & Hapus Transaksi**: Modal edit terisi data dan modal konfirmasi hapus aman.

### 3. Manajemen Kategori
- Pemisahan kategori pemasukan dan pengeluaran.
- Tambah kategori baru dengan validasi duplikasi.
- Edit dan Hapus kategori (dengan proteksi foreign key jika kategori sedang digunakan oleh transaksi).

---

## 🛠️ Panduan Konfigurasi & Menjalankan Lokal

### Prasyarat
- Node.js versi 18 ke atas (direkomendasikan Node.js 20 atau 22).
- Akses ke layanan **Aiven MySQL** dengan database `money_tracker`.

### 1. Salin Konfigurasi Environment
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isi variabel lingkungan pada `.env.local` sesuai kredensial layanan Aiven Anda:
```env
DB_HOST=mysql-xxxx-xxxx.aivencloud.com
DB_PORT=24789
DB_USER=avnadmin
DB_PASSWORD=your_aiven_password
DB_NAME=money_tracker
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### 2. Menjalankan Server Pengembangan
Jalankan dev server dengan:
```bash
npm run dev
```
Buka browser pada [http://localhost:3000](http://localhost:3000).

### 3. Menjalankan Production Build
Untuk memverifikasi build aplikasi:
```bash
npm run build
npm run start
```

---

## 📡 Endpoint API Route Handlers

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Mengambil agregasi metrik finansial, breakdown pengeluaran per kategori, dan 5 transaksi terbaru |
| `GET` | `/api/transactions` | Mengambil daftar transaksi (query params: `search`, `type`, `category_id`, `start_date`, `end_date`, `sort`, `limit`, `offset`) |
| `GET` | `/api/transactions/[id]` | Mengambil detail 1 transaksi berdasarkan ID |
| `POST` | `/api/transactions` | Menyimpan transaksi baru ke database |
| `PUT` | `/api/transactions/[id]` | Memperbarui data transaksi |
| `DELETE` | `/api/transactions/[id]` | Menghapus transaksi |
| `GET` | `/api/categories` | Mengambil daftar kategori (opsional filter `?type=income` atau `?type=expense`) |
| `GET` | `/api/categories/[id]` | Mengambil detail kategori |
| `POST` | `/api/categories` | Membuat kategori baru |
| `PUT` | `/api/categories/[id]` | Mengubah kategori |
| `DELETE` | `/api/categories/[id]` | Menghapus kategori (dilindungi relasi FK) |
| `GET` | `/api/health` | Memeriksa ketersediaan konfigurasi & status koneksi aktif ke MySQL Aiven |

---

## ☁️ Langkah Deployment ke Vercel

1. Push commit ke repository GitHub/GitLab Anda:
   ```bash
   git add .
   git commit -m "feat: complete Money Tracker application"
   git push origin main
   ```
2. Buka dashboard [Vercel](https://vercel.com) dan impor repository proyek ini.
3. Pada bagian **Environment Variables** di Vercel Settings, tambahkan variabel berikut sesuai koneksi Aiven MySQL Anda:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME` (`money_tracker`)
   - `DB_SSL` (`true`)
   - `DB_SSL_REJECT_UNAUTHORIZED` (`false` atau upload CA cert jika diperlukan)
4. Klik **Deploy**. Vercel akan otomatis melakukan proses build dan aplikasi siap digunakan secara publik.

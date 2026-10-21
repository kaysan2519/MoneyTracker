-- =============================================================================
-- Money Tracker - Initial Seed Data (Categories Only)
-- Perhatian: Skrip ini HANYA menyematkan data kategori awal standar.
-- Tidak ada transaksi dummy atau data palsu yang disematkan.
-- =============================================================================

USE `money_tracker`;

-- Kategori Pemasukan Standar (Income)
INSERT IGNORE INTO `categories` (`name`, `type`) VALUES
  ('Gaji Pokok', 'income'),
  ('Bonus & Tunjangan', 'income'),
  ('Freelance / Proyek', 'income'),
  ('Investasi & Dividen', 'income'),
  ('Pemasukan Lainnya', 'income');

-- Kategori Pengeluaran Standar (Expense)
INSERT IGNORE INTO `categories` (`name`, `type`) VALUES
  ('Makanan & Minuman', 'expense'),
  ('Transportasi', 'expense'),
  ('Tagihan & Utilitas', 'expense'),
  ('Belanja Kebutuhan', 'expense'),
  ('Hiburan & Rekreasi', 'expense'),
  ('Kesehatan', 'expense'),
  ('Pendidikan', 'expense'),
  ('Keluarga & Donasi', 'expense'),
  ('Pengeluaran Lainnya', 'expense');

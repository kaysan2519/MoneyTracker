-- =============================================================================
-- Money Tracker - Database Schema
-- Target Database: MySQL 8.0+ (Aiven MySQL Compatible)
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =============================================================================

-- Pastikan database money_tracker aktif
CREATE DATABASE IF NOT EXISTS `money_tracker`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `money_tracker`;

-- -----------------------------------------------------------------------------
-- 1. TABEL: categories
-- Deskripsi: Menyimpan daftar kategori pemasukan dan pengeluaran.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT 'Nama label kategori transaksi',
  `type` ENUM('income', 'expense') NOT NULL COMMENT 'Jenis kategori: income (pemasukan) atau expense (pengeluaran)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan data',
  
  -- Constraint untuk mencegah duplikasi nama kategori dengan jenis yang sama
  UNIQUE KEY `uq_categories_name_type` (`name`, `type`),
  
  -- Index untuk mengoptimalkan filter kategori berdasarkan jenis
  INDEX `idx_categories_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel master kategori transaksi keuangan';

-- -----------------------------------------------------------------------------
-- 2. TABEL: transactions
-- Deskripsi: Menyimpan catatan transaksi keuangan (arus kas masuk & keluar).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL COMMENT 'Relasi ke tabel categories.id',
  `title` VARCHAR(150) NOT NULL COMMENT 'Judul / nama transaksi',
  `amount` DECIMAL(15, 2) NOT NULL COMMENT 'Nominal uang transaksi dalam format desimal',
  `type` ENUM('income', 'expense') NOT NULL COMMENT 'Jenis transaksi: income atau expense',
  `transaction_date` DATE NOT NULL COMMENT 'Tanggal pencatatan transaksi (YYYY-MM-DD)',
  `description` TEXT NULL COMMENT 'Catatan atau keterangan opsional',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan record',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu perubahan record terakhir',
  
  -- Foreign Key Constraint
  -- Menggunakan ON DELETE RESTRICT untuk mencegah penghapusan kategori yang masih memiliki catatan transaksi
  CONSTRAINT `fk_transactions_categories`
    FOREIGN KEY (`category_id`)
    REFERENCES `categories` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
    
  -- Indexing untuk performa pencarian, filtering, dan sorting
  INDEX `idx_transactions_category_id` (`category_id`),
  INDEX `idx_transactions_date` (`transaction_date` DESC, `id` DESC),
  INDEX `idx_transactions_type` (`type`),
  INDEX `idx_transactions_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel transaksi finansial pemasukan dan pengeluaran';

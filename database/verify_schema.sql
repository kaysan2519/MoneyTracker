-- =============================================================================
-- Money Tracker - Schema Verification Queries
-- Jalankan query ini di DBeaver untuk memverifikasi struktur tabel & relasi
-- =============================================================================

USE `money_tracker`;

-- 1. Periksa daftar tabel yang ada
SELECT 
  table_name AS 'Nama Tabel', 
  table_rows AS 'Perkiraan Baris', 
  table_collation AS 'Collation',
  engine AS 'Engine'
FROM information_schema.tables
WHERE table_schema = 'money_tracker'
ORDER BY table_name ASC;

-- 2. Periksa detail kolom pada tabel categories
SELECT 
  column_name AS 'Kolom', 
  column_type AS 'Tipe Data', 
  is_nullable AS 'Boleh NULL', 
  column_key AS 'Key', 
  column_default AS 'Default', 
  extra AS 'Keterangan'
FROM information_schema.columns
WHERE table_schema = 'money_tracker' AND table_name = 'categories'
ORDER BY ordinal_position ASC;

-- 3. Periksa detail kolom pada tabel transactions
SELECT 
  column_name AS 'Kolom', 
  column_type AS 'Tipe Data', 
  is_nullable AS 'Boleh NULL', 
  column_key AS 'Key', 
  column_default AS 'Default', 
  extra AS 'Keterangan'
FROM information_schema.columns
WHERE table_schema = 'money_tracker' AND table_name = 'transactions'
ORDER BY ordinal_position ASC;

-- 4. Periksa Foreign Key Relasi (transactions -> categories)
SELECT 
  constraint_name AS 'Nama Constraint', 
  table_name AS 'Tabel Asal', 
  column_name AS 'Kolom Asal', 
  referenced_table_name AS 'Tabel Referensi', 
  referenced_column_name AS 'Kolom Referensi'
FROM information_schema.key_column_usage
WHERE table_schema = 'money_tracker' 
  AND table_name = 'transactions' 
  AND referenced_table_name IS NOT NULL;

-- 5. Periksa aturan Referential Integrity (ON DELETE / ON UPDATE)
SELECT 
  constraint_name AS 'Nama Constraint', 
  update_rule AS 'On Update', 
  delete_rule AS 'On Delete'
FROM information_schema.referential_constraints
WHERE constraint_schema = 'money_tracker' AND table_name = 'transactions';

-- 6. Periksa Index yang terpasang pada kedua tabel
SELECT 
  table_name AS 'Tabel', 
  index_name AS 'Nama Index', 
  non_unique AS 'Bisa Duplikat (1=Ya, 0=Tidak)', 
  seq_in_index AS 'Urutan', 
  column_name AS 'Kolom'
FROM information_schema.statistics
WHERE table_schema = 'money_tracker'
ORDER BY table_name ASC, index_name ASC, seq_in_index ASC;

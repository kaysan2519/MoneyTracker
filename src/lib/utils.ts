import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka ke format mata uang Rupiah Indonesia (IDR)
 * Contoh: 1500000 -> "Rp 1.500.000"
 */
export function formatRupiah(amount: number | string | null | undefined): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(numericAmount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

/**
 * Konversi angka numerik ke teks terbilang Bahasa Indonesia
 * Contoh: 1500000 -> "Satu Juta Lima Ratus Ribu Rupiah"
 */
export function angkaTerbilang(angka: number | string | null | undefined): string {
  if (angka === null || angka === undefined || angka === '') return '';
  const num = Math.floor(Math.abs(typeof angka === 'string' ? parseFloat(angka) : angka));
  if (isNaN(num) || num === 0) return '';

  const huruf = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  function bilangan(n: number): string {
    if (n < 12) return huruf[n];
    if (n < 20) return bilangan(n - 10) + ' Belas';
    if (n < 100) return huruf[Math.floor(n / 10)] + ' Puluh ' + bilangan(n % 10);
    if (n < 200) return 'Seratus ' + bilangan(n - 100);
    if (n < 1000) return huruf[Math.floor(n / 100)] + ' Ratus ' + bilangan(n % 100);
    if (n < 2000) return 'Seribu ' + bilangan(n - 1000);
    if (n < 1000000) return bilangan(Math.floor(n / 1000)) + ' Ribu ' + bilangan(n % 1000);
    if (n < 1000000000) return bilangan(Math.floor(n / 1000000)) + ' Juta ' + bilangan(n % 1000000);
    return bilangan(Math.floor(n / 1000000000)) + ' Miliar ' + bilangan(n % 1000000000);
  }

  return bilangan(num).replace(/\s+/g, ' ').trim() + ' Rupiah';
}

/**
 * Format tanggal YYYY-MM-DD ke format tampilan Indonesia
 * Contoh: "2026-10-18" -> "18 Okt 2026"
 */
export function formatDateIndonesia(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return String(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return String(dateStr);
  }
}

/**
 * Format tanggal ke format standar input HTML date: YYYY-MM-DD
 */
export function toInputDate(dateStr?: string | Date | null): string {
  if (!dateStr) {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

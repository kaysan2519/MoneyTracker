'use client';

import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '@/types';
import { formatRupiah, toInputDate } from '@/lib/utils';
import { X, ArrowDownLeft, ArrowUpRight, Calendar, Tag, FileText, Loader2 } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
  categories: Category[];
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit,
  categories,
}: TransactionModalProps) {
  const isEditing = Boolean(transactionToEdit);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter kategori berdasarkan jenis transaksi yang dipilih
  const filteredCategories = categories.filter((cat) => cat.type === type);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (transactionToEdit) {
        setTitle(transactionToEdit.title);
        setAmount(String(transactionToEdit.amount));
        setType(transactionToEdit.type);
        setCategoryId(String(transactionToEdit.category_id));
        setTransactionDate(toInputDate(transactionToEdit.transaction_date));
        setDescription(transactionToEdit.description || '');
      } else {
        setTitle('');
        setAmount('');
        setType('expense');
        setTransactionDate(toInputDate());
        setDescription('');
        // Set default category jika ada
        const defaultCat = categories.find((c) => c.type === 'expense');
        setCategoryId(defaultCat ? String(defaultCat.id) : '');
      }
    }
  }, [isOpen, transactionToEdit, categories]);

  // Saat tipe berubah, periksa apakah kategori saat ini masih cocok
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const matchingCats = categories.filter((c) => c.type === newType);
    if (matchingCats.length > 0) {
      // Pilih kategori pertama yang cocok
      setCategoryId(String(matchingCats[0].id));
    } else {
      setCategoryId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validasi Sederhana
    if (!title.trim()) {
      setError('Judul transaksi wajib diisi.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Nominal harus berupa angka lebih dari 0.');
      return;
    }

    if (!categoryId) {
      setError('Harap pilih kategori yang sesuai.');
      return;
    }

    if (!transactionDate) {
      setError('Tanggal transaksi wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        amount: numAmount,
        type,
        category_id: parseInt(categoryId, 10),
        transaction_date: transactionDate,
        description: description.trim() || null,
      };

      const url = isEditing
        ? `/api/transactions/${transactionToEdit?.id}`
        : '/api/transactions';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan transaksi.');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg rounded-2xl bg-[#111726] border border-[#1e293b] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e293b]">
          <div>
            <h3 className="text-lg font-bold text-white">
              {isEditing ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditing ? 'Perbarui data transaksi yang tersimpan' : 'Catat pemasukan atau pengeluaran finansial Anda'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {/* Toggle Jenis Transaksi */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#090d16] border border-[#1e293b]">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 mr-2 text-rose-400" />
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 mr-2 text-emerald-400" />
                Pemasukan
              </button>
            </div>
          </div>

          {/* Judul Transaksi */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Judul / Nama Transaksi <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={150}
              placeholder="Contoh: Belanja Bulanan, Gaji Pokok"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-[#1e293b] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* Nominal */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Nominal (IDR) <span className="text-rose-400">*</span>
              </label>
              {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                <span className="text-xs font-medium text-emerald-400">
                  {formatRupiah(parseFloat(amount))}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-[#090d16] border border-[#1e293b] text-white placeholder-slate-500 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Kategori & Tanggal (2 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Kategori */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kategori <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#090d16] border border-[#1e293b] text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none transition-colors"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#111726] text-white">
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {filteredCategories.length === 0 && (
                <p className="text-[11px] text-amber-400/80 mt-1">
                  Belum ada kategori untuk jenis ini.
                </p>
              )}
            </div>

            {/* Tanggal Transaksi */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tanggal <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090d16] border border-[#1e293b] text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Deskripsi Opsional */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan / Deskripsi <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              <textarea
                rows={2}
                placeholder="Keterangan tambahan transaksi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#090d16] border border-[#1e293b] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

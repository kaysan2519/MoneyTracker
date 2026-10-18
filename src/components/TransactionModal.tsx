'use client';

import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '@/types';
import { formatRupiah, toInputDate } from '@/lib/utils';
import { X, Loader2 } from 'lucide-react';

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
        const defaultCat = categories.find((c) => c.type === 'expense');
        setCategoryId(defaultCat ? String(defaultCat.id) : '');
      }
    }
  }, [isOpen, transactionToEdit, categories]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const matchingCats = categories.filter((c) => c.type === newType);
    if (matchingCats.length > 0) {
      setCategoryId(String(matchingCats[0].id));
    } else {
      setCategoryId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submit
    setError(null);

    if (!title.trim()) {
      setError('Nama transaksi wajib diisi.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Nominal harus berupa angka lebih dari 0.');
      return;
    }

    if (!categoryId) {
      setError('Pilih kategori yang sesuai.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]">
      <div 
        className="w-full max-w-md rounded-lg bg-[#121316] border border-[#23262D] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1C1E23]">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F4F6]">
              {isEditing ? 'Ubah Transaksi' : 'Catat Transaksi'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8E929B] rounded hover:text-white hover:bg-[#181A1E]"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Segmented Type Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-[#0C0D0E] border border-[#23262D]">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-1.5 rounded text-xs font-medium transition-colors ${
                type === 'expense'
                  ? 'bg-[#1E2026] text-[#F4F4F6] font-semibold shadow-sm'
                  : 'text-[#8E929B] hover:text-[#D1D3D8]'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-1.5 rounded text-xs font-medium transition-colors ${
                type === 'income'
                  ? 'bg-[#1E2026] text-emerald-400 font-semibold shadow-sm'
                  : 'text-[#8E929B] hover:text-[#D1D3D8]'
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Nominal Hero Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[#8E929B]">
                Nominal
              </label>
              {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                <span className="text-xs text-[#8E929B] tabular-nums">
                  {formatRupiah(parseFloat(amount))}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-medium text-[#5C606A]">
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
                className="w-full pl-9 pr-3 py-2 rounded-md bg-[#0C0D0E] border border-[#23262D] text-sm text-[#F4F4F6] font-medium tabular-nums focus:border-[#3E424D] transition-colors"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-[#8E929B] mb-1">
              Nama Transaksi
            </label>
            <input
              type="text"
              required
              maxLength={150}
              placeholder="Contoh: Belanja, Gaji Pokok"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#0C0D0E] border border-[#23262D] text-xs text-[#F4F4F6] placeholder-[#5C606A] focus:border-[#3E424D] transition-colors"
            />
          </div>

          {/* Category & Date in 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8E929B] mb-1">
                Kategori
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-md bg-[#0C0D0E] border border-[#23262D] text-xs text-[#F4F4F6] focus:border-[#3E424D] transition-colors"
              >
                <option value="" disabled>Pilih Kategori</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#121316]">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8E929B] mb-1">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-md bg-[#0C0D0E] border border-[#23262D] text-xs text-[#F4F4F6] focus:border-[#3E424D] transition-colors"
              />
            </div>
          </div>

          {/* Optional Description */}
          <div>
            <label className="block text-xs font-medium text-[#8E929B] mb-1">
              Catatan <span className="text-[#5C606A]">(opsional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Keterangan tambahan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md bg-[#0C0D0E] border border-[#23262D] text-xs text-[#F4F4F6] placeholder-[#5C606A] focus:border-[#3E424D] transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1C1E23]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-[#8E929B] hover:text-[#F4F4F6] hover:bg-[#181A1E] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {isEditing ? 'Simpan Perubahan' : 'Catat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

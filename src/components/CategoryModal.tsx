'use client';

import React, { useState, useEffect } from 'react';
import { Category, TransactionType } from '@/types';
import { X, Loader2 } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToEdit?: Category | null;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
}: CategoryModalProps) {
  const isEditing = Boolean(categoryToEdit);
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setType(categoryToEdit.type);
      } else {
        setName('');
        setType('expense');
      }
    }
  }, [isOpen, categoryToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!name.trim()) {
      setError('Nama kategori wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const url = isEditing
        ? `/api/categories/${categoryToEdit?.id}`
        : '/api/categories';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan kategori.');
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
        className="w-full max-w-sm rounded-lg bg-[#121316] border border-[#23262D] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1C1E23]">
          <h3 className="text-sm font-semibold text-[#F4F4F6]">
            {isEditing ? 'Ubah Kategori' : 'Tambah Kategori'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#8E929B] rounded hover:text-white hover:bg-[#181A1E]"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Segmented Type Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-[#0C0D0E] border border-[#23262D]">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-1.5 rounded text-xs font-medium transition-colors ${
                type === 'expense'
                  ? 'bg-[#1E2026] text-[#F4F4F6] font-semibold'
                  : 'text-[#8E929B] hover:text-[#D1D3D8]'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-1.5 rounded text-xs font-medium transition-colors ${
                type === 'income'
                  ? 'bg-[#1E2026] text-emerald-400 font-semibold'
                  : 'text-[#8E929B] hover:text-[#D1D3D8]'
              }`}
            >
              Pemasukan
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8E929B] mb-1">
              Nama Kategori
            </label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="Contoh: Makanan, Transportasi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#0C0D0E] border border-[#23262D] text-xs text-[#F4F4F6] placeholder-[#5C606A] focus:border-[#3E424D] transition-colors"
            />
          </div>

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
              {isEditing ? 'Simpan Perubahan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

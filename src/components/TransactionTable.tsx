'use client';

import React from 'react';
import { Transaction, Category } from '@/types';
import { formatRupiah, formatDateIndonesia } from '@/lib/utils';
import { 
  Pencil, 
  Trash2, 
  Search, 
  Plus
} from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  categories?: Category[];
  loading?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onAddNew?: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  typeFilter?: string;
  onTypeFilterChange?: (val: string) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (val: string) => void;
  compact?: boolean;
}

export default function TransactionTable({
  transactions,
  categories = [],
  loading = false,
  onEdit,
  onDelete,
  onAddNew,
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  compact = false,
}: TransactionTableProps) {
  const showControls = !compact && onSearchChange;

  return (
    <div className="rounded-lg bg-[#121316] border border-[#1C1E23] overflow-hidden">
      {/* Controls Bar */}
      {showControls && (
        <div className="p-3.5 sm:p-4 border-b border-[#1C1E23] flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#5C606A]" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm || ''}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#0C0D0E] border border-[#23262D] text-xs text-[#F4F4F6] placeholder-[#5C606A] focus:border-[#3E424D] transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {onTypeFilterChange && (
              <select
                value={typeFilter || 'all'}
                onChange={(e) => onTypeFilterChange(e.target.value)}
                className="px-2.5 py-1.5 rounded-md bg-[#0C0D0E] border border-[#23262D] text-xs text-[#D1D3D8] cursor-pointer focus:border-[#3E424D] transition-colors"
              >
                <option value="all">Semua Jenis</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            )}

            {onCategoryFilterChange && (
              <select
                value={categoryFilter || 'all'}
                onChange={(e) => onCategoryFilterChange(e.target.value)}
                className="px-2.5 py-1.5 rounded-md bg-[#0C0D0E] border border-[#23262D] text-xs text-[#D1D3D8] cursor-pointer focus:border-[#3E424D] transition-colors"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type === 'income' ? 'Masuk' : 'Keluar'})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#1C1E23] text-[11px] font-medium text-[#5C606A] uppercase tracking-wider">
              <th className="py-3 px-4 w-32">Tanggal</th>
              <th className="py-3 px-4">Transaksi</th>
              <th className="py-3 px-4 w-40">Kategori</th>
              <th className="py-3 px-4 text-right w-44">Nominal</th>
              {(onEdit || onDelete) && (
                <th className="py-3 px-4 text-right w-20">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1E23]">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="h-3 w-20 bg-[#1C1E23] rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-3.5 w-36 bg-[#1C1E23] rounded mb-1" />
                    <div className="h-2.5 w-24 bg-[#1C1E23]/60 rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-3 w-16 bg-[#1C1E23] rounded" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-3.5 w-24 bg-[#1C1E23] rounded ml-auto" />
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-3 w-10 bg-[#1C1E23] rounded ml-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={(onEdit || onDelete) ? 5 : 4}
                  className="py-12 text-center text-[#8E929B]"
                >
                  <p className="text-sm font-medium text-[#D1D3D8]">
                    Tidak ada transaksi
                  </p>
                  <p className="text-xs text-[#5C606A] mt-1">
                    {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all'
                      ? 'Tidak ada data yang sesuai dengan filter pencarian.'
                      : 'Belum ada transaksi tercatat dalam sistem.'}
                  </p>
                  {onAddNew && (
                    <button
                      onClick={onAddNew}
                      className="mt-3 inline-flex items-center px-3 py-1.5 rounded-md bg-[#181A1E] hover:bg-[#23262D] text-[#F4F4F6] text-xs font-medium border border-[#23262D] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Catat Transaksi
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#16181C] transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-[#8E929B] tabular-nums">
                      {formatDateIndonesia(tx.transaction_date)}
                    </td>

                    {/* Title & Description */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#F4F4F6] block">
                        {tx.title}
                      </span>
                      {tx.description && (
                        <span className="text-[11px] text-[#5C606A] block truncate max-w-sm">
                          {tx.description}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block text-[11px] text-[#8E929B] font-medium">
                        {tx.category_name || '-'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 whitespace-nowrap text-right tabular-nums">
                      <span
                        className={`font-medium text-xs sm:text-sm ${
                          isIncome ? 'text-emerald-400' : 'text-[#F4F4F6]'
                        }`}
                      >
                        {isIncome ? '+ ' : '- '}
                        {formatRupiah(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    {(onEdit || onDelete) && (
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(tx)}
                              className="text-[#8E929B] hover:text-[#F4F4F6] transition-colors p-1"
                              title="Edit"
                              aria-label="Edit Transaksi"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(tx)}
                              className="text-[#8E929B] hover:text-rose-400 transition-colors p-1"
                              title="Hapus"
                              aria-label="Hapus Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

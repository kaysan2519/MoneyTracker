'use client';

import React from 'react';
import { Transaction, Category } from '@/types';
import { formatRupiah, formatDateIndonesia } from '@/lib/utils';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Pencil, 
  Trash2, 
  Search, 
  Filter, 
  Receipt,
  Plus
} from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  categories?: Category[];
  loading?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onAddNew?: () => void;
  // Controls & Filters
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  typeFilter?: string;
  onTypeFilterChange?: (val: string) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (val: string) => void;
  compact?: boolean; // Mode ringkas untuk Dashboard
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
    <div className="rounded-2xl bg-[#111726] border border-[#1e293b] shadow-lg shadow-black/20 overflow-hidden">
      {/* Controls Bar (Search & Filters) jika bukan mode compact */}
      {showControls && (
        <div className="p-4 sm:p-5 border-b border-[#1e293b] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari transaksi berdasarkan judul atau catatan..."
              value={searchTerm || ''}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#090d16] border border-[#1e293b] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Jenis */}
            {onTypeFilterChange && (
              <div className="relative">
                <select
                  value={typeFilter || 'all'}
                  onChange={(e) => onTypeFilterChange(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-[#090d16] border border-[#1e293b] text-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors appearance-none pr-8 cursor-pointer"
                >
                  <option value="all">Semua Jenis</option>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
                <Filter className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              </div>
            )}

            {/* Filter Kategori */}
            {onCategoryFilterChange && (
              <div className="relative">
                <select
                  value={categoryFilter || 'all'}
                  onChange={(e) => onCategoryFilterChange(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-[#090d16] border border-[#1e293b] text-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors appearance-none pr-8 cursor-pointer"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type === 'income' ? 'Masuk' : 'Keluar'})
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e293b] bg-[#0d131f]/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4 sm:px-6">Transaksi</th>
              <th className="py-3.5 px-4">Kategori</th>
              <th className="py-3.5 px-4">Tanggal</th>
              <th className="py-3.5 px-4 text-right">Nominal</th>
              {(onEdit || onDelete) && (
                <th className="py-3.5 px-4 sm:px-6 text-center w-24">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]/60 text-sm">
            {loading ? (
              // Loading Skeleton
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4 sm:px-6">
                    <div className="h-4 w-32 bg-slate-800 rounded mb-1" />
                    <div className="h-3 w-20 bg-slate-800/60 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-20 bg-slate-800 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-slate-800 rounded" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-28 bg-slate-800 rounded ml-auto" />
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="h-6 w-16 bg-slate-800 rounded mx-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : transactions.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={(onEdit || onDelete) ? 5 : 4}
                  className="py-16 text-center text-slate-400"
                >
                  <div className="inline-flex p-3 rounded-2xl bg-slate-800/50 text-slate-400 mb-3">
                    <Receipt className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-200">
                    Tidak Ada Transaksi Ditemukan
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all'
                      ? 'Coba sesuaikan filter atau kata kunci pencarian Anda.'
                      : 'Mulai mencatat pemasukan dan pengeluaran Anda sekarang.'}
                  </p>
                  {onAddNew && (
                    <button
                      onClick={onAddNew}
                      className="mt-4 inline-flex items-center px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Tambah Transaksi
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              // Data Rows
              transactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#161f33]/60 transition-colors group"
                  >
                    {/* Title & Description */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-xl flex-shrink-0 ${
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-100 truncate max-w-xs sm:max-w-md">
                            {tx.title}
                          </p>
                          {tx.description && (
                            <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md mt-0.5">
                              {tx.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1a2337] text-slate-300 border border-[#2b3854]">
                        {tx.category_name || 'Tanpa Kategori'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-300">
                      {formatDateIndonesia(tx.transaction_date)}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <span
                        className={`font-bold tracking-tight text-sm sm:text-base ${
                          isIncome ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isIncome ? '+ ' : '- '}
                        {formatRupiah(tx.amount)}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    {(onEdit || onDelete) && (
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1.5 opacity-90 group-hover:opacity-100">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              title="Edit Transaksi"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
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

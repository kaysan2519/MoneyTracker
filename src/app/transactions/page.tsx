'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import TransactionTable from '@/components/TransactionTable';
import TransactionModal from '@/components/TransactionModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DbStatusBanner from '@/components/DbStatusBanner';
import { Transaction, Category } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Download, Plus } from 'lucide-react';

export default function TransactionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [dbErrorMessage, setDbErrorMessage] = useState<string>('');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const checkDbHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setDbConnected(Boolean(data.data?.connected));
      if (!data.data?.connected) {
        setDbErrorMessage(data.message || 'Database belum dikonfigurasi.');
      }
    } catch {
      setDbConnected(false);
      setDbErrorMessage('Gagal menghubungi endpoint status database.');
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (categoryFilter !== 'all') params.append('category_id', categoryFilter);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      params.append('sort', sort);
      params.append('limit', String(pageSize));
      params.append('offset', String((page - 1) * pageSize));

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setTransactions(json.data.items || []);
        setTotalCount(json.data.total || 0);
      } else {
        setTransactions([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, typeFilter, categoryFilter, startDate, endDate, sort, page]);

  useEffect(() => {
    checkDbHealth();
    fetchCategories();
  }, [checkDbHealth, fetchCategories]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
  };

  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTx) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${deletingTx.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDeletingTx(null);
        await fetchTransactions();
      } else {
        alert(data.message || 'Gagal menghapus transaksi.');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus transaksi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('Tidak ada transaksi untuk diekspor.');
      return;
    }

    const headers = ['ID', 'Judul', 'Kategori', 'Jenis', 'Nominal', 'Tanggal', 'Deskripsi'];
    const rows = transactions.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.category_name || '').replace(/"/g, '""')}"`,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.amount,
      t.transaction_date,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-[#F4F4F6] flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        dbConnected={dbConnected}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <Header
          title="Transaksi"
          subtitle="Riwayat seluruh catatan transaksi keuangan"
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenAddTransaction={handleOpenAdd}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
          dbConnected={dbConnected}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-4">
          <DbStatusBanner
            dbConnected={dbConnected}
            errorMessage={dbErrorMessage}
          />

          {/* Subheader Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#8E929B]">
                Total ditemukan:
              </span>
              <span className="text-xs font-semibold text-[#F4F4F6] tabular-nums">
                {totalCount} transaksi
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium text-[#8E929B] hover:text-[#F4F4F6] hover:bg-[#181A1E] transition-colors"
                title="Unduh format CSV"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Ekspor CSV
              </button>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Tambah Transaksi
              </button>
            </div>
          </div>

          {/* Filter Bar (Date range & Sort) */}
          <div className="p-3 rounded-lg bg-[#121316] border border-[#1C1E23] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-[#8E929B] mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded-md bg-[#0C0D0E] border border-[#23262D] text-xs text-[#F4F4F6] focus:border-[#3E424D] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#8E929B] mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded-md bg-[#0C0D0E] border border-[#23262D] text-xs text-[#F4F4F6] focus:border-[#3E424D] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#8E929B] mb-1">
                Urutkan
              </label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded-md bg-[#0C0D0E] border border-[#23262D] text-xs text-[#F4F4F6] focus:border-[#3E424D] transition-colors cursor-pointer"
              >
                <option value="date_desc">Tanggal Terbaru</option>
                <option value="date_asc">Tanggal Terlama</option>
                <option value="amount_desc">Nominal Terbesar</option>
                <option value="amount_asc">Nominal Terkecil</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <TransactionTable
            transactions={transactions}
            categories={categories}
            loading={loading}
            onEdit={handleOpenEdit}
            onDelete={(tx) => setDeletingTx(tx)}
            onAddNew={handleOpenAdd}
            searchTerm={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            typeFilter={typeFilter}
            onTypeFilterChange={(val) => {
              setTypeFilter(val);
              setPage(1);
            }}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={(val) => {
              setCategoryFilter(val);
              setPage(1);
            }}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-2 text-xs text-[#8E929B]">
              <span>
                Halaman {page} dari {totalPages}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-md hover:bg-[#181A1E] text-[#8E929B] hover:text-[#F4F4F6] disabled:opacity-30 transition-colors"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-medium text-[#F4F4F6]">
                  {page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-md hover:bg-[#181A1E] text-[#8E929B] hover:text-[#F4F4F6] disabled:opacity-30 transition-colors"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTransactions}
        transactionToEdit={editingTx}
        categories={categories}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingTx)}
        title="Hapus Transaksi"
        message="Data transaksi akan dihapus secara permanen dari database."
        itemName={deletingTx ? `${deletingTx.title} (${deletingTx.type === 'income' ? '+' : '-'} ${formatRupiah(deletingTx.amount)})` : ''}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import TransactionTable from '@/components/TransactionTable';
import TransactionModal from '@/components/TransactionModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DbStatusBanner from '@/components/DbStatusBanner';
import { ArrowRight, Plus } from 'lucide-react';
import { DashboardSummary, Transaction, Category } from '@/types';
import { formatRupiah } from '@/lib/utils';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [dbErrorMessage, setDbErrorMessage] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [summary, setSummary] = useState<DashboardSummary>({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    transactionCount: 0,
    recentTransactions: [],
    categoryBreakdown: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);

  // Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
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

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/summary');
      const json = await res.json();
      if (json.success && json.data) {
        setSummary(json.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
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

  const loadData = useCallback(async () => {
    await Promise.all([checkDbHealth(), fetchSummary(), fetchCategories()]);
    setLoading(false);
    setRefreshing(false);
  }, [checkDbHealth, fetchSummary, fetchCategories]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
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
        await loadData();
      } else {
        alert(data.message || 'Gagal menghapus transaksi.');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus transaksi.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-[#F4F4F6] flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        dbConnected={dbConnected}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <Header
          title="Dashboard"
          subtitle="Ringkasan arus kas keuangan pribadi"
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenAddTransaction={handleOpenAdd}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
          dbConnected={dbConnected}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
          <DbStatusBanner
            dbConnected={dbConnected}
            errorMessage={dbErrorMessage}
          />

          {/* Integrated Financial Overview Panel */}
          <div className="p-6 rounded-lg bg-[#121316] border border-[#1C1E23]">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-[#1C1E23]">
              <div>
                <p className="text-xs font-medium text-[#8E929B] tracking-wide mb-1">
                  Saldo Bersih
                </p>
                {loading ? (
                  <div className="h-9 w-48 bg-[#1C1E23] rounded animate-pulse" />
                ) : (
                  <h2
                    className={`text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums ${
                      summary.netBalance >= 0 ? 'text-[#F4F4F6]' : 'text-rose-400'
                    }`}
                  >
                    {formatRupiah(summary.netBalance)}
                  </h2>
                )}
              </div>

              <button
                onClick={handleOpenAdd}
                className="self-start sm:self-auto inline-flex items-center px-3 py-1.5 rounded-md bg-[#181A1E] hover:bg-[#23262D] text-[#F4F4F6] text-xs font-medium border border-[#23262D] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1 text-[#8E929B]" />
                Catat Transaksi
              </button>
            </div>

            {/* Sub Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5">
              <div>
                <p className="text-xs text-[#8E929B] mb-0.5">Total Pemasukan</p>
                {loading ? (
                  <div className="h-6 w-28 bg-[#1C1E23] rounded animate-pulse" />
                ) : (
                  <p className="text-base font-semibold text-emerald-400 tabular-nums">
                    {formatRupiah(summary.totalIncome)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-[#8E929B] mb-0.5">Total Pengeluaran</p>
                {loading ? (
                  <div className="h-6 w-28 bg-[#1C1E23] rounded animate-pulse" />
                ) : (
                  <p className="text-base font-semibold text-[#F4F4F6] tabular-nums">
                    {formatRupiah(summary.totalExpense)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-[#8E929B] mb-0.5">Volume Transaksi</p>
                {loading ? (
                  <div className="h-6 w-20 bg-[#1C1E23] rounded animate-pulse" />
                ) : (
                  <p className="text-base font-semibold text-[#D1D3D8] tabular-nums">
                    {summary.transactionCount}{' '}
                    <span className="text-xs font-normal text-[#5C606A]">catatan</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown Section */}
          <CategoryBreakdown
            data={summary.categoryBreakdown}
            totalExpense={summary.totalExpense}
            loading={loading}
          />

          {/* Recent Transactions Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F6]">
                  Transaksi Terbaru
                </h3>
                <p className="text-xs text-[#8E929B]">
                  5 catatan transaksi terakhir
                </p>
              </div>

              <Link
                href="/transactions"
                className="inline-flex items-center text-xs text-[#8E929B] hover:text-[#F4F4F6] transition-colors"
              >
                Lihat semua transaksi
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <TransactionTable
              transactions={summary.recentTransactions}
              categories={categories}
              loading={loading}
              compact={true}
              onEdit={handleOpenEdit}
              onDelete={(tx) => setDeletingTx(tx)}
              onAddNew={handleOpenAdd}
            />
          </div>
        </main>
      </div>

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSuccess={loadData}
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

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
import { ArrowRight, Plus, Check } from 'lucide-react';
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Global Keyboard Shortcut: 'N' to open add modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'n' || e.key === 'N') && !isTxModalOpen && !deletingTx) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          return;
        }
        e.preventDefault();
        setEditingTx(null);
        setIsTxModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTxModalOpen, deletingTx]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
        showToast('Transaksi berhasil dihapus');
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

  // Filter recent transactions if category drilldown is active
  const filteredRecentTransactions = selectedCategoryId
    ? summary.recentTransactions.filter((tx) => tx.category_id === selectedCategoryId)
    : summary.recentTransactions;

  // Flow ratio calculation
  const expenseRatio = summary.totalIncome > 0
    ? (summary.totalExpense / summary.totalIncome) * 100
    : 0;

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
                <span className="text-xs font-medium text-[#8E929B] tracking-wide block mb-1">
                  Saldo Bersih
                </span>
                <div className="flex items-baseline gap-3">
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

                  {!loading && (
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                        summary.netBalance >= 0
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                      }`}
                    >
                      {summary.netBalance >= 0 ? 'Surplus' : 'Defisit'}
                    </span>
                  )}
                </div>
              </div>

              {/* Flow Ratio Mini Bar (UX Wah) */}
              <div className="w-full sm:w-64 space-y-1.5 self-start sm:self-auto">
                <div className="flex justify-between text-[11px] text-[#8E929B] tabular-nums">
                  <span>Rasio Pengeluaran</span>
                  <span>{expenseRatio.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1C1E23] rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${Math.max(0, 100 - expenseRatio)}%` }}
                    title="Pemasukan Tersisa"
                  />
                  <div
                    className="bg-rose-400 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, expenseRatio)}%` }}
                    title="Pengeluaran"
                  />
                </div>
              </div>
            </div>

            {/* Sub Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5">
              <div>
                <span className="text-xs text-[#8E929B] block mb-0.5">Total Pemasukan</span>
                {loading ? (
                  <div className="h-6 w-28 bg-[#1C1E23] rounded animate-pulse" />
                ) : (
                  <p className="text-base font-semibold text-emerald-400 tabular-nums">
                    {formatRupiah(summary.totalIncome)}
                  </p>
                )}
              </div>

              <div>
                <span className="text-xs text-[#8E929B] block mb-0.5">Total Pengeluaran</span>
                {loading ? (
                  <div className="h-6 w-28 bg-[#1C1E23] rounded animate-pulse" />
                ) : (
                  <p className="text-base font-semibold text-[#F4F4F6] tabular-nums">
                    {formatRupiah(summary.totalExpense)}
                  </p>
                )}
              </div>

              <div>
                <span className="text-xs text-[#8E929B] block mb-0.5">Volume Transaksi</span>
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

          {/* Interactive Category Breakdown */}
          <CategoryBreakdown
            data={summary.categoryBreakdown}
            totalExpense={summary.totalExpense}
            loading={loading}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(catId) => setSelectedCategoryId(catId)}
          />

          {/* Recent Transactions Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F6] flex items-center gap-2">
                  <span>Transaksi Terbaru</span>
                  {selectedCategoryId && (
                    <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Disaring berdasarkan kategori
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#8E929B]">
                  {selectedCategoryId
                    ? 'Menampilkan transaksi untuk kategori terpilih'
                    : '5 catatan transaksi terakhir'}
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
              transactions={filteredRecentTransactions}
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
        onSuccess={() => {
          loadData();
          showToast('Transaksi berhasil dicatat!');
        }}
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

      {/* Floating subtle toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#16181E] border border-[#2B2F3B] text-[#ECECEE] px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

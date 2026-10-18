'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import TransactionTable from '@/components/TransactionTable';
import TransactionModal from '@/components/TransactionModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DbStatusBanner from '@/components/DbStatusBanner';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { DashboardSummary, Transaction, Category } from '@/types';

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

  // Check Database Status
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
      setDbErrorMessage('Gagal menghubungi endpoint health check.');
    }
  }, []);

  // Fetch Dashboard Summary
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

  // Fetch Categories
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

  // Load all data
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

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  // Handle delete
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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        dbConnected={dbConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Header */}
        <Header
          title="Dashboard"
          subtitle="Ringkasan arus kas dan performa keuangan pribadi Anda"
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenAddTransaction={handleOpenAdd}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
          dbConnected={dbConnected}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Database Banner if not connected */}
          <DbStatusBanner
            dbConnected={dbConnected}
            errorMessage={dbErrorMessage}
          />

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Saldo Bersih"
              amount={summary.netBalance}
              type="balance"
              icon={Wallet}
              subtitle="Pemasukan - Pengeluaran"
              loading={loading}
            />
            <StatCard
              title="Total Pemasukan"
              amount={summary.totalIncome}
              type="income"
              icon={TrendingUp}
              subtitle="Seluruh arus kas masuk"
              loading={loading}
            />
            <StatCard
              title="Total Pengeluaran"
              amount={summary.totalExpense}
              type="expense"
              icon={TrendingDown}
              subtitle="Seluruh arus kas keluar"
              loading={loading}
            />
            <StatCard
              title="Jumlah Transaksi"
              amount={summary.transactionCount}
              isCurrency={false}
              type="count"
              icon={Activity}
              subtitle="Total catatan transaksi"
              loading={loading}
            />
          </div>

          {/* Middle Section: Breakdown & Quick Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Breakdown (2 Cols on lg) */}
            <div className="lg:col-span-2">
              <CategoryBreakdown
                data={summary.categoryBreakdown}
                totalExpense={summary.totalExpense}
                loading={loading}
              />
            </div>

            {/* Financial Health Summary Card */}
            <div className="p-6 rounded-2xl bg-[#111726] border border-[#1e293b] flex flex-col justify-between shadow-lg shadow-black/20">
              <div>
                <div className="flex items-center space-x-2.5 pb-4 border-b border-[#1e293b]">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Rasio Keuangan</h3>
                    <p className="text-xs text-slate-400">Kesehatan arus kas</p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Rasio Penghematan (Savings Rate)</span>
                      <span className="font-semibold text-slate-200">
                        {summary.totalIncome > 0
                          ? `${Math.max(
                              0,
                              Math.round(((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100)
                            )}%`
                          : '0%'}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            summary.totalIncome > 0
                              ? Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    ((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100
                                  )
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#090d16] border border-[#1e293b] space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Status Finansial:</span>
                      <span
                        className={`font-semibold ${
                          summary.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {summary.netBalance >= 0 ? 'Surplus (Aman)' : 'Defisit (Perhatian)'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Kategori Aktif:</span>
                      <span className="font-semibold text-slate-200">
                        {summary.categoryBreakdown.length} Kategori
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-6 border-t border-[#1e293b]">
                <button
                  onClick={handleOpenAdd}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all text-center block"
                >
                  + Catat Transaksi Baru
                </button>
              </div>
            </div>
          </div>

          {/* Recent Transactions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Transaksi Terbaru
                </h2>
                <p className="text-xs text-slate-400">
                  5 catatan transaksi terakhir yang tercatat di database
                </p>
              </div>

              <Link
                href="/transactions"
                className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Lihat Semua Transaksi
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

      {/* Transaction Modal (Create / Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSuccess={loadData}
        transactionToEdit={editingTx}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTx)}
        title="Hapus Transaksi"
        message="Apakah Anda yakin ingin menghapus transaksi ini? Data akan dihapus secara permanen dari database."
        itemName={deletingTx ? `${deletingTx.title} (${deletingTx.type === 'income' ? '+' : '-'} Rp ${deletingTx.amount})` : ''}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </div>
  );
}

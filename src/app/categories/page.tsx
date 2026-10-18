'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CategoryModal from '@/components/CategoryModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DbStatusBanner from '@/components/DbStatusBanner';
import { Category, TransactionType } from '@/types';
import { 
  Tags, 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight,
  FolderTree
} from 'lucide-react';

export default function CategoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [dbErrorMessage, setDbErrorMessage] = useState<string>('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
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

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    checkDbHealth();
    fetchCategories();
  }, [checkDbHealth, fetchCategories]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDeletingCategory(null);
        await fetchCategories();
      } else {
        alert(data.message || 'Gagal menghapus kategori.');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus kategori.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (activeTab === 'all') return true;
    return cat.type === activeTab;
  });

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        dbConnected={dbConnected}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          title="Manajemen Kategori"
          subtitle="Atur kategori pemasukan dan pengeluaran transaksi Anda"
          onOpenSidebar={() => setSidebarOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
          dbConnected={dbConnected}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
          <DbStatusBanner
            dbConnected={dbConnected}
            errorMessage={dbErrorMessage}
          />

          {/* Action Bar & Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111726] border border-[#1e293b]">
            <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-[#090d16] border border-[#1e293b] self-start">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'expense'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pengeluaran ({expenseCategories.length})
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'income'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pemasukan ({incomeCategories.length})
              </button>
            </div>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Kategori
            </button>
          </div>

          {/* Grid Kategori */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-[#111726] border border-[#1e293b] animate-pulse h-24"
                />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#111726] border border-[#1e293b]">
              <div className="inline-flex p-3 rounded-2xl bg-slate-800/50 text-slate-400 mb-3">
                <FolderTree className="w-8 h-8" />
              </div>
              <h4 className="text-base font-semibold text-slate-200">
                Belum Ada Kategori
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Tambahkan kategori pertama Anda untuk mengelompokkan catatan transaksi finansial.
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-4 inline-flex items-center px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Tambah Kategori Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((cat) => {
                const isIncome = cat.type === 'income';
                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] hover:border-slate-700 transition-all duration-200 flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div
                        className={`p-2.5 rounded-xl flex-shrink-0 ${
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                          {cat.name}
                        </h4>
                        <span
                          className={`inline-block text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${
                            isIncome ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        title="Edit Kategori"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCategories}
        categoryToEdit={editingCategory}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingCategory)}
        title="Hapus Kategori"
        message="Apakah Anda yakin ingin menghapus kategori ini? Kategori tidak dapat dihapus jika masih digunakan oleh transaksi yang ada."
        itemName={deletingCategory ? `${deletingCategory.name} (${deletingCategory.type === 'income' ? 'Pemasukan' : 'Pengeluaran'})` : ''}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </div>
  );
}

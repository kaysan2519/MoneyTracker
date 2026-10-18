'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CategoryModal from '@/components/CategoryModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DbStatusBanner from '@/components/DbStatusBanner';
import { Category } from '@/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

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
        alert(data.message || 'Kategori ini tidak dapat dihapus karena masih digunakan oleh transaksi.');
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

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-[#F4F4F6] flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        dbConnected={dbConnected}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <Header
          title="Kategori"
          subtitle="Daftar kategori untuk mengelompokkan arus kas"
          onOpenSidebar={() => setSidebarOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
          dbConnected={dbConnected}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-4">
          <DbStatusBanner
            dbConnected={dbConnected}
            errorMessage={dbErrorMessage}
          />

          {/* Action & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Segmented Filter */}
            <div className="flex items-center space-x-1 p-0.5 rounded-md bg-[#121316] border border-[#1C1E23] self-start">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-[#1E2026] text-[#F4F4F6]'
                    : 'text-[#8E929B] hover:text-[#D1D3D8]'
                }`}
              >
                Semua ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'expense'
                    ? 'bg-[#1E2026] text-[#F4F4F6]'
                    : 'text-[#8E929B] hover:text-[#D1D3D8]'
                }`}
              >
                Pengeluaran ({categories.filter((c) => c.type === 'expense').length})
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'income'
                    ? 'bg-[#1E2026] text-[#F4F4F6]'
                    : 'text-[#8E929B] hover:text-[#D1D3D8]'
                }`}
              >
                Pemasukan ({categories.filter((c) => c.type === 'income').length})
              </button>
            </div>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Tambah Kategori
            </button>
          </div>

          {/* Clean Categories Table */}
          <div className="rounded-lg bg-[#121316] border border-[#1C1E23] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1C1E23] text-[11px] font-medium text-[#5C606A] uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Kategori</th>
                  <th className="py-3 px-4 w-40">Jenis</th>
                  <th className="py-3 px-4 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1E23]">
                {loading ? (
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3.5 px-4">
                        <div className="h-3.5 w-32 bg-[#1C1E23] rounded" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-3 w-16 bg-[#1C1E23] rounded" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="h-3 w-10 bg-[#1C1E23] rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-[#8E929B]">
                      <p className="text-sm font-medium text-[#D1D3D8]">
                        Belum ada kategori
                      </p>
                      <p className="text-xs text-[#5C606A] mt-1">
                        Tambahkan kategori baru untuk mengelompokkan transaksi Anda.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const isIncome = cat.type === 'income';
                    return (
                      <tr
                        key={cat.id}
                        className="hover:bg-[#16181C] transition-colors group"
                      >
                        <td className="py-3 px-4 font-medium text-[#F4F4F6]">
                          {cat.name}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[11px] font-medium ${
                              isIncome ? 'text-emerald-400' : 'text-[#8E929B]'
                            }`}
                          >
                            {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEdit(cat)}
                              className="text-[#8E929B] hover:text-[#F4F4F6] transition-colors p-1"
                              title="Ubah"
                              aria-label="Ubah Kategori"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingCategory(cat)}
                              className="text-[#8E929B] hover:text-rose-400 transition-colors p-1"
                              title="Hapus"
                              aria-label="Hapus Kategori"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
        message="Kategori tidak dapat dihapus jika masih digunakan oleh transaksi di database."
        itemName={deletingCategory ? `${deletingCategory.name} (${deletingCategory.type === 'income' ? 'Pemasukan' : 'Pengeluaran'})` : ''}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </div>
  );
}

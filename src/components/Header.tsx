'use client';

import React from 'react';
import { Menu, Plus, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
  onOpenAddTransaction?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  dbConnected?: boolean | null;
}

export default function Header({
  title,
  subtitle,
  onOpenSidebar,
  onOpenAddTransaction,
  onRefresh,
  isRefreshing,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-8 bg-[#0C0D0E]/95 backdrop-blur-sm border-b border-[#1C1E23]">
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onOpenSidebar}
          className="p-1.5 text-[#8E929B] rounded hover:text-white hover:bg-[#181A1E] lg:hidden"
          aria-label="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Title & Subtitle */}
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-[#F4F4F6] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#8E929B] hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2.5">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-[#8E929B] rounded-md hover:text-[#F4F4F6] hover:bg-[#181A1E] transition-colors disabled:opacity-50"
            title="Segarkan data"
            aria-label="Segarkan data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        )}

        {onOpenAddTransaction && (
          <button
            onClick={onOpenAddTransaction}
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Tambah Transaksi</span>
          </button>
        )}
      </div>
    </header>
  );
}

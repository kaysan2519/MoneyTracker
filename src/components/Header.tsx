'use client';

import React from 'react';
import { Menu, Plus, RefreshCw, Database } from 'lucide-react';

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
  dbConnected,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-8 bg-[#090d16]/90 backdrop-blur-md border-b border-[#1e293b]">
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-400 rounded-xl hover:text-white hover:bg-slate-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Buka Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Title & Subtitle */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            {title}
            {dbConnected !== undefined && (
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-normal ${
                  dbConnected === true
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : dbConnected === false
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    : 'bg-slate-800 text-slate-400'
                }`}
                title={dbConnected === true ? 'Database Aiven terhubung' : 'Database Aiven belum dikonfigurasi pada .env.local'}
              >
                <Database className="w-3 h-3" />
                {dbConnected === true ? 'Aiven Active' : dbConnected === false ? 'Aiven Offline' : 'Checking'}
              </span>
            )}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 text-slate-400 rounded-xl bg-[#131b2c] border border-[#1e293b] hover:text-white hover:border-slate-700 transition-all disabled:opacity-50"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        )}

        {onOpenAddTransaction && (
          <button
            onClick={onOpenAddTransaction}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Tambah Transaksi</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        )}
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Tags, 
  Wallet, 
  Database,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  dbConnected?: boolean | null;
}

export default function Sidebar({ isOpen, onClose, dbConnected }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Transaksi',
      href: '/transactions',
      icon: ArrowLeftRight,
    },
    {
      name: 'Kategori',
      href: '/categories',
      icon: Tags,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#0d131f] border-r border-[#1e293b] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#1e293b]">
          <Link href="/" className="flex items-center space-x-3 group" onClick={onClose}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Money Tracker
              </span>
              <span className="block text-[11px] text-slate-400 font-medium">Personal Finance</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 rounded-lg hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 ml-auto rounded-full bg-emerald-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Database Status */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-[#131b2c] border border-[#1e293b]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center text-xs font-medium text-slate-300">
              <Database className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              MySQL Aiven
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                dbConnected === true
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : dbConnected === false
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 mr-1 rounded-full ${
                  dbConnected === true
                    ? 'bg-emerald-400'
                    : dbConnected === false
                    ? 'bg-amber-400'
                    : 'bg-slate-400'
                }`}
              />
              {dbConnected === true ? 'Terhubung' : dbConnected === false ? 'Belum Disetel' : 'Memeriksa...'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Database: <span className="font-mono text-slate-300">money_tracker</span>
          </p>
        </div>
      </aside>
    </>
  );
}

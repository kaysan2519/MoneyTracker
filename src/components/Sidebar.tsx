'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Tag, 
  Wallet,
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
      icon: Tag,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-60 bg-[#0F1012] border-r border-[#1C1E23] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#1C1E23]">
          <Link href="/" className="flex items-center space-x-2.5 group" onClick={onClose}>
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#181A1E] border border-[#262930] text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-[#F4F4F6] block">
                Money Tracker
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 text-[#8E929B] rounded hover:text-white hover:bg-[#1A1C21] lg:hidden"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-medium tracking-wider text-[#5C606A] uppercase">
            Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#181A1E] text-[#F4F4F6] font-semibold'
                    : 'text-[#8E929B] hover:text-[#EDEDED] hover:bg-[#141518]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 mr-2.5 ${
                    isActive ? 'text-emerald-400' : 'text-[#6C707A]'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Database Status */}
        <div className="p-3.5 mx-3 mb-3 rounded-lg bg-[#131417] border border-[#1E2026]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8E929B]">
              MySQL Aiven
            </span>
            <span className="flex items-center text-[11px] font-medium text-[#A1A1AA]">
              <span
                className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                  dbConnected === true
                    ? 'bg-emerald-400'
                    : dbConnected === false
                    ? 'bg-amber-400'
                    : 'bg-[#5C606A]'
                }`}
              />
              {dbConnected === true ? 'Aktif' : dbConnected === false ? 'Offline' : 'Menghubungkan'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

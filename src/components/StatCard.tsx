'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface StatCardProps {
  title: string;
  amount: number;
  isCurrency?: boolean;
  type?: 'income' | 'expense' | 'balance' | 'count';
  icon: LucideIcon;
  subtitle?: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  amount,
  isCurrency = true,
  type = 'balance',
  icon: Icon,
  subtitle,
  loading = false,
}: StatCardProps) {
  // Tentukan palet warna berdasarkan tipe
  let colorStyles = {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    iconBg: 'bg-emerald-500/15 text-emerald-400',
    valueText: 'text-white',
    borderGlow: 'hover:border-emerald-500/30',
  };

  if (type === 'income') {
    colorStyles = {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      valueText: 'text-emerald-400',
      borderGlow: 'hover:border-emerald-500/30',
    };
  } else if (type === 'expense') {
    colorStyles = {
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      iconBg: 'bg-rose-500/15 text-rose-400',
      valueText: 'text-rose-400',
      borderGlow: 'hover:border-rose-500/30',
    };
  } else if (type === 'balance') {
    const isPositive = amount >= 0;
    colorStyles = {
      badge: isPositive
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      iconBg: isPositive
        ? 'bg-emerald-500/15 text-emerald-400'
        : 'bg-rose-500/15 text-rose-400',
      valueText: isPositive ? 'text-emerald-400' : 'text-rose-400',
      borderGlow: isPositive ? 'hover:border-emerald-500/30' : 'hover:border-rose-500/30',
    };
  } else if (type === 'count') {
    colorStyles = {
      badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      iconBg: 'bg-indigo-500/15 text-indigo-400',
      valueText: 'text-white',
      borderGlow: 'hover:border-indigo-500/30',
    };
  }

  return (
    <div
      className={`relative p-6 rounded-2xl bg-[#111726] border border-[#1e293b] shadow-lg shadow-black/20 transition-all duration-300 ${colorStyles.borderGlow}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className={`p-2.5 rounded-xl ${colorStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="h-8 w-36 bg-slate-800 rounded animate-pulse my-1" />
        ) : (
          <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight ${colorStyles.valueText}`}>
            {isCurrency ? formatRupiah(amount) : amount.toLocaleString('id-ID')}
          </h3>
        )}

        {subtitle && (
          <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

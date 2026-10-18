'use client';

import React from 'react';
import { formatRupiah } from '@/lib/utils';

interface StatCardProps {
  title: string;
  amount: number;
  isCurrency?: boolean;
  type?: 'income' | 'expense' | 'balance' | 'count';
  subtitle?: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  amount,
  isCurrency = true,
  type = 'balance',
  subtitle,
  loading = false,
}: StatCardProps) {
  let valueColor = 'text-[#F4F4F6]';
  if (type === 'income') {
    valueColor = 'text-emerald-400';
  } else if (type === 'expense') {
    valueColor = 'text-rose-400';
  } else if (type === 'balance') {
    valueColor = amount >= 0 ? 'text-[#F4F4F6]' : 'text-rose-400';
  }

  return (
    <div className="p-4 sm:p-5 rounded-lg bg-[#121316] border border-[#1C1E23]">
      <p className="text-xs font-medium text-[#8E929B] tracking-wide mb-1.5">
        {title}
      </p>

      {loading ? (
        <div className="h-7 w-32 bg-[#1C1E23] rounded animate-pulse my-1" />
      ) : (
        <p className={`text-xl sm:text-2xl font-semibold tracking-tight tabular-nums ${valueColor}`}>
          {isCurrency ? formatRupiah(amount) : amount.toLocaleString('id-ID')}
        </p>
      )}

      {subtitle && (
        <p className="text-[11px] text-[#5C606A] mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { CategoryExpenseBreakdown } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { PieChart, Tag, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface CategoryBreakdownProps {
  data: CategoryExpenseBreakdown[];
  totalExpense: number;
  loading?: boolean;
}

const PALETTE = [
  '#10B981', // emerald
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F43F5E', // rose
];

export default function CategoryBreakdown({
  data,
  totalExpense,
  loading = false,
}: CategoryBreakdownProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-[#111726] border border-[#1e293b]">
        <div className="h-6 w-48 bg-slate-800 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full bg-slate-800 rounded animate-pulse" />
              <div className="h-2 w-full bg-slate-800/60 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-[#111726] border border-[#1e293b] shadow-lg shadow-black/20">
      <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-slate-800/80 text-emerald-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Ringkasan Pengeluaran</h3>
            <p className="text-xs text-slate-400">Berdasarkan kategori pengeluaran</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {formatRupiah(totalExpense)}
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {data.length === 0 ? (
          <div className="py-12 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-slate-800/40 text-slate-500 mb-3">
              <Tag className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-400">Belum ada data pengeluaran</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Transaksi pengeluaran yang Anda catat akan otomatis dikelompokkan berdasarkan kategori di sini.
            </p>
          </div>
        ) : (
          data.map((item, index) => {
            const color = PALETTE[index % PALETTE.length];
            return (
              <div key={item.category_id} className="group">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-200 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: color }}
                    />
                    {item.category_name}
                    <span className="text-xs text-slate-400 font-normal">
                      ({item.count} transaksi)
                    </span>
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-slate-100">
                      {formatRupiah(item.total)}
                    </span>
                    <span className="ml-2 text-xs font-medium text-slate-400">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(item.percentage, 2)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {data.length > 0 && (
        <div className="pt-4 mt-6 border-t border-[#1e293b]/60 flex justify-end">
          <Link
            href="/transactions?type=expense"
            className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors"
          >
            Lihat semua pengeluaran
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
}

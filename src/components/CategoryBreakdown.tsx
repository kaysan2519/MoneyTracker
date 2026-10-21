'use client';

import React from 'react';
import { CategoryExpenseBreakdown } from '@/types';
import { formatRupiah } from '@/lib/utils';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface CategoryBreakdownProps {
  data: CategoryExpenseBreakdown[];
  totalExpense: number;
  loading?: boolean;
  selectedCategoryId?: number | null;
  onSelectCategory?: (categoryId: number | null) => void;
}

export default function CategoryBreakdown({
  data,
  totalExpense,
  loading = false,
  selectedCategoryId,
  onSelectCategory,
}: CategoryBreakdownProps) {
  if (loading) {
    return (
      <div className="p-5 rounded-lg bg-[#121316] border border-[#1C1E23] space-y-3">
        <div className="h-4 w-32 bg-[#1C1E23] rounded animate-pulse" />
        <div className="space-y-2.5 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-3 bg-[#1C1E23] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-lg bg-[#121316] border border-[#1C1E23]">
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#1C1E23]">
        <div>
          <h3 className="text-sm font-semibold text-[#F4F4F6]">Pengeluaran per Kategori</h3>
          <p className="text-xs text-[#8E929B] mt-0.5">
            {onSelectCategory
              ? 'Klik kategori untuk memfilter transaksi di bawah'
              : 'Proporsi pengeluaran dari data transaksi'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedCategoryId && onSelectCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs text-emerald-400 hover:underline font-medium"
            >
              Tampilkan Semua
            </button>
          )}
          <span className="text-xs font-medium text-[#8E929B] tabular-nums">
            Total: <span className="text-[#F4F4F6] font-semibold">{formatRupiah(totalExpense)}</span>
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {data.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8E929B]">
            Belum ada data pengeluaran yang tercatat.
          </div>
        ) : (
          data.map((item) => {
            const isSelected = selectedCategoryId === item.category_id;
            return (
              <div
                key={item.category_id}
                onClick={() => onSelectCategory && onSelectCategory(isSelected ? null : item.category_id)}
                className={`p-2 rounded-md transition-all ${
                  onSelectCategory ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'bg-[#181A20] ring-1 ring-emerald-500/50 shadow-sm'
                    : 'hover:bg-[#16181C]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-[#D1D3D8] flex items-center gap-1.5">
                    {item.category_name}
                    <span className="text-[#5C606A] font-normal">({item.count})</span>
                    {isSelected && (
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider ml-1">
                        • Filter Aktif
                      </span>
                    )}
                  </span>
                  <div className="flex items-center space-x-2 tabular-nums">
                    <span className="text-[#F4F4F6] font-medium">{formatRupiah(item.total)}</span>
                    <span className="text-[#8E929B] w-10 text-right">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1C1E23] overflow-hidden">
                  <div
                    className="h-full bg-rose-400/80 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(item.percentage, 2)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {data.length > 0 && (
        <div className="pt-3.5 mt-3.5 border-t border-[#1C1E23] flex justify-end">
          <Link
            href="/transactions?type=expense"
            className="inline-flex items-center text-xs text-[#8E929B] hover:text-[#F4F4F6] transition-colors"
          >
            Lihat semua transaksi pengeluaran
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
}

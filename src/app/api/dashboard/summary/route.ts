import { NextResponse } from 'next/server';
import { query, isDatabaseConfigured } from '@/lib/db';
import { DashboardSummary, ApiResponse, Transaction, CategoryExpenseBreakdown } from '@/types';
import { RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

interface TotalsRow extends RowDataPacket {
  total_income: number;
  total_expense: number;
  transaction_count: number;
}

interface CategoryExpenseRow extends RowDataPacket {
  category_id: number;
  category_name: string;
  type: 'income' | 'expense';
  total: number;
  count: number;
}

interface TransactionRow extends RowDataPacket, Transaction {}

// GET /api/dashboard/summary
export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'DATABASE_NOT_CONFIGURED',
          message: 'Kredensial database Aiven belum dikonfigurasi.',
        },
        { status: 503 }
      );
    }

    // 1. Ambil total pemasukan, pengeluaran, dan total transaksi
    const totalsSql = `
      SELECT 
        CAST(COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS DOUBLE) AS total_income,
        CAST(COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS DOUBLE) AS total_expense,
        COUNT(*) AS transaction_count
      FROM transactions
    `;
    const totalsResult = await query<TotalsRow>(totalsSql);
    const totals = totalsResult[0] || { total_income: 0, total_expense: 0, transaction_count: 0 };

    const totalIncome = Number(totals.total_income) || 0;
    const totalExpense = Number(totals.total_expense) || 0;
    const netBalance = totalIncome - totalExpense;
    const transactionCount = Number(totals.transaction_count) || 0;

    // 2. Breakdown pengeluaran per kategori
    const categorySql = `
      SELECT 
        c.id AS category_id,
        c.name AS category_name,
        c.type,
        CAST(COALESCE(SUM(t.amount), 0) AS DOUBLE) AS total,
        COUNT(t.id) AS count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'expense'
      GROUP BY c.id, c.name, c.type
      ORDER BY total DESC
    `;
    const categoryRows = await query<CategoryExpenseRow>(categorySql);

    const categoryBreakdown: CategoryExpenseBreakdown[] = categoryRows.map((row) => {
      const catTotal = Number(row.total) || 0;
      const percentage = totalExpense > 0 ? (catTotal / totalExpense) * 100 : 0;
      return {
        category_id: row.category_id,
        category_name: row.category_name,
        type: row.type,
        total: catTotal,
        percentage: Number(percentage.toFixed(1)),
        count: Number(row.count) || 0,
      };
    });

    // 3. Transaksi terbaru (5 transaksi terakhir)
    const recentSql = `
      SELECT 
        t.id,
        t.category_id,
        c.name AS category_name,
        t.title,
        CAST(t.amount AS DOUBLE) AS amount,
        t.type,
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
        t.description,
        t.created_at,
        t.updated_at
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT 5
    `;
    const recentTransactions = await query<TransactionRow>(recentSql);

    const summary: DashboardSummary = {
      totalIncome,
      totalExpense,
      netBalance,
      transactionCount,
      recentTransactions,
      categoryBreakdown,
    };

    return NextResponse.json<ApiResponse<DashboardSummary>>({
      success: true,
      data: summary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server internal';
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'SERVER_ERROR', message },
      { status: 500 }
    );
  }
}

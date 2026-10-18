import { NextRequest, NextResponse } from 'next/server';
import { query, execute, isDatabaseConfigured } from '@/lib/db';
import { Transaction, ApiResponse } from '@/types';
import { RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

interface TransactionRow extends RowDataPacket, Transaction {}
interface CategoryRow extends RowDataPacket {
  id: number;
  name: string;
  type: 'income' | 'expense';
}
interface TotalCountRow extends RowDataPacket {
  total: number;
}

// GET /api/transactions - Mengambil daftar transaksi dengan filter & search
export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json<ApiResponse<Transaction[]>>(
        {
          success: false,
          error: 'DATABASE_NOT_CONFIGURED',
          message: 'Kredensial database Aiven belum dikonfigurasi.',
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const type = searchParams.get('type')?.trim();
    const categoryId = searchParams.get('category_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 200);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);
    const sort = searchParams.get('sort') || 'date_desc';

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (search) {
      conditions.push('(t.title LIKE ? OR t.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (type === 'income' || type === 'expense') {
      conditions.push('t.type = ?');
      params.push(type);
    }

    if (categoryId) {
      const parsedCatId = parseInt(categoryId, 10);
      if (!isNaN(parsedCatId)) {
        conditions.push('t.category_id = ?');
        params.push(parsedCatId);
      }
    }

    if (startDate) {
      conditions.push('t.transaction_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('t.transaction_date <= ?');
      params.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 't.transaction_date DESC, t.id DESC';
    if (sort === 'date_asc') orderBy = 't.transaction_date ASC, t.id ASC';
    else if (sort === 'amount_desc') orderBy = 't.amount DESC, t.id DESC';
    else if (sort === 'amount_asc') orderBy = 't.amount ASC, t.id ASC';

    // Ambil total count untuk pagination
    const countSql = `SELECT COUNT(*) AS total FROM transactions t ${whereClause}`;
    const totalCountRows = await query<TotalCountRow>(countSql, params);
    const totalCount = totalCountRows[0]?.total || 0;

    // Ambil rows transaksi
    const dataSql = `
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
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...params, limit, offset];
    const transactions = await query<TransactionRow>(dataSql, dataParams);

    return NextResponse.json<ApiResponse<{ items: Transaction[]; total: number; limit: number; offset: number }>>({
      success: true,
      data: {
        items: transactions,
        total: totalCount,
        limit,
        offset,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server internal';
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'SERVER_ERROR', message },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Membuat transaksi baru
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, amount, type, category_id, transaction_date, description } = body;

    // Validasi Judul
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Judul transaksi wajib diisi.' },
        { status: 400 }
      );
    }

    if (title.trim().length > 150) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Judul transaksi maksimal 150 karakter.' },
        { status: 400 }
      );
    }

    // Validasi Nominal
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Nominal transaksi harus berupa angka positif yang lebih dari 0.' },
        { status: 400 }
      );
    }

    // Validasi Jenis
    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Jenis transaksi harus "income" atau "expense".' },
        { status: 400 }
      );
    }

    // Validasi Tanggal
    if (!transaction_date || !/^\d{4}-\d{2}-\d{2}$/.test(transaction_date)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Tanggal transaksi harus berformat YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    // Validasi Kategori
    const parsedCategoryId = parseInt(String(category_id), 10);
    if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Kategori harus dipilih.' },
        { status: 400 }
      );
    }

    // Periksa kategori ada di database dan jenisnya cocok
    const catCheck = await query<CategoryRow>(
      'SELECT id, name, type FROM categories WHERE id = ? LIMIT 1',
      [parsedCategoryId]
    );

    if (catCheck.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'NOT_FOUND', message: 'Kategori yang dipilih tidak ditemukan di database.' },
        { status: 404 }
      );
    }

    const category = catCheck[0];
    if (category.type !== type) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'CATEGORY_TYPE_MISMATCH',
          message: `Kategori "${category.name}" bertipe "${category.type}", tidak cocok dengan jenis transaksi "${type}".`,
        },
        { status: 400 }
      );
    }

    const cleanDescription = description && typeof description === 'string' && description.trim()
      ? description.trim()
      : null;

    // Simpan ke database
    const insertResult = await execute(
      `INSERT INTO transactions (category_id, title, amount, type, transaction_date, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [parsedCategoryId, title.trim(), numericAmount, type, transaction_date, cleanDescription]
    );

    const createdTransaction: Transaction = {
      id: insertResult.insertId,
      category_id: parsedCategoryId,
      category_name: category.name,
      title: title.trim(),
      amount: numericAmount,
      type,
      transaction_date,
      description: cleanDescription,
    };

    return NextResponse.json<ApiResponse<Transaction>>(
      {
        success: true,
        data: createdTransaction,
        message: 'Transaksi berhasil disimpan.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server internal';
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'SERVER_ERROR', message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { query, execute, isDatabaseConfigured } from '@/lib/db';
import { Category, ApiResponse } from '@/types';
import { RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

interface CategoryRow extends RowDataPacket, Category {}

// GET /api/categories - Mengambil daftar kategori
export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json<ApiResponse<Category[]>>(
        {
          success: false,
          error: 'DATABASE_NOT_CONFIGURED',
          message: 'Kredensial database Aiven belum dikonfigurasi pada environment variables.',
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let sql = 'SELECT id, name, type, created_at FROM categories';
    const params: (string | number)[] = [];

    if (type && (type === 'income' || type === 'expense')) {
      sql += ' WHERE type = ?';
      params.push(type);
    }

    sql += ' ORDER BY name ASC';

    const rows = await query<CategoryRow>(sql, params);

    return NextResponse.json<ApiResponse<Category[]>>({
      success: true,
      data: rows,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server internal';
    return NextResponse.json<ApiResponse<Category[]>>(
      {
        success: false,
        error: 'SERVER_ERROR',
        message,
      },
      { status: 500 }
    );
  }
}

// POST /api/categories - Menambahkan kategori baru
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
    const { name, type } = body;

    // Validasi
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Nama kategori wajib diisi.' },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Nama kategori maksimal 100 karakter.' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'income' && type !== 'expense')) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Jenis kategori harus "income" atau "expense".' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Periksa apakah nama kategori dengan jenis yang sama sudah ada
    const existing = await query<CategoryRow>(
      'SELECT id FROM categories WHERE name = ? AND type = ? LIMIT 1',
      [trimmedName, type]
    );

    if (existing.length > 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'DUPLICATE_CATEGORY',
          message: `Kategori "${trimmedName}" dengan jenis ${type} sudah ada.`,
        },
        { status: 409 }
      );
    }

    const result = await execute(
      'INSERT INTO categories (name, type) VALUES (?, ?)',
      [trimmedName, type]
    );

    const newCategory: Category = {
      id: result.insertId,
      name: trimmedName,
      type,
    };

    return NextResponse.json<ApiResponse<Category>>(
      {
        success: true,
        data: newCategory,
        message: 'Kategori berhasil ditambahkan.',
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

import { NextRequest, NextResponse } from 'next/server';
import { query, execute, isDatabaseConfigured } from '@/lib/db';
import { Category, ApiResponse } from '@/types';
import { RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

interface CategoryRow extends RowDataPacket, Category {}
interface CountRow extends RowDataPacket {
  count: number;
}

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/categories/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'DATABASE_NOT_CONFIGURED', message: 'Database belum dikonfigurasi.' },
        { status: 503 }
      );
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'INVALID_ID', message: 'ID kategori tidak valid.' },
        { status: 400 }
      );
    }

    const rows = await query<CategoryRow>(
      'SELECT id, name, type, created_at FROM categories WHERE id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'NOT_FOUND', message: 'Kategori tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Category>>({
      success: true,
      data: rows[0],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server internal';
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'SERVER_ERROR', message },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'DATABASE_NOT_CONFIGURED', message: 'Database belum dikonfigurasi.' },
        { status: 503 }
      );
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'INVALID_ID', message: 'ID kategori tidak valid.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, type } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Nama kategori wajib diisi.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Pastikan kategori ada
    const existing = await query<CategoryRow>('SELECT id, type FROM categories WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'NOT_FOUND', message: 'Kategori tidak ditemukan.' },
        { status: 404 }
      );
    }

    const finalType = type && (type === 'income' || type === 'expense') ? type : existing[0].type;

    await execute(
      'UPDATE categories SET name = ?, type = ? WHERE id = ?',
      [trimmedName, finalType, id]
    );

    return NextResponse.json<ApiResponse<Category>>({
      success: true,
      data: {
        id,
        name: trimmedName,
        type: finalType,
      },
      message: 'Kategori berhasil diperbarui.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server internal';
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'SERVER_ERROR', message },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'DATABASE_NOT_CONFIGURED', message: 'Database belum dikonfigurasi.' },
        { status: 503 }
      );
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'INVALID_ID', message: 'ID kategori tidak valid.' },
        { status: 400 }
      );
    }

    // Periksa apakah kategori sedang digunakan oleh transaksi
    const usage = await query<CountRow>(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
      [id]
    );

    if (usage[0]?.count > 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'CATEGORY_IN_USE',
          message: `Kategori tidak dapat dihapus karena sedang digunakan oleh ${usage[0].count} transaksi.`,
        },
        { status: 400 }
      );
    }

    const result = await execute('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'NOT_FOUND', message: 'Kategori tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Kategori berhasil dihapus.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server internal';
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'SERVER_ERROR', message },
      { status: 500 }
    );
  }
}

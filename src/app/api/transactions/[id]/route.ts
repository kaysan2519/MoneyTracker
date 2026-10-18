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

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/transactions/[id] - Mengambil detail satu transaksi
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
        { success: false, error: 'INVALID_ID', message: 'ID transaksi tidak valid.' },
        { status: 400 }
      );
    }

    const rows = await query<TransactionRow>(
      `SELECT 
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
      WHERE t.id = ?
      LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'NOT_FOUND', message: 'Transaksi tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Transaction>>({
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

// PUT /api/transactions/[id] - Memperbarui transaksi
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
        { success: false, error: 'INVALID_ID', message: 'ID transaksi tidak valid.' },
        { status: 400 }
      );
    }

    // Pastikan transaksi ada
    const existingRows = await query<TransactionRow>(
      'SELECT id, category_id, title, amount, type, transaction_date, description FROM transactions WHERE id = ? LIMIT 1',
      [id]
    );

    if (existingRows.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'NOT_FOUND', message: 'Transaksi yang ingin diperbarui tidak ditemukan.' },
        { status: 404 }
      );
    }

    const current = existingRows[0];
    const body = await request.json();
    const { title, amount, type, category_id, transaction_date, description } = body;

    // Nilai baru atau lama
    const newTitle = title !== undefined ? String(title).trim() : current.title;
    if (!newTitle) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Judul transaksi wajib diisi.' },
        { status: 400 }
      );
    }
    if (newTitle.length > 150) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Judul transaksi maksimal 150 karakter.' },
        { status: 400 }
      );
    }

    const newAmount = amount !== undefined ? (typeof amount === 'string' ? parseFloat(amount) : Number(amount)) : current.amount;
    if (isNaN(newAmount) || newAmount <= 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Nominal transaksi harus berupa angka positif.' },
        { status: 400 }
      );
    }

    const newType = type !== undefined ? type : current.type;
    if (newType !== 'income' && newType !== 'expense') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Jenis transaksi harus "income" atau "expense".' },
        { status: 400 }
      );
    }

    const newDate = transaction_date !== undefined ? String(transaction_date) : current.transaction_date;
    if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Tanggal transaksi harus berformat YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    const newCategoryId = category_id !== undefined ? parseInt(String(category_id), 10) : current.category_id;
    if (isNaN(newCategoryId) || newCategoryId <= 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'VALIDATION_ERROR', message: 'Kategori harus dipilih.' },
        { status: 400 }
      );
    }

    // Validasi kategori dan kesesuaian jenis
    const catCheck = await query<CategoryRow>(
      'SELECT id, name, type FROM categories WHERE id = ? LIMIT 1',
      [newCategoryId]
    );

    if (catCheck.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'NOT_FOUND', message: 'Kategori tidak ditemukan di database.' },
        { status: 404 }
      );
    }

    const category = catCheck[0];
    if (category.type !== newType) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'CATEGORY_TYPE_MISMATCH',
          message: `Kategori "${category.name}" bertipe "${category.type}", tidak cocok dengan jenis transaksi "${newType}".`,
        },
        { status: 400 }
      );
    }

    const cleanDescription = description !== undefined
      ? (description && typeof description === 'string' && description.trim() ? description.trim() : null)
      : current.description;

    await execute(
      `UPDATE transactions 
       SET category_id = ?, title = ?, amount = ?, type = ?, transaction_date = ?, description = ?
       WHERE id = ?`,
      [newCategoryId, newTitle, newAmount, newType, newDate, cleanDescription, id]
    );

    const updatedTransaction: Transaction = {
      id,
      category_id: newCategoryId,
      category_name: category.name,
      title: newTitle,
      amount: newAmount,
      type: newType,
      transaction_date: newDate,
      description: cleanDescription,
    };

    return NextResponse.json<ApiResponse<Transaction>>({
      success: true,
      data: updatedTransaction,
      message: 'Transaksi berhasil diperbarui.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server internal';
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'SERVER_ERROR', message },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Menghapus transaksi
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
        { success: false, error: 'INVALID_ID', message: 'ID transaksi tidak valid.' },
        { status: 400 }
      );
    }

    const result = await execute('DELETE FROM transactions WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'NOT_FOUND', message: 'Transaksi tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Transaksi berhasil dihapus.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server internal';
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'SERVER_ERROR', message },
      { status: 500 }
    );
  }
}

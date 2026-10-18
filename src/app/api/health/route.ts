import { NextResponse } from 'next/server';
import { testConnection, isDatabaseConfigured } from '@/lib/db';
import { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isConfigured = isDatabaseConfigured();
  if (!isConfigured) {
    return NextResponse.json<ApiResponse<{ configured: boolean; connected: boolean }>>(
      {
        success: false,
        data: { configured: false, connected: false },
        message: 'Kredensial database Aiven belum dikonfigurasi pada .env.local.',
      },
      { status: 200 }
    );
  }

  const result = await testConnection();

  return NextResponse.json<ApiResponse<{ configured: boolean; connected: boolean; latencyMs?: number }>>(
    {
      success: result.success,
      data: {
        configured: true,
        connected: result.success,
        latencyMs: result.latencyMs,
      },
      message: result.message,
    },
    { status: result.success ? 200 : 503 }
  );
}

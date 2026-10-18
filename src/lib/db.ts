import mysql, { Pool, PoolOptions, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: Pool | undefined;
}

/**
 * Memeriksa apakah variabel lingkungan koneksi database telah disetel
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(
    process.env.DB_HOST &&
    process.env.DB_USER &&
    (process.env.DB_PASSWORD !== undefined)
  );
}

/**
 * Mendapatkan konfigurasi PoolOptions MySQL yang kompatibel dengan Aiven
 */
function getPoolConfig(): PoolOptions {
  const host = process.env.DB_HOST?.trim();
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD ?? '';
  const database = process.env.DB_NAME?.trim() || 'money_tracker';

  const sslEnabled =
    process.env.DB_SSL === 'true' ||
    process.env.DB_SSL === '1' ||
    (port !== 3306 && host?.includes('aivencloud.com'));

  let sslOptions: PoolOptions['ssl'] = undefined;
  if (sslEnabled) {
    sslOptions = {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
      ...(process.env.DB_CA_CERT ? { ca: process.env.DB_CA_CERT } : {}),
    };
  }

  return {
    host,
    port,
    user,
    password,
    database,
    ssl: sslOptions,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    dateStrings: true, // Mempertahankan format tanggal YYYY-MM-DD dari MySQL
  };
}

/**
 * Mendapatkan singleton MySQL Connection Pool
 */
export function getPool(): Pool {
  if (!isDatabaseConfigured()) {
    throw new Error(
      'Kredensial database Aiven belum dikonfigurasi. Harap buat file .env.local berdasarkan .env.example dengan nilai DB_HOST, DB_USER, DB_PASSWORD, dan DB_PORT yang sesuai.'
    );
  }

  if (process.env.NODE_ENV === 'production') {
    return mysql.createPool(getPoolConfig());
  }

  if (!global.__mysqlPool) {
    global.__mysqlPool = mysql.createPool(getPoolConfig());
  }

  return global.__mysqlPool;
}

export type QueryParam = string | number | boolean | null | Date;

/**
 * Menjalankan parameterized SELECT query dengan tipe kembalian T[]
 */
export async function query<T extends RowDataPacket>(
  sql: string,
  params: (QueryParam | undefined)[] = []
): Promise<T[]> {
  const pool = getPool();
  const sanitizedParams = params.map((p) => (p === undefined ? null : p));
  const [rows] = await pool.query<T[]>(sql, sanitizedParams as QueryParam[]);
  return rows;
}

/**
 * Menjalankan parameterized INSERT/UPDATE/DELETE query
 */
export async function execute(
  sql: string,
  params: (QueryParam | undefined)[] = []
): Promise<ResultSetHeader> {
  const pool = getPool();
  const sanitizedParams = params.map((p) => (p === undefined ? null : p));
  const [result] = await pool.execute<ResultSetHeader>(sql, sanitizedParams as (string | number | boolean | null | Date)[]);
  return result;
}

/**
 * Menguji koneksi database secara langsung
 */
export async function testConnection(): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
}> {
  if (!isDatabaseConfigured()) {
    return {
      success: false,
      message: 'Kredensial database (DB_HOST, DB_USER, DB_PASSWORD) belum dikonfigurasi.',
    };
  }

  const start = Date.now();
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
      await connection.ping();
      const latencyMs = Date.now() - start;
      return {
        success: true,
        message: 'Koneksi ke database MySQL Aiven berhasil.',
        latencyMs,
      };
    } finally {
      connection.release();
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
    return {
      success: false,
      message: `Gagal terhubung ke database: ${errorMessage}`,
    };
  }
}

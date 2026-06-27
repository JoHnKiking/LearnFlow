import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'learnflow',
  connectionLimit: 5,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

/**
 * 获取数据库连接（从连接池）
 */
export async function getConnection(): Promise<mysql.PoolConnection> {
  return pool.getConnection();
}

/**
 * 测试数据库连接
 */
export async function testConnection(): Promise<boolean> {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('[DB] 数据库连接成功');
    return true;
  } catch (err) {
    console.error('[DB] 数据库连接失败:', err);
    return false;
  }
}

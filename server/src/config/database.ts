import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || '127.0.0.1', 
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'learnflow'
};

const poolConfig = {
  ...dbConfig,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

export const pool = mysql.createPool(poolConfig);

export class DatabaseConnection {
  private static connection: mysql.Connection | null = null;

  static async getConnection(): Promise<mysql.Connection> {
    if (this.connection) {
      try {
        await this.connection.ping();
        return this.connection;
      } catch {
        this.connection = null;
      }
    }

    try {
      this.connection = await mysql.createConnection(poolConfig);
      console.log('MySQL数据库连接成功');
    } catch (error) {
      console.error('MySQL数据库连接失败:', error);
      console.error('连接配置:', {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database
      });
      const err = error as { code?: string };
      if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error(
          '提示: 用户名或密码不对。请修改 server/.env 中的 DB_USER、DB_PASSWORD，使其与在本机执行 mysql -u <用户> -p 能登录的凭据一致；若 root 无密码则清空 DB_PASSWORD。仍失败时可尝试将 DB_HOST 在 127.0.0.1 与 localhost 之间切换（两者在 MySQL 里可能是不同登录方式）。'
        );
      }
      throw new Error(`数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    return this.connection;
  }

  static async closeConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log('MySQL数据库连接已关闭');
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      const connection = await this.getConnection();
      await connection.execute('SELECT 1');
      return true;
    } catch (error) {
      console.error('数据库连接测试失败:', error);
      return false;
    }
  }
}
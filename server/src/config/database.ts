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

// 创建连接池
export const pool = mysql.createPool({
  ...dbConfig,
  connectionLimit: 10
});

export class DatabaseConnection {
  private static connection: mysql.Connection | null = null;

  static async getConnection(): Promise<mysql.Connection> {
    if (!this.connection) {
      try {
        this.connection = await mysql.createConnection(dbConfig);
        console.log('MySQL数据库连接成功');
      } catch (error) {
        console.error('MySQL数据库连接失败:', error);
        console.error('连接配置:', {
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.user,
          database: dbConfig.database
        });
        throw new Error(`数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
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
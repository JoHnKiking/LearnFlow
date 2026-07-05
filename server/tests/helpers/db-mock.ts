/**
 * 数据库 Mock 助手
 * 
 * 为单元测试和集成测试提供 MySQL 连接的 Mock 层。
 * 模拟 DatabaseConnection.getConnection() 返回一个可控的 mock 连接。
 */
import { vi } from 'vitest';

export interface MockQueryResult {
  rows: any[];
  insertId?: number;
  affectedRows?: number;
}

/**
 * 创建一个可控的 mock MySQL 连接
 */
export function createMockConnection(config: {
  /** 模拟的查询结果 */
  queryResults?: Map<string, MockQueryResult>;
  /** 默认空结果 */
  defaultResult?: MockQueryResult;
} = {}) {
  const results = config.queryResults || new Map();
  const defaultResult = config.defaultResult || { rows: [] };

  const mockExecute = vi.fn().mockImplementation((sql: string, params?: any[]) => {
    // 尝试匹配已知的 SQL 模式
    for (const [pattern, result] of results.entries()) {
      if (sql.includes(pattern)) {
        return [result.rows, []];
      }
    }
    return [defaultResult.rows, []];
  });

  return {
    execute: mockExecute,
    query: mockExecute,
    beginTransaction: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
    end: vi.fn().mockResolvedValue(undefined),
    ping: vi.fn().mockResolvedValue(undefined),
    release: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * 设置完整的数据库 Mock
 * 返回：mock 连接实例 + 清理函数
 */
export function setupDatabaseMock() {
  const mockConnection = createMockConnection();
  
  // Mock DatabaseConnection.getConnection
  const { DatabaseConnection } = require('../../src/config/database');
  vi.spyOn(DatabaseConnection, 'getConnection').mockResolvedValue(mockConnection);

  return {
    mockConnection,
    cleanup: () => {
      vi.restoreAllMocks();
    },
  };
}

/**
 * 设置用户注册场景的 Mock
 */
export function setupRegisterMock(mockConnection: ReturnType<typeof createMockConnection>) {
  // 邮箱/用户名不存在
  mockConnection.execute.mockImplementation((sql: string, params?: any[]) => {
    // 邮箱查询 - 不存在
    if (sql.includes('SELECT id, status FROM users WHERE email')) {
      return [[]];
    }
    // 用户名查询 - 不存在
    if (sql.includes('SELECT id FROM users WHERE username')) {
      return [[]];
    }
    // INSERT 返回 insertId
    if (sql.includes('INSERT INTO users')) {
      return [{ insertId: 1 }, []];
    }
    // 验证码相关
    if (sql.includes('DELETE FROM email_verification_tokens')) {
      return [];
    }
    if (sql.includes('INSERT INTO email_verification_tokens')) {
      return [{ insertId: 1 }, []];
    }
    return [[]];
  });
}

/**
 * 设置登录场景的 Mock
 */
export function setupLoginMock(
  mockConnection: ReturnType<typeof createMockConnection>,
  userData: {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    status: 'active' | 'inactive' | 'banned';
  }
) {
  mockConnection.execute.mockImplementation((sql: string, params?: any[]) => {
    // 用户查询 - 返回预设用户
    if (sql.includes('SELECT * FROM users WHERE email')) {
      return [[{
        id: userData.id,
        username: userData.username,
        email: userData.email,
        password_hash: userData.password_hash,
        status: userData.status,
        login_count: 0,
        avatar_url: null,
        nickname: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_pro: 0,
      }], []];
    }
    // 设备会话查询 - 不存在
    if (sql.includes('SELECT * FROM device_sessions WHERE')) {
      return [[]];
    }
    // INSERT 设备会话
    if (sql.includes('INSERT INTO device_sessions')) {
      return [{ insertId: 1 }, []];
    }
    // 更新登录信息
    if (sql.includes('UPDATE users SET last_login_at')) {
      return [];
    }
    return [[]];
  });
}

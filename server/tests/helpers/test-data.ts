import { faker } from '@faker-js/faker';

/**
 * 测试数据工厂
 * 
 * 使用 Faker.js 生成逼真的测试数据，避免硬编码。
 * 每个方法支持 overrides 参数，允许按需覆盖特定字段。
 */
export const TestDataFactory = {
  /** 新用户注册数据 */
  newUser: (overrides: Partial<{ username: string; email: string; password: string }> = {}) => ({
    username: faker.internet.userName().replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20),
    email: faker.internet.email().toLowerCase(),
    password: 'TestP@ss1',
    ...overrides,
  }),

  /** 登录请求数据 */
  loginRequest: (overrides: Partial<{ email: string; password: string }> = {}) => ({
    type: 'email' as const,
    email: faker.internet.email().toLowerCase(),
    password: 'TestP@ss1',
    deviceId: 'test-device-001',
    deviceType: 'web' as const,
    deviceName: 'Test Browser',
    ...overrides,
  }),

  /** 验证码相关 */
  verificationCode: () => Math.floor(100000 + Math.random() * 900000).toString(),

  /** 怪兽创建数据 */
  newMonster: (overrides: Partial<{ name: string; personality: string }> = {}) => ({
    userId: 1,
    name: faker.animal.dog(),
    style: 'default' as const,
    personality: faker.helpers.arrayElement(['lively', 'calm', 'rebel']),
    ...overrides,
  }),

  /** 学习领域数据 */
  newDomain: (overrides: Partial<{ userId: number; name: string; type: string }> = {}) => ({
    userId: 1,
    name: faker.lorem.words(2),
    type: 'preset' as const,
    ...overrides,
  }),

  /** 笔记数据 */
  newNote: (overrides: Partial<{ userId: number; date: string; content: string }> = {}) => ({
    userId: 1,
    date: new Date().toISOString().split('T')[0],
    content: faker.lorem.paragraph(),
    ...overrides,
  }),

  /** 奖励数据 */
  newReward: (overrides: Partial<{ userId: number; type: string; amount: number }> = {}) => ({
    userId: 1,
    type: 'exp' as const,
    amount: 50,
    source: 'learning',
    ...overrides,
  }),

  /** Pro 激活码 */
  proActivation: (overrides: Partial<{ userId: number; code: string }> = {}) => ({
    userId: 1,
    code: `LF-${faker.string.hexadecimal({ length: 12 })}`,
    ...overrides,
  }),

  // === SQL 注入攻击载荷 ===
  sqlInjections: [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "1' UNION SELECT username, password_hash FROM users --",
    "' OR 1=1 --",
    "admin'--",
    "1; UPDATE users SET is_pro=1 WHERE 1=1 --",
    "' OR '1'='1' /*",
  ],

  // === XSS 攻击载荷 ===
  xssPayloads: [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)',
    '<svg onload=alert(1)>',
    '" onfocus="alert(1)" autofocus="true"',
  ],

  // === 边界值 ===
  boundaryValues: {
    emptyString: '',
    whitespaceOnly: '   ',
    singleChar: 'a',
    maxLengthUsername: 'a'.repeat(50),
    overMaxLengthUsername: 'a'.repeat(51),
    maxLengthEmail: `${'a'.repeat(80)}@test.com`,
    minPassword: '12345',    // < 6 chars
    unicodeUsername: '用户测试名',
    emojiUsername: 'test💻user',
  },
};

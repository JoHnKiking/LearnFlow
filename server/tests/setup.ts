/**
 * 全局测试配置
 * 
 * 设置测试环境变量、初始化 Mock、定义全局钩子。
 * 所有测试套件共享此配置。
 */
import { beforeAll, afterAll, vi } from 'vitest';

// === 测试环境变量 ===
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-2026';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_NAME = 'learnflow_test';
process.env.CORS_ORIGINS = 'http://localhost:3000';

// === 全局 Mock：邮件服务 ===
vi.mock('../src/services/emailService', () => ({
  EmailService: {
    sendVerificationCode: vi.fn().mockResolvedValue(true),
    sendPasswordResetCode: vi.fn().mockResolvedValue(true),
    testConnection: vi.fn().mockResolvedValue(true),
  },
}));

// === 全局 Mock：LLM 服务 ===
// 必须 export 一个可用 new 实例化的类
vi.mock('../src/services/llmService', () => {
  const mockGenerateSkillTree = vi.fn().mockResolvedValue({
    name: 'Mock Skill Tree',
    children: [],
  });

  class MockLLMService {
    generateSkillTree = mockGenerateSkillTree;
  }

  return {
    LLMService: MockLLMService,
  };
});

// 抑制测试中的 console.log 噪音
const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
  if (process.env.TEST_VERBOSE !== 'true') {
    console.log = vi.fn();
  }
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});

// 应用常量配置
export const API_BASE_URL = 'https://heterotrichous-gerty-catadromous.ngrok-free.dev/api';
export const APP_NAME = 'LearnFlow';
export const APP_VERSION = '1.0.0';

// 页面路由常量
export const ROUTES = {
  HOME: '/',
  SKILL_TREE: '/skill-tree',
} as const;

// 颜色常量
export const COLORS = {
  PRIMARY: '#007AFF',
  SUCCESS: '#34C759',
  WARNING: '#FF9500',
  ERROR: '#FF3B30',
  BACKGROUND: '#f5f5f5',
  WHITE: '#ffffff',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#666666',
  BORDER: '#dddddd',
} as const;

// 样式常量
export const SPACING = {
  SMALL: 8,
  MEDIUM: 16,
  LARGE: 24,
  XLARGE: 32,
} as const;

// 默认配置
export const DEFAULT_CONFIG = {
  SKILL_TREE_LIMIT: 5,
  SEARCH_LIMIT: 10,
  DEFAULT_USER_ID: 'user1',
} as const;
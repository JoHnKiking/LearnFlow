// 应用常量配置
export const API_BASE_URL = 'https://heterotrichous-gerty-catadromous.ngrok-free.dev/api';
export const APP_NAME = 'LearnFlow';
export const APP_VERSION = '1.0.0';

// 页面路由常量
export const ROUTES = {
  HOME: '/',
  SKILL_TREE: '/skill-tree',
} as const;

// 像素风格颜色常量
export const PIXEL_COLORS = {
  PRIMARY: '#5D9BFA',
  SUCCESS: '#54E346',
  WARNING: '#FFD700',
  ERROR: '#FF5D5D',
  BACKGROUND: '#1A1A2E',
  BACKGROUND_LIGHT: '#16213E',
  WHITE: '#F9F9F9',
  TEXT_PRIMARY: '#F9F9F9',
  TEXT_SECONDARY: '#8B8B8B',
  BORDER: '#2D2D44',
  
  PIXEL_DARK_BLUE: '#0F3460',
  PIXEL_PURPLE: '#533483',
  PIXEL_PINK: '#E94560',
  PIXEL_ORANGE: '#FF7D00',
  PIXEL_YELLOW: '#FFB100',
  PIXEL_GREEN: '#3AE374',
  PIXEL_CYAN: '#00D9FF',
  PIXEL_GRAY: '#3A3A5C',
  PIXEL_LIGHT_GRAY: '#5C5C7A',
  
  NODE_PENDING: '#3A3A5C',
  NODE_DOING: '#FFD700',
  NODE_DONE: '#3AE374',
} as const;

// 颜色常量（兼容旧代码）
export const COLORS = {
  PRIMARY: PIXEL_COLORS.PRIMARY,
  SUCCESS: PIXEL_COLORS.SUCCESS,
  WARNING: PIXEL_COLORS.WARNING,
  ERROR: PIXEL_COLORS.ERROR,
  BACKGROUND: PIXEL_COLORS.BACKGROUND,
  WHITE: PIXEL_COLORS.WHITE,
  TEXT_PRIMARY: PIXEL_COLORS.TEXT_PRIMARY,
  TEXT_SECONDARY: PIXEL_COLORS.TEXT_SECONDARY,
  BORDER: PIXEL_COLORS.BORDER,
} as const;

// 风格颜色常量（兼容旧代码）
export const CUTE_COLORS = {
  WARM_WHITE: PIXEL_COLORS.BACKGROUND_LIGHT,
  PINK: PIXEL_COLORS.PIXEL_PINK,
  MINT: PIXEL_COLORS.PIXEL_GREEN,
  SKY_BLUE: PIXEL_COLORS.PIXEL_CYAN,
  LAVENDER: PIXEL_COLORS.PIXEL_PURPLE,
  GOLD: PIXEL_COLORS.PIXEL_YELLOW,
  CORAL: PIXEL_COLORS.PIXEL_ORANGE,
  PURPLE: PIXEL_COLORS.PIXEL_PURPLE,
  TEAL: PIXEL_COLORS.PIXEL_CYAN,
  PEACH: PIXEL_COLORS.PIXEL_ORANGE,
  CREAM: PIXEL_COLORS.BACKGROUND_LIGHT,
  LIGHT_PINK: PIXEL_COLORS.PIXEL_PINK,
  DARK_GRAY: PIXEL_COLORS.TEXT_PRIMARY,
  GRAY: PIXEL_COLORS.TEXT_SECONDARY,
  LIGHT_GRAY: PIXEL_COLORS.PIXEL_GRAY,
  LIGHT_BLUE: PIXEL_COLORS.PIXEL_DARK_BLUE,
  BUTTER_YELLOW: PIXEL_COLORS.PIXEL_YELLOW,
} as const;

// 样式常量
export const SPACING = {
  SMALL: 8,
  MEDIUM: 16,
  LARGE: 24,
  XLARGE: 32,
} as const;

// 边框圆角常量
export const BORDER_RADIUS = {
  SMALL: 4,
  MEDIUM: 8,
  LARGE: 16,
  XLARGE: 24,
} as const;

// 阴影样式常量
export const SHADOWS = {
  SOFT: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  MEDIUM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  STRONG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// 像素边框样式常量
export const PIXEL_BORDERS = {
  SMALL: 2,
  MEDIUM: 4,
  LARGE: 6,
} as const;

// 默认配置
export const DEFAULT_CONFIG = {
  SKILL_TREE_LIMIT: 5,
  SEARCH_LIMIT: 10,
  DEFAULT_USER_ID: 'user1',
  ENERGY_RECOVERY_HOURS: 6,
  MAX_ENERGY: 10,
  POMODORO_MINUTES: 25,
} as const;
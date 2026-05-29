import Constants from 'expo-constants';

// 应用常量配置
// 公网 / 跨网调试：优先读 Expo extra.apiBaseUrl，其次读 EXPO_PUBLIC_API_URL
// 都未配置时才回退到 localhost。
const extraApiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
const rawApiBaseUrl =
  (typeof extraApiBaseUrl === 'string' ? extraApiBaseUrl : undefined) ??
  process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_BASE_URL =
  rawApiBaseUrl && rawApiBaseUrl.length > 0 ? rawApiBaseUrl : 'http://localhost:3001/api';
export const APP_NAME = 'LearnFlow';
export const APP_VERSION = '1.0.0';

console.log('[Config] extra.apiBaseUrl =', extraApiBaseUrl);
console.log('[Config] EXPO_PUBLIC_API_URL =', process.env.EXPO_PUBLIC_API_URL);
console.log('[Config] API_BASE_URL =', API_BASE_URL);

// 页面路由常量
export const ROUTES = {
  HOME: '/',
  SKILL_TREE: '/skill-tree',
} as const;

// 像素风格颜色常量 — 对齐新 ThemeContext 深色模式默认值
export const PIXEL_COLORS = {
  PRIMARY: '#7B75D8',
  SUCCESS: '#4A9840',
  WARNING: '#D4A058',
  ERROR: '#D05858',
  BACKGROUND: '#0D0D1A',
  BACKGROUND_LIGHT: '#141428',
  BACKGROUND_DARK: '#0A0A14',
  WHITE: '#E8E8F8',
  TEXT_PRIMARY: '#E8E8F8',
  TEXT_SECONDARY: '#8A8AA8',
  TEXT_TERTIARY: '#5A5A78',
  BORDER: 'rgba(255, 255, 255, 0.08)',
  BORDER_LIGHT: 'rgba(255, 255, 255, 0.04)',
  BORDER_DARK: 'rgba(120, 100, 220, 0.18)',
  
  PIXEL_DARK_BLUE: '#1A1A35',
  PIXEL_PURPLE: '#7B75D8',
  PIXEL_PINK: '#D07090',
  PIXEL_ORANGE: '#D4A058',
  PIXEL_YELLOW: '#E0C068',
  PIXEL_GREEN: '#4A9840',
  PIXEL_CYAN: '#50B8D8',
  PIXEL_GRAY: '#2A2A48',
  PIXEL_LIGHT_GRAY: '#4A4A68',
  
  NODE_PENDING: '#2A2A48',
  NODE_DOING: '#D4A058',
  NODE_DONE: '#4A9840',
} as const;

// 颜色常量
export const COLORS = {
  PRIMARY: PIXEL_COLORS.PRIMARY,
  SUCCESS: PIXEL_COLORS.SUCCESS,
  WARNING: PIXEL_COLORS.WARNING,
  ERROR: PIXEL_COLORS.ERROR,
  BACKGROUND: PIXEL_COLORS.BACKGROUND,
  BACKGROUND_LIGHT: PIXEL_COLORS.BACKGROUND_LIGHT,
  BACKGROUND_DARK: PIXEL_COLORS.BACKGROUND_DARK,
  WHITE: PIXEL_COLORS.WHITE,
  TEXT_PRIMARY: PIXEL_COLORS.TEXT_PRIMARY,
  TEXT_SECONDARY: PIXEL_COLORS.TEXT_SECONDARY,
  TEXT_TERTIARY: PIXEL_COLORS.TEXT_TERTIARY,
  BORDER: PIXEL_COLORS.BORDER,
  BORDER_LIGHT: PIXEL_COLORS.BORDER_LIGHT,
  BORDER_DARK: PIXEL_COLORS.BORDER_DARK,
  ORANGE: PIXEL_COLORS.PIXEL_ORANGE,
  PURPLE: PIXEL_COLORS.PIXEL_PURPLE,
  PINK: PIXEL_COLORS.PIXEL_PINK,
} as const;

// 风格颜色常量
export const CUTE_COLORS = {
  WARM_WHITE: PIXEL_COLORS.BACKGROUND_LIGHT,
  WHITE: PIXEL_COLORS.WHITE,
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

// 边框圆角常量 — 更柔和的现代圆角
export const BORDER_RADIUS = {
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  XLARGE: 20,
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

// 怪兽配置
export const MONSTER_CONFIG = {
  TYPES: {
    LIVELY: 'lively',
    CALM: 'calm',
    REBEL: 'rebel',
  } as const,

  STAMINA: {
    BASE_MAX: 100,
    CALM_BONUS: 20,
    COST_PER_JUMP: 10,
    GAME_BONUS: 20,
    REBEL_MULTIPLIER: 2,
  } as const,

  ENERGY: {
    BASE_MAX: 50,
    COST_PER_TOKEN: 0.05,
    GAME_BONUS: 5,
  } as const,

  DAILY_RESET: {
    HOUR: 5,
    MINUTE: 0,
  } as const,

  POMODORO: {
    TIME_OPTIONS: [25, 45, 60, 90, 120, 180] as const,
  } as const,

  // 小游戏配置
  // DAILY_LIMIT: 免费版每日游戏次数上限
  // PRO_DAILY_LIMIT: PRO 版每日游戏次数上限（预留，后续根据用户等级读取不同值）
  GAME: {
    DAILY_LIMIT: 3,
    PRO_DAILY_LIMIT: 10,
  } as const,

  PERSONALITIES: {
    lively: {
      name: '活力小怪',
      traits: ['单次学习任务时长 -5分钟', '适合快节奏碎片化学习'],
    },
    calm: {
      name: '沉稳小怪',
      traits: ['每日体力额外 +20点', '可多跳转2次', '擅长深度思考'],
    },
    rebel: {
      name: '叛逆小怪',
      traits: ['小游戏获得的体力、能量全部双倍', '勇于探索挑战'],
    },
  } as const,

  COLORS: {
    lively: { primary: '#FF9A2E', secondary: '#D4781A', highlight: '#FFE8A0' },
    calm: { primary: '#7B75D8', secondary: '#5A54B0', highlight: '#B8B3FF' },
    rebel: { primary: '#D07090', secondary: '#A05068', highlight: '#FFB8D0' },
  } as const,
};
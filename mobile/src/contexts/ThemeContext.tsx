import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  // 页面基础
  background: string;
  backgroundDark: string;
  canvas: string;
  surface: string;
  surfaceLight: string;

  // 文字
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // 分类卡片背景
  cardAi: string;
  cardLife: string;
  cardLang: string;
  cardAdd: string;
  card: string; // 兼容旧接口，通用卡片

  // 边框
  border: string;
  borderLight: string;
  borderDark: string;
  hairline: string;
  cardBorder: string;

  // 进度条
  progressFill: string;
  progressFillAi: string;
  progressFillLife: string;
  progressFillLang: string;
  progressTrack: string;

  // 徽章
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  badgeBorderAi: string;
  badgeBorderLife: string;
  badgeBorderLang: string;

  // 提示
  tipBg: string;

  // 强调色
  primary: string;
  onPrimary: string;
  accentGreen: string;
  accentOrange: string;
  brandBlue: string;
  brandPurple: string;
  brandPink: string;
  successText: string;
  error: string;
  warning: string;

  // 装饰与效果
  decorCircle: string;
  planetGlow: string;
  starColor: string;
  glassBg: string;

  // Pro / 付费模式
  pro: string;
  proBg: string;
  proBorder: string;
  proGradientStart: string;
  proGradientEnd: string;

  // 中性色
  ink: string;
  charcoal: string;
  muted: string;
  steel: string;
  stone: string;

  // UI 组件
  inputBg: string;
  inputBorder: string;
  tabBar: string;
  tabBarBorder: string;
  headerBg: string;
  modalOverlay: string;
  shadow: string;

  // 技能树节点
  nodePending: string;
  nodeDoing: string;
  nodeDone: string;

  // 快捷别名（保留活跃使用的）
  success: string;
  orange: string;
  purple: string;
}

// ====== 深色模式 — 暖碳黑 · 陶土金主色 ======
export const darkTheme: ThemeColors = {
  // 页面基础
  background: '#171717',
  backgroundDark: '#0F0F0F',
  canvas: '#1E1E1E',
  surface: '#292929',
  surfaceLight: '#363636',

  // 文字（暖调，在碳灰底上清晰柔和）
  textPrimary: '#EAE0D8',
  textSecondary: '#9A8E84',
  textTertiary: '#6B6158',
  textInverse: '#FFFFFF',

  // 分类卡片背景
  cardAi: '#2A2420',      // 暗暖褐 - 专业技能
  cardLife: '#202A28',    // 暗灰绿 - 生活技能
  cardLang: '#2B2422',    // 暗褐 - 语言学习
  cardAdd: '#222222',     // 添加模块
  card: '#292929',        // 通用卡片

  // 边框
  border: '#3A3A3A',
  borderLight: '#2E2E2E',
  borderDark: '#484848',
  hairline: '#2E2E2E',
  cardBorder: '#3A3A3A',

  // 进度条
  progressFill: '#7AB07A',
  progressFillAi: '#D4A574',     // 陶土金 - 专业技能
  progressFillLife: '#7AB07A',   // 柔绿 - 生活技能
  progressFillLang: '#B892C8',   // 淡紫 - 语言学习
  progressTrack: '#3A3A3A',

  // 徽章
  badgeBg: '#292929',
  badgeText: '#B0A498',
  badgeBorder: '#484848',
  badgeBorderAi: '#D4A574',
  badgeBorderLife: '#7AB07A',
  badgeBorderLang: '#B892C8',

  // 提示
  tipBg: '#292929',

  // 强调色
  primary: '#D4A574',
  onPrimary: '#1A1510',
  accentGreen: '#7AB0A0',
  accentOrange: '#C89070',
  brandBlue: '#6B9AAA',
  brandPurple: '#B892C8',
  brandPink: '#D07090',
  successText: '#7AB07A',
  error: '#C86A6A',
  warning: '#C89070',

  // 装饰与效果
  decorCircle: '#363636',
  planetGlow: 'rgba(212,165,116,0.20)',
  starColor: '#5A5A5A',
  glassBg: 'rgba(41,41,41,0.75)',

  // Pro / 付费模式
  pro: '#D4A574',
  proBg: 'rgba(212,165,116,0.10)',
  proBorder: 'rgba(212,165,116,0.25)',
  proGradientStart: '#D4A574',
  proGradientEnd: '#C89070',

  // 中性色
  ink: '#EAE0D8',
  charcoal: '#9A8E84',
  muted: '#6B6158',
  steel: '#5A5048',
  stone: '#6B6158',

  // UI 组件
  inputBg: '#292929',
  inputBorder: '#3A3A3A',
  tabBar: 'rgba(23,23,23,0.95)',
  tabBarBorder: '#2E2E2E',
  headerBg: '#171717',
  modalOverlay: 'rgba(0,0,0,0.75)',
  shadow: '#000000',

  // 技能树节点
  nodePending: '#292929',
  nodeDoing: '#D4A574',
  nodeDone: '#7AB07A',

  // 快捷别名
  success: '#7AB07A',
  orange: '#C89070',
  purple: '#B892C8',
};

// ====== 浅色模式 — 陶土色 · 温暖米白底 ======
export const lightTheme: ThemeColors = {
  // 页面基础
  background: '#F5EDE0',
  backgroundDark: '#E8E0D4',
  canvas: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceLight: '#F8F2EB',

  // 文字（深褐，在暖米白底上清晰）
  textPrimary: '#3D3229',
  textSecondary: '#8B7D72',
  textTertiary: '#B0A498',
  textInverse: '#FFFFFF',

  // 分类卡片背景
  cardAi: '#EBE5DC',      // 暖灰褐 - 专业技能
  cardLife: '#E2EBE3',    // 淡灰绿 - 生活技能
  cardLang: '#EDE3D8',    // 暖杏色 - 语言学习
  cardAdd: '#F8F2EB',     // 添加模块
  card: '#FFFFFF',        // 通用卡片

  // 边框
  border: '#DED3C8',
  borderLight: '#EAE0D6',
  borderDark: '#CDC0B2',
  hairline: '#EAE0D6',
  cardBorder: '#DED3C8',

  // 进度条
  progressFill: '#7BA67B',
  progressFillAi: '#C77D5A',     // 陶土橙 - 专业技能
  progressFillLife: '#7BA67B',   // 柔绿 - 生活技能
  progressFillLang: '#A08B8B',   // 灰紫 - 语言学习
  progressTrack: '#E0D6CA',

  // 徽章
  badgeBg: '#FFFFFF',
  badgeText: '#5A4A3E',
  badgeBorder: '#CDC0B2',
  badgeBorderAi: '#C77D5A',
  badgeBorderLife: '#7BA67B',
  badgeBorderLang: '#A08B8B',

  // 提示
  tipBg: '#FFFFFF',

  // 强调色
  primary: '#C77D5A',
  onPrimary: '#FFFFFF',
  accentGreen: '#5A8F7C',
  accentOrange: '#D4A574',
  brandBlue: '#7A9EB5',
  brandPurple: '#A08B8B',
  brandPink: '#D07090',
  successText: '#5A8F7C',
  error: '#D45656',
  warning: '#D4A574',

  // 装饰与效果
  decorCircle: '#CDC0B2',
  planetGlow: 'rgba(199,125,90,0.15)',
  starColor: '#D0C8B8',
  glassBg: 'rgba(255,255,255,0.70)',

  // Pro / 付费模式
  pro: '#D97706',
  proBg: 'rgba(217,119,6,0.08)',
  proBorder: 'rgba(217,119,6,0.25)',
  proGradientStart: '#D97706',
  proGradientEnd: '#B45309',

  // 中性色
  ink: '#3D3229',
  charcoal: '#5A4A3E',
  muted: '#B0A498',
  steel: '#8B7D72',
  stone: '#B0A498',

  // UI 组件
  inputBg: '#FFFFFF',
  inputBorder: '#DED3C8',
  tabBar: 'rgba(245,237,224,0.92)',
  tabBarBorder: '#EAE0D6',
  headerBg: '#F5EDE0',
  modalOverlay: 'rgba(0,0,0,0.25)',
  shadow: 'rgba(61,50,41,0.08)',

  // 技能树节点
  nodePending: '#F2EDE6',
  nodeDoing: '#C77D5A',
  nodeDone: '#7BA67B',

  // 快捷别名
  success: '#7BA67B',
  orange: '#D4A574',
  purple: '#A08B8B',
};

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  colors: darkTheme,
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = 'app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored !== null) {
          setIsDark(stored === 'dark');
        }
      } catch (e) {
        console.error('[Theme] 加载主题失败:', e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = !isDark;
    setIsDark(next);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
    } catch (e) {
      console.error('[Theme] 保存主题失败:', e);
    }
  }, [isDark]);

  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;

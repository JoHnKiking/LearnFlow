import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  background: string;
  backgroundLight: string;
  backgroundDark: string;
  surface: string;
  surfaceLight: string;
  card: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  primary: string;
  success: string;
  warning: string;
  error: string;
  orange: string;
  purple: string;
  pink: string;
  border: string;
  borderLight: string;
  borderDark: string;
  inputBg: string;
  inputBorder: string;
  tabBar: string;
  tabBarBorder: string;
  headerBg: string;
  modalOverlay: string;
  shadow: string;
  nodePending: string;
  nodeDoing: string;
  nodeDone: string;
}

// 深色模式 — 参考图风格：深海蓝背景、玻璃态卡片、微光边缘
export const darkTheme: ThemeColors = {
  background: '#0D0D1A',
  backgroundLight: '#141428',
  backgroundDark: '#0A0A14',
  surface: '#111125',
  surfaceLight: '#1A1A35',
  card: 'rgba(100, 100, 160, 0.10)',
  cardBorder: 'rgba(255, 255, 255, 0.06)',
  textPrimary: '#E8E8F8',
  textSecondary: '#8A8AA8',
  textTertiary: '#5A5A78',
  textInverse: '#0D0D1A',
  primary: '#7B75D8',
  success: '#4A9840',
  warning: '#D4A058',
  error: '#D05858',
  orange: '#D4A058',
  purple: '#7B75D8',
  pink: '#D07090',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.04)',
  borderDark: 'rgba(120, 100, 220, 0.18)',
  inputBg: 'rgba(255, 255, 255, 0.04)',
  inputBorder: 'rgba(255, 255, 255, 0.08)',
  tabBar: 'rgba(20, 20, 35, 0.85)',
  tabBarBorder: 'rgba(255, 255, 255, 0.06)',
  headerBg: '#0D0D1A',
  modalOverlay: 'rgba(0, 0, 0, 0.65)',
  shadow: 'rgba(0, 0, 0, 0.35)',
  nodePending: '#2A2A48',
  nodeDoing: '#D4A058',
  nodeDone: '#4A9840',
};

// 浅色模式 — 参考图风格：奶油白背景、柔和卡面色系、轻盈质感
export const lightTheme: ThemeColors = {
  background: '#F8F5F0',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#EBE8E3',
  surface: '#FFFFFF',
  surfaceLight: '#F0EDE8',
  card: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.06)',
  textPrimary: '#2D2D3A',
  textSecondary: '#6B6B7A',
  textTertiary: '#9B9BAA',
  textInverse: '#FFFFFF',
  primary: '#5A54A0',
  success: '#5A8040',
  warning: '#C49A60',
  error: '#C45A5A',
  orange: '#C49A60',
  purple: '#5A54A0',
  pink: '#C47088',
  border: 'rgba(0, 0, 0, 0.08)',
  borderLight: 'rgba(0, 0, 0, 0.04)',
  borderDark: 'rgba(90, 84, 160, 0.15)',
  inputBg: '#F0EDE8',
  inputBorder: 'rgba(0, 0, 0, 0.08)',
  tabBar: 'rgba(255, 255, 255, 0.92)',
  tabBarBorder: 'rgba(0, 0, 0, 0.06)',
  headerBg: '#F8F5F0',
  modalOverlay: 'rgba(0, 0, 0, 0.25)',
  shadow: 'rgba(0, 0, 0, 0.06)',
  nodePending: '#E0DDE8',
  nodeDoing: '#C49A60',
  nodeDone: '#5A8040',
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
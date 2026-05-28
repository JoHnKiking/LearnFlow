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

export const darkTheme: ThemeColors = {
  background: '#1A1A2E',
  backgroundLight: '#16213E',
  backgroundDark: '#0F1030',
  surface: '#16213E',
  surfaceLight: '#1E2A5E',
  card: '#0F1030',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#E8E8F0',
  textSecondary: '#8888AA',
  textTertiary: '#555577',
  textInverse: '#1A1A2E',
  primary: '#5D9BFA',
  success: '#3AE374',
  warning: '#FFD700',
  error: '#E94560',
  orange: '#FF7D00',
  purple: '#7B5EA7',
  pink: '#E94560',
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.06)',
  borderDark: 'rgba(93, 155, 250, 0.2)',
  inputBg: '#0F1030',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  tabBar: '#0F1030',
  tabBarBorder: 'rgba(255, 255, 255, 0.06)',
  headerBg: '#1A1A2E',
  modalOverlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  nodePending: '#3A3A5C',
  nodeDoing: '#FFD700',
  nodeDone: '#3AE374',
};

export const lightTheme: ThemeColors = {
  background: '#E8F0FE',
  backgroundLight: '#F8FAFF',
  backgroundDark: '#D0E0F5',
  surface: '#FAFCFF',
  surfaceLight: '#E8F4FF',
  card: '#FFFFFF',
  cardBorder: 'rgba(93, 155, 250, 0.12)',
  textPrimary: '#0A1628',
  textSecondary: '#3D5A7D',
  textTertiary: '#6B8AA8',
  textInverse: '#FFFFFF',
  primary: '#4A8BF5',
  success: '#2DB86E',
  warning: '#F5A623',
  error: '#E74C3C',
  orange: '#FF8C00',
  purple: '#8B5CF6',
  pink: '#FF6B9D',
  border: 'rgba(93, 155, 250, 0.15)',
  borderLight: 'rgba(93, 155, 250, 0.08)',
  borderDark: 'rgba(93, 155, 250, 0.3)',
  inputBg: '#F0F7FF',
  inputBorder: 'rgba(93, 155, 250, 0.2)',
  tabBar: '#FFFFFF',
  tabBarBorder: 'rgba(93, 155, 250, 0.1)',
  headerBg: '#F8FAFF',
  modalOverlay: 'rgba(10, 22, 40, 0.5)',
  shadow: 'rgba(93, 155, 250, 0.1)',
  nodePending: '#C8DDF5',
  nodeDoing: '#F5A623',
  nodeDone: '#2DB86E',
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
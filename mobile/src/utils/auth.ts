import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse } from '../types/skill';

// 存储键名
const AUTH_STORAGE_KEY = 'learnflow_auth_data';
const USER_STORAGE_KEY = 'learnflow_user_data';

/**
 * 保存用户认证信息
 */
export const saveAuthData = async (authData: AuthResponse): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      expiresAt: authData.expiresAt.toISOString(),
    }));
    
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authData.user));
  } catch (error) {
    console.error('保存认证信息失败:', error);
    throw new Error('保存认证信息失败');
  }
};

/**
 * 获取用户认证信息
 */
export const getAuthData = async (): Promise<AuthResponse | null> => {
  try {
    const authDataString = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    const userDataString = await AsyncStorage.getItem(USER_STORAGE_KEY);
    
    if (!authDataString || !userDataString) {
      return null;
    }
    
    const authData = JSON.parse(authDataString);
    const userData = JSON.parse(userDataString);
    
    return {
      user: userData,
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      expiresAt: new Date(authData.expiresAt),
    };
  } catch (error) {
    console.error('获取认证信息失败:', error);
    return null;
  }
};

/**
 * 清除用户认证信息
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, USER_STORAGE_KEY]);
  } catch (error) {
    console.error('清除认证信息失败:', error);
    throw new Error('清除认证信息失败');
  }
};

/**
 * 检查token是否过期
 */
export const isTokenExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

/**
 * 检查用户是否已登录
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const authData = await getAuthData();
    
    if (!authData) {
      return false;
    }
    
    // 检查token是否过期
    if (isTokenExpired(authData.expiresAt)) {
      // token过期，尝试刷新
      try {
        // 这里可以添加刷新token的逻辑
        // 暂时先清除过期数据
        await clearAuthData();
        return false;
      } catch (error) {
        console.error('刷新token失败:', error);
        await clearAuthData();
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('检查认证状态失败:', error);
    return false;
  }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async () => {
  try {
    const userDataString = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return userDataString ? JSON.parse(userDataString) : null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

/**
 * 获取访问令牌
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const authDataString = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!authDataString) return null;
    
    const authData = JSON.parse(authDataString);
    return authData.accessToken;
  } catch (error) {
    console.error('获取访问令牌失败:', error);
    return null;
  }
};
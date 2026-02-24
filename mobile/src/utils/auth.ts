import { AuthResponse } from '../types/skill';

// 使用内存存储作为临时解决方案，避免Expo Go环境下的权限问题
let memoryStorage: { [key: string]: string } = {};
const AUTH_STORAGE_KEY = 'auth_data';

/**
 * 保存用户认证信息到内存存储（临时解决方案）
 */
export const saveAuthData = async (authData: AuthResponse): Promise<void> => {
  try {
    memoryStorage[AUTH_STORAGE_KEY] = JSON.stringify(authData);
    console.log('[Auth] 认证信息保存到内存成功');
  } catch (error) {
    console.error('保存认证信息失败:', error);
  }
};

/**
 * 从内存存储获取用户认证信息
 */
export const getAuthData = async (): Promise<AuthResponse | null> => {
  try {
    const authDataString = memoryStorage[AUTH_STORAGE_KEY];
    if (authDataString) {
      const authData = JSON.parse(authDataString);
      // 转换日期字符串为Date对象
      if (authData.user && authData.user.createdAt) {
        authData.user.createdAt = new Date(authData.user.createdAt);
      }
      if (authData.user && authData.user.lastLoginAt) {
        authData.user.lastLoginAt = new Date(authData.user.lastLoginAt);
      }
      if (authData.expiresAt) {
        authData.expiresAt = new Date(authData.expiresAt);
      }
      console.log('[Auth] 从内存获取认证信息成功');
      return authData;
    }
    console.log('[Auth] 未找到认证信息');
    return null;
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
    delete memoryStorage[AUTH_STORAGE_KEY];
    console.log('[Auth] 认证信息从内存清除成功');
  } catch (error) {
    console.error('清除认证信息失败:', error);
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
    const authData = await getAuthData();
    console.log('[Auth] 当前用户信息:', authData?.user || '无');
    return authData?.user || null;
  } catch (error) {
    console.error('获取当前用户信息失败:', error);
    return null;
  }
};

/**
 * 获取访问令牌
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const authData = await getAuthData();
    console.log('[Auth] 获取访问令牌:', authData?.accessToken || '无');
    return authData?.accessToken || null;
  } catch (error) {
    console.error('获取访问令牌失败:', error);
    return null;
  }
};
import { AuthResponse } from '../types/skill';

// 内存存储（沙盒模式专用）
let memoryStorage: {
  authData?: AuthResponse;
  lastUpdate?: number;
} = {};

/**
 * 保存用户认证信息（沙盒模式 - 仅内存）
 */
export const saveAuthData = async (authData: AuthResponse): Promise<void> => {
  try {
    console.log('[Auth] 沙盒模式 - 保存认证信息到内存');
    
    // 确保有expiresAt
    if (!authData.expiresAt) {
      authData.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    
    memoryStorage.authData = authData;
    memoryStorage.lastUpdate = Date.now();
    
    console.log('[Auth] 认证信息保存成功（内存存储）');
  } catch (error) {
    console.error('保存认证信息失败:', error);
    console.log('[Auth] 沙盒模式 - 忽略存储错误');
  }
};

/**
 * 获取用户认证信息（沙盒模式 - 仅内存）
 */
export const getAuthData = async (): Promise<AuthResponse | null> => {
  try {
    console.log('[Auth] 沙盒模式 - 从内存获取认证信息');
    
    if (!memoryStorage.authData) {
      console.log('[Auth] 未找到认证信息');
      return null;
    }
    
    // 检查token是否过期
    const authData = memoryStorage.authData;
    if (authData.expiresAt && new Date(authData.expiresAt) < new Date()) {
      console.log('[Auth] Token已过期，清除认证信息');
      memoryStorage.authData = undefined;
      return null;
    }
    
    console.log('[Auth] 成功获取认证信息（内存存储）');
    return authData;
  } catch (error) {
    console.error('获取认证信息失败:', error);
    return null;
  }
};

/**
 * 清除用户认证信息（沙盒模式 - 仅内存）
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    console.log('[Auth] 沙盒模式 - 清除内存中的认证信息');
    memoryStorage.authData = undefined;
    memoryStorage.lastUpdate = undefined;
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
 * 获取当前用户信息（沙盒模式 - 仅内存）
 */
export const getCurrentUser = async () => {
  try {
    console.log('[Auth] 沙盒模式 - 从内存获取用户信息');
    return memoryStorage.authData?.user || null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

/**
 * 获取访问令牌（沙盒模式 - 仅内存）
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    console.log('[Auth] 沙盒模式 - 从内存获取访问令牌');
    return memoryStorage.authData?.accessToken || null;
  } catch (error) {
    console.error('获取访问令牌失败:', error);
    return null;
  }
};
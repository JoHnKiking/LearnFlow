import { AuthResponse } from '../types/skill';

/**
 * 保存用户认证信息（简化版 - 不持久化存储）
 */
export const saveAuthData = async (authData: AuthResponse): Promise<void> => {
  try {
    console.log('[Auth] 认证信息处理完成（不持久化存储）');
    // 简化处理：不保存到本地存储，每次重启App需要重新登录
  } catch (error) {
    console.error('处理认证信息失败:', error);
  }
};

/**
 * 获取用户认证信息（简化版 - 总是返回null）
 */
export const getAuthData = async (): Promise<AuthResponse | null> => {
  console.log('[Auth] 无持久化存储 - 需要重新登录');
  return null; // 总是返回null，强制重新登录
};

/**
 * 清除用户认证信息（简化版）
 */
export const clearAuthData = async (): Promise<void> => {
  console.log('[Auth] 清除认证信息（无持久化存储）');
  // 无需操作，因为没有持久化存储
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
  return null; 
};

/**
 * 获取访问令牌
 */
export const getAccessToken = async (): Promise<string | null> => {
  return null; 
};
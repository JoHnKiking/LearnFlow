import { Alert } from 'react-native';

// 通用工具函数

/**
 * 显示错误提示
 */
export const showErrorAlert = (message: string, title: string = '错误') => {
  Alert.alert(title, message);
};

/**
 * 显示成功提示
 */
export const showSuccessAlert = (message: string, title: string = '成功') => {
  Alert.alert(title, message);
};

/**
 * 验证输入是否为空
 */
export const validateInput = (input: string, fieldName: string): boolean => {
  if (!input.trim()) {
    showErrorAlert(`请输入${fieldName}`);
    return false;
  }
  return true;
};

/**
 * 格式化时间显示
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

/**
 * 截断长文本
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};
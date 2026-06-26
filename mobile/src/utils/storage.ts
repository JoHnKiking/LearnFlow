import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  MONSTER: 'monster',
  NOTES: 'learningNotes',
  TASKS: 'learningTasks',
  LAST_RESET: 'lastDailyReset',
  IS_NEW_USER: 'isNewUser',
} as const;

// 节点进度存储键：nodeProgresses_{domainId} → Record<nodeId, 'pending' | 'done'>
export const nodeProgressKey = (domain: string) => `nodeProgresses_${domain}`;

// 番茄钟完成记录：pomodoroCount_{domain}_{nodeId} → number
export const pomodoroCountKey = (domain: string, nodeId: string) => `pomodoroCount_${domain}_${nodeId}`;

// 模块奖励领取标记
export const moduleRewardedKey = (domain: string) => `moduleRewarded_${domain}`;

// 模块完成固定能量奖励
export const MODULE_COMPLETE_ENERGY = 50;

export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Storage get error: ${key}`, error);
      return null;
    }
  },

  async setItem(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage set error: ${key}`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage remove error: ${key}`, error);
    }
  },
};

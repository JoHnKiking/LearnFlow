import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  MONSTER: 'monster',
  NOTES: 'learningNotes',
  TASKS: 'learningTasks',
  LAST_RESET: 'lastDailyReset',
} as const;

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

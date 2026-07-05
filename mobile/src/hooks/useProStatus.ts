import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../utils/auth';
import { proService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProStatus {
  isPro: boolean;
  planId?: string;
  expiresAt?: string; // ISO date string, null = lifetime
}

const PRO_CACHE_KEY = 'user_subscription';

/** 全局 Pro 状态 Hook，所有页面复用 */
export function useProStatus() {
  const [proStatus, setProStatus] = useState<ProStatus>({ isPro: false });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user?.id) {
        setProStatus({ isPro: false });
        setLoading(false);
        return;
      }
      const status = await proService.getStatus();
      const result: ProStatus = {
        isPro: status.isPro,
        planId: status.planId,
        expiresAt: status.expiresAt,
      };
      setProStatus(result);
      // 缓存到 AsyncStorage
      await AsyncStorage.setItem(PRO_CACHE_KEY, JSON.stringify(result));
    } catch {
      // 网络失败时降级读取缓存
      try {
        const cached = await AsyncStorage.getItem(PRO_CACHE_KEY);
        if (cached) {
          setProStatus(JSON.parse(cached));
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...proStatus, loading, refresh };
}

/** 清除 Pro 缓存（登出时调用） */
export async function clearProCache() {
  await AsyncStorage.removeItem(PRO_CACHE_KEY);
}

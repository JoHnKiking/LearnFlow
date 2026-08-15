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
  // Pro 付费功能已停用（2026-08-15）：所有用户直接享受全部 Pro 权益，初始即视为 Pro（永久）
  const [proStatus, setProStatus] = useState<ProStatus>({ isPro: true, planId: 'lifetime' });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user?.id) {
        // 停用付费后：未登录也视为 Pro，所有权益直接可用
        setProStatus({ isPro: true, planId: 'lifetime' });
        setLoading(false);
        return;
      }
      const status = await proService.getStatus();
      // 停用付费后：强制 isPro = true，所有用户直接享受全部 Pro 权益
      const result: ProStatus = {
        isPro: true,
        planId: 'lifetime',
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

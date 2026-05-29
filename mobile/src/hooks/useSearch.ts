import { useState } from 'react';
import { Alert } from 'react-native';
import { skillService } from '../services/api';

export const useSearch = () => {
  const [loading, setLoading] = useState(false);

  const searchDomains = async (keyword: string) => {
    console.log('[useSearch] 搜索领域 - 关键词:', keyword);
    if (!keyword.trim()) {
      Alert.alert('提示', '请输入搜索关键词');
      return null;
    }

    setLoading(true);
    try {
      const result = await skillService.searchPopularDomains(keyword.trim());
      console.log('[useSearch] 搜索完成');
      return result;
    } catch (error) {
      console.error('[useSearch] 搜索失败:', error);
      Alert.alert('错误', '搜索失败，请检查网络连接');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSkillTreeList = async (page: number = 1, limit: number = 5) => {
    console.log('[useSearch] 获取技能树列表 - 页码:', page);
    setLoading(true);
    try {
      const result = await skillService.getSkillTreeList(page, limit);
      console.log('[useSearch] 技能树列表获取成功');
      return result;
    } catch (error) {
      console.error('[useSearch] 获取技能树列表失败:', error);
      Alert.alert('错误', '获取技能树列表失败');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    searchDomains,
    getSkillTreeList
  };
};
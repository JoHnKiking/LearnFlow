import { useState } from 'react';
import { Alert } from 'react-native';
import { skillService } from '../services/api';

export const useSearch = () => {
  const [loading, setLoading] = useState(false);

  const searchDomains = async (keyword: string) => {
    if (!keyword.trim()) {
      Alert.alert('提示', '请输入搜索关键词');
      return null;
    }

    setLoading(true);
    try {
      const result = await skillService.searchPopularDomains(keyword.trim());
      return result;
    } catch (error) {
      Alert.alert('错误', '搜索失败，请检查网络连接');
      console.error('Error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSkillTreeList = async (page: number = 1, limit: number = 5) => {
    setLoading(true);
    try {
      const result = await skillService.getSkillTreeList(page, limit);
      return result;
    } catch (error) {
      Alert.alert('错误', '获取技能树列表失败');
      console.error('Error:', error);
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
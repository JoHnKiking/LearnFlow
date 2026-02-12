import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { skillService } from '../services/api';

export const useSkillTree = () => {
  const [loading, setLoading] = useState(false);

  const generateSkillTree = async (domain: string) => {
    if (!domain.trim()) {
      Alert.alert('错误', '请输入领域名称');
      return false;
    }

    setLoading(true);
    try {
      await skillService.generateSkillTree({ domain: domain.trim() });
      router.push({
        pathname: '/skill-tree',
        params: { domain: domain.trim() }
      });
      return true;
    } catch (error) {
      Alert.alert('错误', '生成技能树失败，请检查网络连接');
      console.error('Error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedPath = async (domain: string) => {
    if (!domain.trim()) {
      Alert.alert('错误', '请输入领域名称');
      return null;
    }

    setLoading(true);
    try {
      const path = await skillService.getRecommendedPath(domain.trim());
      return path;
    } catch (error) {
      Alert.alert('错误', '获取推荐路径失败');
      console.error('Error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateSkillTree,
    getRecommendedPath
  };
};
import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { skillService } from '../services/api';

export const useSkillTree = () => {
  const [loading, setLoading] = useState(false);

  const generateSkillTree = async (domain: string) => {
    console.log('[useSkillTree] 生成技能树 - 领域:', domain);
    if (!domain.trim()) {
      Alert.alert('错误', '请输入领域名称');
      return false;
    }

    setLoading(true);
    try {
      await skillService.generateSkillTree({ domain: domain.trim() });
      console.log('[useSkillTree] 技能树生成成功');
      router.push({
        pathname: '/skill-tree',
        params: { domain: domain.trim() }
      });
      return true;
    } catch (error) {
      console.error('[useSkillTree] 生成技能树失败:', error);
      Alert.alert('错误', '生成技能树失败，请检查网络连接');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedPath = async (domain: string) => {
    console.log('[useSkillTree] 获取推荐路径 - 领域:', domain);
    if (!domain.trim()) {
      Alert.alert('错误', '请输入领域名称');
      return null;
    }

    setLoading(true);
    try {
      const path = await skillService.getRecommendedPath(domain.trim());
      console.log('[useSkillTree] 推荐路径获取成功');
      return path;
    } catch (error) {
      console.error('[useSkillTree] 获取推荐路径失败:', error);
      Alert.alert('错误', '获取推荐路径失败');
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
import { useState } from 'react';
import { Alert } from 'react-native';
import { skillService } from '../services/api';

export const useStatistics = () => {
  const [loading, setLoading] = useState(false);

  const getStatistics = async () => {
    console.log('[useStatistics] 获取统计信息');
    setLoading(true);
    try {
      const stats = await skillService.getStatistics();
      console.log('[useStatistics] 统计信息获取成功');
      return stats;
    } catch (error) {
      console.error('[useStatistics] 获取统计信息失败:', error);
      Alert.alert('错误', '获取统计信息失败');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getLearningReport = async (userId: string = 'user1') => {
    console.log('[useStatistics] 获取学习报告 - 用户:', userId);
    setLoading(true);
    try {
      const report = await skillService.getUserLearningReport(userId);
      console.log('[useStatistics] 学习报告获取成功');
      return report;
    } catch (error) {
      console.error('[useStatistics] 获取学习报告失败:', error);
      Alert.alert('错误', '获取学习报告失败');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getStatistics,
    getLearningReport
  };
};
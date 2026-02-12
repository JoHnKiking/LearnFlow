import { useState } from 'react';
import { Alert } from 'react-native';
import { skillService } from '../services/api';

export const useStatistics = () => {
  const [loading, setLoading] = useState(false);

  const getStatistics = async () => {
    setLoading(true);
    try {
      const stats = await skillService.getStatistics();
      return stats;
    } catch (error) {
      Alert.alert('错误', '获取统计信息失败');
      console.error('Error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getLearningReport = async (userId: string = 'user1') => {
    setLoading(true);
    try {
      const report = await skillService.getUserLearningReport(userId);
      return report;
    } catch (error) {
      Alert.alert('错误', '获取学习报告失败');
      console.error('Error:', error);
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
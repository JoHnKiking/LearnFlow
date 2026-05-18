import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Loading } from '../src/components/ui';
import { SPACING } from '../src/utils/constants';
import { useTheme } from '../src/contexts/ThemeContext';

const IndexScreen = () => {
  const { colors } = useTheme();
  useEffect(() => {
    console.log('🚀 IndexScreen 加载了，准备跳转到 /login');
    // 扫描进入后，直接跳转到登录页
    router.replace('/login');
  }, []);

  const styles = useMemo(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: SPACING.SMALL,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: SPACING.XLARGE,
  },
}), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>LearnFlow</Text>
        <Text style={styles.subtitle}>技能学习路径管理</Text>
        <Loading visible={true} message="加载中..." />
      </View>
    </SafeAreaView>
  );
};

export default IndexScreen;
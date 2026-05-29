import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useRootNavigationState } from 'expo-router';
import { Loading } from '../src/components/ui';
import { SPACING } from '../src/utils/constants';
import { useTheme } from '../src/contexts/ThemeContext';

const IndexScreen = () => {
  const { colors } = useTheme();
  const rootNavState = useRootNavigationState();

  useEffect(() => {
    if (rootNavState?.key) {
      // 延迟一帧确保导航栈就绪
      const timer = setTimeout(() => {
        router.replace('/login');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [rootNavState?.key]);

  const styles = StyleSheet.create({
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
      fontWeight: 'bold' as const,
      color: colors.primary,
      marginBottom: SPACING.SMALL,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: SPACING.XLARGE,
    },
  });

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
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Loading } from '../src/components/ui';
import { checkAuthStatus } from '../src/utils/auth';
import { COLORS, SPACING } from '../src/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IndexScreen = () => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const isAuthenticated = await checkAuthStatus();
        const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');

        if (isAuthenticated && onboardingCompleted === 'true') {
          // 已登录且完成新手教程，直接进入主界面
          router.replace('/(tabs)');
        } else if (isAuthenticated && onboardingCompleted !== 'true') {
          // 已登录但未完成新手教程，进入新手教程
          router.replace('/splash');
        } else {
          // 未登录，进入登录页面
          router.replace('/login');
        }
      } catch (error) {
        console.error('初始化应用失败:', error);
        router.replace('/login');
      }
    };

    initializeApp();
  }, []);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
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
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XLARGE,
  },
});

export default IndexScreen;
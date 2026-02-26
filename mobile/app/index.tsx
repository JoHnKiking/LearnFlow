import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Loading } from '../src/components/ui';
import { checkAuthStatus, getAuthData } from '../src/utils/auth';
import { COLORS, SPACING } from '../src/utils';

const IndexScreen = () => {
  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = async () => {
      try {
        const isAuthenticated = await checkAuthStatus();
        
        if (isAuthenticated) {
          // 用户已登录，检查是否是首次使用
          const authData = await getAuthData();
          if (authData && authData.user && authData.user.loginCount <= 1) {
            // 首次使用，显示引导页面
            router.replace('/onboarding');
          } else {
            // 非首次使用，跳转到主页面
            router.replace('/(tabs)');
          }
        } else {
          // 用户未登录，跳转到登录页面
          router.replace('/login');
        }
      } catch (error) {
        console.error('检查认证状态失败:', error);
        // 出错时跳转到登录页面
        router.replace('/login');
      }
    };

    checkAuth();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>LearnFlow</Text>
        <Text style={styles.subtitle}>技能学习路径管理</Text>
        <Loading visible={true} message="检查登录状态..." />
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
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Loading } from '../src/components/ui';
import { checkAuthStatus, getAuthData } from '../src/utils/auth';
import { COLORS, SPACING } from '../src/utils';

const IndexScreen = () => {
  useEffect(() => {
    // 直接跳转到登录页面，避免在应用启动时进行网络请求
    // 不同网络环境下，ngrok域名可能无法解析，导致应用无法启动
    const initializeApp = async () => {
      try {
        // 先尝试检查本地认证状态（不涉及网络请求）
        const authData = await getAuthData();
        
        if (authData) {
          // 有本地认证数据，直接跳转到主页面
          router.replace('/(tabs)');
        } else {
          // 没有本地认证数据，跳转到登录页面
          router.replace('/login');
        }
      } catch (error) {
        console.error('初始化应用失败:', error);
        // 出错时跳转到登录页面
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
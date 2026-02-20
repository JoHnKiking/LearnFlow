import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Input, Loading } from '../src/components/ui';
import { COLORS, SPACING, showErrorAlert } from '../src/utils';
import { authService } from '../src/services/api';
import { saveAuthData } from '../src/utils/auth';

const LoginScreen = () => {
  const [loginType, setLoginType] = useState<'phone' | 'wechat'>('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneLogin = async () => {
    if (!phone || !password) {
      Alert.alert('错误', '请输入手机号和密码');
      return;
    }

    setLoading(true);
    try {
      // 调用真实登录API
      const authResponse = await authService.login({ 
        phone, 
        password,
        deviceId: 'mobile-device',
        type: 'phone',
        deviceType: 'android',
        deviceName: '移动设备'
      });
      
      // 保存认证信息
      await saveAuthData(authResponse);
      
      setLoading(false);
      Alert.alert('登录成功', '欢迎回来！');
      router.replace('/(tabs)');
    } catch (error) {
      setLoading(false);
      showErrorAlert('登录失败', error as string);
    }
  };

  const handleWechatLogin = async () => {
    setLoading(true);
    try {
      // 这里调用微信登录API
      // const user = await authService.login({ type: 'wechat' });
      
      // 模拟微信登录成功
      setTimeout(() => {
        setLoading(false);
        Alert.alert('登录成功', '欢迎回来！');
        router.replace('/(tabs)');
      }, 1000);
    } catch (error) {
      setLoading(false);
      showErrorAlert('微信登录失败', error as string);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading visible={true} message="登录中..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>LearnFlow</Text>
          <Text style={styles.subtitle}>技能学习路径管理</Text>
        </View>

        <View style={styles.loginContainer}>
          <View style={styles.tabContainer}>
            <Text 
              style={[styles.tab, loginType === 'phone' && styles.activeTab]}
              onPress={() => setLoginType('phone')}
            >
              手机登录
            </Text>
            <Text 
              style={[styles.tab, loginType === 'wechat' && styles.activeTab]}
              onPress={() => setLoginType('wechat')}
            >
              微信登录
            </Text>
          </View>

          {loginType === 'phone' ? (
            <View style={styles.form}>
              <Input
                placeholder="请输入手机号"
                value={phone}
                onChangeText={setPhone}
              />
              <Input
                placeholder="请输入密码"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Button 
                title="登录" 
                onPress={handlePhoneLogin}
              />
            </View>
          ) : (
            <View style={styles.wechatContainer}>
              <Button
                title="微信一键登录"
                onPress={handleWechatLogin}
              />
            </View>
          )}

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              还没有账号？
              <Text style={styles.registerLink} onPress={handleRegister}>
                立即注册
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.LARGE,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.XLARGE,
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
  },
  loginContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.LARGE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  tab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: SPACING.MEDIUM,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  activeTab: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.PRIMARY,
  },
  form: {
    gap: SPACING.MEDIUM,
  },
  wechatContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.LARGE,
  },
  registerContainer: {
    marginTop: SPACING.LARGE,
    alignItems: 'center',
  },
  registerText: {
    color: COLORS.TEXT_SECONDARY,
  },
  registerLink: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default LoginScreen;
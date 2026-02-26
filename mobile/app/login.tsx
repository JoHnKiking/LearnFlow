import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { PixelButton, PixelCard, PixelLoading, PixelInput } from '../src/components/ui';
import { PIXEL_COLORS, SPACING, showErrorAlert } from '../src/utils';
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
      const authResponse = await authService.login({ 
        phone, 
        password,
        deviceId: 'mobile-device',
        type: 'phone',
        deviceType: 'android',
        deviceName: '移动设备'
      });
      
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
        <PixelLoading text="登录中..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>LearnFlow</Text>
          <Text style={styles.subtitle}>知识星球探索</Text>
        </View>

        <PixelCard style={styles.loginContainer}>
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
              <PixelInput
                label="手机号"
                placeholder="请输入手机号"
                value={phone}
                onChangeText={setPhone}
              />
              <PixelInput
                label="密码"
                placeholder="请输入密码"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <PixelButton 
                title="登录" 
                onPress={handlePhoneLogin}
                fullWidth={true}
              />
            </View>
          ) : (
            <View style={styles.wechatContainer}>
              <PixelButton
                title="微信一键登录"
                onPress={handleWechatLogin}
                variant="success"
                fullWidth={true}
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
        </PixelCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PIXEL_COLORS.BACKGROUND,
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
    fontSize: 36,
    fontWeight: '800',
    color: PIXEL_COLORS.PIXEL_CYAN,
    marginBottom: SPACING.SMALL,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    color: PIXEL_COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
  },
  loginContainer: {
    padding: SPACING.LARGE,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.LARGE,
    borderBottomWidth: 2,
    borderBottomColor: PIXEL_COLORS.PIXEL_GRAY,
  },
  tab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: SPACING.MEDIUM,
    fontSize: 16,
    color: PIXEL_COLORS.TEXT_SECONDARY,
    fontWeight: '600',
    letterSpacing: 1,
  },
  activeTab: {
    color: PIXEL_COLORS.PIXEL_CYAN,
    fontWeight: '800',
    borderBottomWidth: 3,
    borderBottomColor: PIXEL_COLORS.PIXEL_CYAN,
  },
  form: {
    gap: SPACING.MEDIUM,
  },
  wechatContainer: {
    paddingVertical: SPACING.LARGE,
  },
  registerContainer: {
    marginTop: SPACING.LARGE,
    alignItems: 'center',
  },
  registerText: {
    color: PIXEL_COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
  registerLink: {
    color: PIXEL_COLORS.PIXEL_CYAN,
    fontWeight: '800',
    marginLeft: 4,
  },
});

export default LoginScreen;

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { PixelButton, PixelCard, PixelLoading, PixelInput } from '../src/components/ui';
import { authService } from '../src/services/api';
import { saveAuthData } from '../src/utils/auth';
import { PIXEL_COLORS, SPACING, showErrorAlert } from '../src/utils';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !phone || !password || !confirmPassword) {
      Alert.alert('错误', '请填写所有必填字段');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('错误', '两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      Alert.alert('错误', '密码长度至少6位');
      return;
    }

    setLoading(true);
    try {
      const authResponse = await authService.register({ username, phone, password });
      
      await saveAuthData(authResponse);
      
      setLoading(false);
      Alert.alert('注册成功', '账号创建成功！');
      
      router.replace('/onboarding');
    } catch (error) {
      setLoading(false);
      showErrorAlert('注册失败', error as string);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PixelLoading text="注册中..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>注册账号</Text>
          <Text style={styles.subtitle}>创建您的LearnFlow账号</Text>
        </View>

        <PixelCard style={styles.formContainer}>
          <PixelInput
            label="用户名"
            placeholder="请输入用户名"
            value={username}
            onChangeText={setUsername}
          />
          <PixelInput
            label="手机号"
            placeholder="请输入手机号"
            value={phone}
            onChangeText={setPhone}
          />
          <PixelInput
            label="密码"
            placeholder="请输入密码（至少6位）"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <PixelInput
            label="确认密码"
            placeholder="请再次输入密码"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <PixelButton 
            title="注册" 
            onPress={handleRegister}
            fullWidth={true}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              已有账号？
              <Text style={styles.loginLink} onPress={handleLogin}>
                立即登录
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
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: PIXEL_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    letterSpacing: 1,
  },
  formContainer: {
    padding: SPACING.LARGE,
    gap: SPACING.MEDIUM,
  },
  loginContainer: {
    marginTop: SPACING.LARGE,
    alignItems: 'center',
  },
  loginText: {
    color: PIXEL_COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
  loginLink: {
    color: PIXEL_COLORS.PIXEL_CYAN,
    fontWeight: '800',
    marginLeft: 4,
  },
});

export default RegisterScreen;

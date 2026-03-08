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
      
      // 根据后端错误信息显示具体的提示
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message as string;
        
        if (errorMessage.includes('手机号已被注册')) {
          Alert.alert('注册失败', '该手机号已被注册，请更换手机号或使用登录功能');
        } else if (errorMessage.includes('用户名已被使用')) {
          Alert.alert('注册失败', '该用户名已被使用，请选择其他用户名');
        } else if (errorMessage.includes('密码长度至少6位')) {
          Alert.alert('注册失败', '密码长度至少6位，请设置更长的密码');
        } else if (errorMessage.includes('用户名、手机号和密码不能为空')) {
          Alert.alert('注册失败', '请填写所有必填字段');
        } else {
          showErrorAlert('注册失败', errorMessage);
        }
      } else {
        showErrorAlert('注册失败', '注册过程中发生未知错误');
      }
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

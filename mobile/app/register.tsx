import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Input, Loading } from '../src/components/ui';
import { authService } from '../src/services/api';
import { saveAuthData } from '../src/utils/auth';
import { COLORS, SPACING, showErrorAlert } from '../src/utils';

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
      // 调用真实的注册API
      const authResponse = await authService.register({ username, phone, password });
      
      // 保存认证信息到本地存储
      await saveAuthData(authResponse);
      
      setLoading(false);
      Alert.alert('注册成功', '账号创建成功！');
      
      // 注册成功后直接登录，跳转到主页面
      router.replace('/(tabs)');
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
        <Loading visible={true} message="注册中..." />
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

        <View style={styles.formContainer}>
          <Input
            placeholder="请输入用户名"
            value={username}
            onChangeText={setUsername}
            label="用户名"
          />
          <Input
            placeholder="请输入手机号"
            value={phone}
            onChangeText={setPhone}
            label="手机号"
          />
          <Input
            placeholder="请输入密码（至少6位）"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            label="密码"
          />
          <Input
            placeholder="请再次输入密码"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            label="确认密码"
          />
          
          <Button 
            title="注册" 
            onPress={handleRegister}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              已有账号？
              <Text style={styles.loginLink} onPress={handleLogin}>
                立即登录
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
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: SPACING.MEDIUM,
  },

  loginContainer: {
    marginTop: SPACING.LARGE,
    alignItems: 'center',
  },
  loginText: {
    color: COLORS.TEXT_SECONDARY,
  },
  loginLink: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default RegisterScreen;
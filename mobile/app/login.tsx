import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { authService } from '../src/services/api';
import { saveAuthData } from '../src/utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../src/utils/storage';
import { showErrorAlert, toErrorMessage } from '../src/utils';
import { FloatingInputBar, InputFieldConfig } from '../src/components/FloatingInputBar';

const LoginScreen = () => {
  const { colors } = useTheme();
  const [loginType, setLoginType] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  const handleSubmit = async () => {
    console.log(`[Login] handleSubmit - 类型: ${loginType}, 手机号: ${phone}`);
    if (loginType === 'register' && (!name || !phone || !password)) {
      Alert.alert('错误', '请填写完整信息');
      return;
    }
    if (loginType === 'login' && (!phone || !password)) {
      Alert.alert('错误', '请输入手机号和密码');
      return;
    }

    setLoading(true);
    try {
      let authResponse;
      
      if (loginType === 'register') {
        console.log('[Login] 开始注册 - 用户名:', name);
        authResponse = await authService.register({
          username: name,
          email: phone,
          password
        });
      } else {
        console.log('[Login] 开始登录 - 手机号:', phone);
        authResponse = await authService.login({
          email: phone,
          password,
          deviceId: 'mobile-device',
          type: 'email',
          deviceType: 'android',
          deviceName: '移动设备'
        });
      }
      
      console.log(`[Login] ${loginType === 'register' ? '注册' : '登录'}成功`);
      await saveAuthData(authResponse);
      
      setLoading(false);
      
      if (loginType === 'register') {
        await AsyncStorage.setItem(STORAGE_KEYS.IS_NEW_USER, 'true');
        Alert.alert('注册成功', '欢迎加入 LearnFlow！');
        router.replace('/onboarding');
      } else {
          Alert.alert('登录成功', '欢迎回来！');
          router.replace('/(tabs)');
      }
    } catch (error) {
      console.error(`[Login] ${loginType === 'register' ? '注册' : '登录'}失败:`, error);
      setLoading(false);
      showErrorAlert(
        loginType === 'register' ? '注册失败' : '登录失败',
        toErrorMessage(error)
      );
    }
  };

  // ---- 浮动输入栏字段配置 ----
  const inputFields: InputFieldConfig[] = useMemo(() => {
    const fields: InputFieldConfig[] = [
      {
        id: 'phone',
        label: '手机号',
        icon: 'phone-portrait',
        value: phone,
        onChangeText: setPhone,
        keyboardType: 'phone-pad',
        placeholder: '请输入手机号',
      },
      {
        id: 'password',
        label: '密码',
        icon: 'lock-closed',
        value: password,
        onChangeText: setPassword,
        secureTextEntry: !showPassword,
        placeholder: '请输入密码',
      },
    ];
    if (loginType === 'register') {
      fields.unshift({
        id: 'name',
        label: '名字',
        icon: 'person',
        value: name,
        onChangeText: setName,
        placeholder: '你的名字',
      });
    }
    return fields;
  }, [loginType, phone, password, name, showPassword]);

  const styles = useMemo(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 0,
    minHeight: Dimensions.get('window').height,
  },
  backgroundDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gradientCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: '#D4A574',
    opacity: 0.08,
  },
  gradientCircle2: {
    position: 'absolute',
    top: '33%',
    left: -80,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: '#C89070',
    opacity: 0.06,
  },
  gradientCircle3: {
    position: 'absolute',
    bottom: 80,
    right: 40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#D4A574',
    opacity: 0.04,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 2,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 5,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 2,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 2,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#D4A574',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  displayText: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  passwordToggle: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#D4A574',
  },
  loginButton: {
    height: 56,
    borderRadius: 2,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    borderTopColor: 'transparent',
  },
  termsText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 20,
  },
  termsLink: {
    color: colors.primary,
  },
}), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 背景装饰 */}
          <View style={styles.backgroundDecorations}>
            <View style={styles.gradientCircle1} />
            <View style={styles.gradientCircle2} />
            <View style={styles.gradientCircle3} />
          </View>

          {/* Logo 区域 */}
          <View style={styles.logoSection}>
            <Text style={styles.appTitle}>LearnFlow</Text>
            <Text style={styles.appSubtitle}>开启你的技能冒险之旅</Text>
          </View>

          {/* Tab 切换器 */}
          <View style={styles.tabContainer}>
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                style={[styles.tabButton, loginType === 'login' && styles.activeTabButton]}
                onPress={() => setLoginType('login')}
              >
                <Text style={[styles.tabText, loginType === 'login' && styles.activeTabText]}>
                  登录
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, loginType === 'register' && styles.activeTabButton]}
                onPress={() => setLoginType('register')}
              >
                <Text style={[styles.tabText, loginType === 'register' && styles.activeTabText]}>
                  注册
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 表单 */}
          <View style={styles.formContainer}>
            {loginType === 'register' && (
              <TouchableOpacity 
                style={styles.inputContainer}
                activeOpacity={0.7}
                onPress={() => setActiveFieldId('name')}
              >
                <Ionicons name="person" size={20} color={colors.primary} style={styles.inputIcon} />
                <Text 
                  style={[styles.displayText, name ? { color: colors.textPrimary } : { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {name || '你的名字'}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.inputContainer}
              activeOpacity={0.7}
              onPress={() => setActiveFieldId('phone')}
            >
              <Ionicons name="phone-portrait" size={20} color={colors.primary} style={styles.inputIcon} />
              <Text 
                style={[styles.displayText, phone ? { color: colors.textPrimary } : { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {phone || '手机号'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.inputContainer}
              activeOpacity={0.7}
              onPress={() => setActiveFieldId('password')}
            >
              <Ionicons name="lock-closed" size={20} color={colors.primary} style={styles.inputIcon} />
              <Text 
                style={[styles.displayText, password ? { color: colors.textPrimary } : { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {password ? '●'.repeat(Math.min(password.length, 12)) : '密码'}
              </Text>
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </TouchableOpacity>

            {loginType === 'login' && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>忘记密码？</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <View style={styles.loadingSpinner} />
              ) : (
                <Text style={styles.loginButtonText}>{loginType === 'login' ? '登录' : '创建账号'}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 底部条款 */}
          <Text style={styles.termsText}>
            继续即表示你同意我们的{' '}
            <Text style={styles.termsLink}>服务条款</Text> 和{' '}
            <Text style={styles.termsLink}>隐私政策</Text>
          </Text>
        </ScrollView>

      {/* 键盘上方浮动输入栏 */}
      <FloatingInputBar
        fields={inputFields}
        activeFieldId={activeFieldId}
        onDismiss={() => setActiveFieldId(null)}
        colors={colors}
      />
      </SafeAreaView>
    );


};

export default LoginScreen;
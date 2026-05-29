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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  const handleSubmit = async () => {
    console.log(`[Login] handleSubmit - 类型: ${loginType}, 邮箱: ${email}`);
    if (loginType === 'register' && (!name || !email || !password)) {
      Alert.alert('错误', '请填写完整信息');
      return;
    }
    if (loginType === 'login' && (!email || !password)) {
      Alert.alert('错误', '请输入邮箱和密码');
      return;
    }

    setLoading(true);
    try {
      let authResponse;
      
      if (loginType === 'register') {
        console.log('[Login] 开始注册 - 用户名:', name);
        authResponse = await authService.register({
          username: name,
          email,
          password
        });
      } else {
        console.log('[Login] 开始登录 - 邮箱:', email);
        authResponse = await authService.login({
          email,
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
        id: 'email',
        label: '邮箱',
        icon: 'mail',
        value: email,
        onChangeText: setEmail,
        keyboardType: 'email-address',
        placeholder: '请输入邮箱',
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
  }, [loginType, email, password, name, showPassword]);

  const handleRegister = () => {
    router.push('/register');
  };

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
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  gradientCircle2: {
    position: 'absolute',
    top: '33%',
    left: -80,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: colors.orange,
    opacity: 0.08,
  },
  gradientCircle3: {
    position: 'absolute',
    bottom: 80,
    right: 40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.success,
    opacity: 0.06,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'linear-gradient(135deg, #5D9BFA, #7B5EA7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 5,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
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
    backgroundColor: colors.backgroundDark,
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: 'rgba(123,117,216,0.8)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
    borderWidth: 1,
    borderColor: 'rgba(123,117,216,0.2)',
    borderRadius: 16,
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
    color: colors.primary,
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(123,117,216,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    borderTopColor: 'transparent',
  },
  wechatContainer: {
    paddingVertical: 16,
  },
  wechatButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 5,
  },
  wechatButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
  },
  wechatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.backgroundDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
  },
  socialButtonText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  registerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 4,
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
            <View style={styles.logoContainer}>
              <Ionicons name="flash" size={36} color="#fff" />
            </View>
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
              onPress={() => setActiveFieldId('email')}
            >
              <Ionicons name="mail" size={20} color={colors.primary} style={styles.inputIcon} />
              <Text 
                style={[styles.displayText, email ? { color: colors.textPrimary } : { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {email || '邮箱'}
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

          {/* 分割线 */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>或者</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 社交登录 */}
          <View style={styles.socialContainer}>
            {[
              { name: 'Google', icon: 'logo-google', color: '#EA4335' },
              { name: 'Apple', icon: 'logo-apple', color: '#ffffff' },
              { name: '微信', icon: 'logo-wechat', color: '#3AE374' },
            ].map((provider) => (
              <TouchableOpacity
                key={provider.name}
                style={styles.socialButton}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <Ionicons name={provider.icon as any} size={20} color={provider.color} />
                <Text style={styles.socialButtonText}>{provider.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 注册链接 */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              还没有账号？
              <Text style={styles.registerLink} onPress={handleRegister}>
                立即注册
              </Text>
            </Text>
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
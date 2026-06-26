import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Dimensions, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { authService } from '../src/services/api';
import { saveAuthData, getCurrentUser } from '../src/utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage, STORAGE_KEYS } from '../src/utils/storage';
import { showErrorAlert, toErrorMessage } from '../src/utils';
import { FloatingInputBar, InputFieldConfig } from '../src/components/FloatingInputBar';
import { PRIVACY_POLICY_CONTENT, TERMS_OF_SERVICE_CONTENT } from '../src/constants/legal';

const LoginScreen = () => {
  const { colors } = useTheme();
  const [loginType, setLoginType] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const handleSubmit = async () => {
    console.log(`[Login] handleSubmit - 类型: ${loginType}, 邮箱: ${email}`);
    if (!email || !password) {
      Alert.alert('错误', '请输入邮箱和密码');
      return;
    }

    // 邮箱格式校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('错误', '请输入有效的邮箱地址');
      return;
    }

    if (loginType === 'register') {
      if (!username.trim()) {
        Alert.alert('错误', '请输入用户名');
        return;
      }
      if (password.length < 6) {
        Alert.alert('错误', '密码长度至少6位');
        return;
      }
    }

    setLoading(true);
    try {
      
      if (loginType === 'register') {
        console.log('[Login] 开始注册 - 用户名:', username, '邮箱:', email);
        await authService.register({
          username: username.trim(),
          email,
          password
        });
        // 注册成功，跳转验证码页面
        setLoading(false);
        router.push({ pathname: '/verify-email', params: { email, username: username.trim() } });
        return;
      }

      // 登录
      console.log('[Login] 开始登录 - 邮箱:', email);
      const authResponse = await authService.login({
        email,
        password,
        deviceId: 'mobile-device',
        type: 'email',
        deviceType: 'android',
        deviceName: '移动设备'
      });
      
      // 登录成功
      console.log(`[Login] 登录成功`);
      await saveAuthData(authResponse);
      
      setLoading(false);
      const monsterData = await storage.getItem(STORAGE_KEYS.MONSTER);
      if (!monsterData) {
        Alert.alert('登录成功', '欢迎来到 LearnFlow！');
        router.replace('/story');
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
    const fields: InputFieldConfig[] = [];
    if (loginType === 'register') {
      fields.push({
        id: 'username',
        label: '用户名',
        icon: 'person',
        value: username,
        onChangeText: setUsername,
        placeholder: '请输入用户名',
      });
    }
    fields.push(
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
        placeholder: loginType === 'register' ? '至少6位密码' : '请输入密码',
      },
    );
    return fields;
  }, [loginType, username, email, password, showPassword]);

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
    opacity: 0.08,
  },
  gradientCircle2: {
    position: 'absolute',
    top: '33%',
    left: -80,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: colors.primary,
    opacity: 0.04,
  },
  gradientCircle3: {
    position: 'absolute',
    bottom: 80,
    right: 40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.primary,
    opacity: 0.03,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.planetGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 5,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.onPrimary,
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
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
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
    color: colors.onPrimary,
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
    color: colors.primary,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
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
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.onPrimary,
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
  legalModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  legalModalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  legalModalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  legalModalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  legalCloseBtn: { padding: 4 },
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
                onPress={() => setActiveFieldId('username')}
              >
                <Ionicons name="person" size={20} color={colors.primary} style={styles.inputIcon} />
                <Text 
                  style={[styles.displayText, username ? { color: colors.textPrimary } : { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {username || '用户名'}
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

          {/* 底部条款 */}
          <Text style={styles.termsText}>
            继续即表示你同意我们的{' '}
            <Text style={styles.termsLink} onPress={() => setLegalModal('terms')}>服务条款</Text> 和{' '}
            <Text style={styles.termsLink} onPress={() => setLegalModal('privacy')}>隐私政策</Text>
          </Text>
        </ScrollView>

      {/* 法律文件弹窗 */}
      <Modal visible={legalModal !== null} animationType="slide" transparent onRequestClose={() => setLegalModal(null)}>
        <Pressable style={styles.legalModalOverlay} onPress={() => setLegalModal(null)}>
          <Pressable style={styles.legalModalCard} onPress={() => {}}>
            <View style={styles.legalModalHeader}>
              <Text style={styles.legalModalTitle}>
                {legalModal === 'privacy' ? '隐私政策' : '服务条款'}
              </Text>
              <TouchableOpacity style={styles.legalCloseBtn} onPress={() => setLegalModal(null)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {legalModal === 'privacy' ? <PRIVACY_POLICY_CONTENT /> : <TERMS_OF_SERVICE_CONTENT />}
          </Pressable>
        </Pressable>
      </Modal>

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
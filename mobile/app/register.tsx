import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Dimensions, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { authService } from '../src/services/api';
import { saveAuthData } from '../src/utils/auth';
import { showErrorAlert, toErrorMessage } from '../src/utils';
import InputDialog from '../src/components/InputDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../src/utils/storage';
import { PRIVACY_POLICY_CONTENT, TERMS_OF_SERVICE_CONTENT } from '../src/constants/legal';

const RegisterScreen = () => {
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  // ---- 当前激活字段的配置 ----
  const activeField = (() => {
    switch (activeFieldId) {
      case 'username': return { title: '用户名', icon: 'person', value: username, onChangeText: setUsername, placeholder: '请输入用户名', keyboardType: 'default' as any, secureTextEntry: false };
      case 'email': return { title: '邮箱', icon: 'mail', value: email, onChangeText: setEmail, placeholder: '请输入邮箱', keyboardType: 'email-address' as any, secureTextEntry: false };
      case 'password': return { title: '密码', icon: 'lock-closed', value: password, onChangeText: setPassword, placeholder: '至少6位密码', keyboardType: 'default' as any, secureTextEntry: !showPassword };
      case 'confirmPassword': return { title: '确认密码', icon: 'lock-closed', value: confirmPassword, onChangeText: setConfirmPassword, placeholder: '请再次输入密码', keyboardType: 'default' as any, secureTextEntry: !showConfirmPassword };
      default: return null;
    }
  })();

  const handleRegister = async () => {
    console.log('[Register] 开始注册 - 用户名:', username, '邮箱:', email);
    if (!username || !email || !password || !confirmPassword) {
      console.log('[Register] 验证失败 - 缺少必填字段');
      Alert.alert('错误', '请填写所有必填字段');
      return;
    }

    if (username.trim().length < 2) {
      Alert.alert('错误', '用户名至少2个字符');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('错误', '请输入有效的邮箱地址');
      return;
    }

    if (password !== confirmPassword) {
      console.log('[Register] 验证失败 - 密码不一致');
      Alert.alert('错误', '两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      console.log('[Register] 验证失败 - 密码长度不足');
      Alert.alert('错误', '密码长度至少6位');
      return;
    }

    setLoading(true);
    try {
      await authService.register({ username: username.trim(), email, password });
      
      console.log('[Register] 注册成功，跳转验证码页面 - 邮箱:', email);
      setLoading(false);
      
      router.push({ pathname: '/verify-email', params: { email, username: username.trim() } });
    } catch (error) {
      console.error('[Register] 注册失败:', error);
      setLoading(false);
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('邮箱')) {
          Alert.alert('注册失败', '该邮箱已被注册');
        } else if (errorMessage.includes('用户名')) {
          Alert.alert('注册失败', '该用户名已被使用');
        } else {
          showErrorAlert('注册失败', errorMessage);
        }
      } else {
        showErrorAlert('注册失败', toErrorMessage(error));
      }
    }
  };

  const handleLogin = () => {
    router.push('/login');
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
  registerButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  registerButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
  },
  registerButtonText: {
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  socialButtonText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  loginContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
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
            <View style={styles.logoContainer}>
              <Ionicons name="flash" size={36} color="#fff" />
            </View>
            <Text style={styles.appTitle}>创建账号</Text>
            <Text style={styles.appSubtitle}>开启你的技能冒险之旅</Text>
          </View>

          {/* 表单 */}
          <View style={styles.formContainer}>
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
                {password ? (showPassword ? password : '●'.repeat(Math.min(password.length, 12))) : '密码'}
              </Text>
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.inputContainer}
              activeOpacity={0.7}
              onPress={() => setActiveFieldId('confirmPassword')}
            >
              <Ionicons name="lock-closed" size={20} color={colors.primary} style={styles.inputIcon} />
              <Text 
                style={[styles.displayText, confirmPassword ? { color: colors.textPrimary } : { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {confirmPassword ? (showConfirmPassword ? confirmPassword : '●'.repeat(Math.min(confirmPassword.length, 12))) : '确认密码'}
              </Text>
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <View style={styles.loadingSpinner} />
              ) : (
                <Text style={styles.registerButtonText}>注册</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 分割线 */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>或者</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 社交注册 */}
          <View style={styles.socialContainer}>
            {[
              { name: 'Google', icon: 'logo-google', color: '#EA4335' },
              { name: 'Apple', icon: 'logo-apple', color: '#ffffff' },
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

          {/* 登录链接 */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              已有账号？
              <Text style={styles.loginLink} onPress={handleLogin}>
                立即登录
              </Text>
            </Text>
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
      <InputDialog
        visible={activeFieldId !== null}
        title={activeField?.title || ''}
        icon={activeField?.icon || 'mail'}
        value={activeField?.value || ''}
        onChangeText={activeField?.onChangeText || (() => {})}
        onDismiss={() => setActiveFieldId(null)}
        placeholder={activeField?.placeholder}
        keyboardType={activeField?.keyboardType}
        secureTextEntry={activeField?.secureTextEntry}
        colors={colors}
      />
      </SafeAreaView>
    );


};

export default RegisterScreen;
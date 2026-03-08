import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, TextInput, Keyboard, Platform, Dimensions, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/utils/constants';
import { authService } from '../src/services/api';
import { saveAuthData } from '../src/utils/auth';
import { showErrorAlert, createKeyboardPositioningListener, measureInputPosition, measureInputPositionByRef, getInputPositioningStyle } from '../src/utils';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputOffset, setInputOffset] = useState(0);
  const [activeInputY, setActiveInputY] = useState(0);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const usernameInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const cleanup = createKeyboardPositioningListener(
      (keyboardH, offset) => {
        setKeyboardHeight(keyboardH);
        setInputOffset(offset);
        setIsKeyboardActive(true);
      },
      () => {
        setKeyboardHeight(0);
        setInputOffset(0);
        setIsKeyboardActive(false);
        // 键盘收起时自动滚动回顶部
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      },
      activeInputY
    );

    return cleanup;
  }, [activeInputY]);

  // 测量输入框位置
  const handleInputLayout = (event: any) => {
    measureInputPosition(event, (yPosition) => {
      setActiveInputY(yPosition);
    });
  };

  // 处理用户名输入框焦点事件
  const handleUsernameInputFocus = () => {
    // 延迟执行，确保键盘已经弹出
    setTimeout(() => {
      measureInputPositionByRef(usernameInputRef, (yPosition) => {
        setActiveInputY(yPosition);
        // 当键盘弹出时，滚动到输入框上方2cm位置
        if (scrollViewRef.current) {
          const scrollOffset = Math.max(0, yPosition - 40); // 进一步减少偏移量，上移约0.5cm
          scrollViewRef.current.scrollTo({ y: scrollOffset, animated: true });
        }
      });
    }, 100);
  };

  // 处理手机号输入框焦点事件
  const handlePhoneInputFocus = () => {
    // 延迟执行，确保键盘已经弹出
    setTimeout(() => {
      measureInputPositionByRef(phoneInputRef, (yPosition) => {
        setActiveInputY(yPosition);
        // 当键盘弹出时，滚动到输入框上方2cm位置
        if (scrollViewRef.current) {
          const scrollOffset = Math.max(0, yPosition - 40); // 进一步减少偏移量，上移约0.5cm
          scrollViewRef.current.scrollTo({ y: scrollOffset, animated: true });
        }
      });
    }, 100);
  };

  // 处理密码输入框焦点事件
  const handlePasswordInputFocus = () => {
    // 延迟执行，确保键盘已经弹出
    setTimeout(() => {
      measureInputPositionByRef(passwordInputRef, (yPosition) => {
        setActiveInputY(yPosition);
        // 当键盘弹出时，滚动到输入框上方2cm位置
        if (scrollViewRef.current) {
          const scrollOffset = Math.max(0, yPosition - 40); // 进一步减少偏移量，上移约0.5cm
          scrollViewRef.current.scrollTo({ y: scrollOffset, animated: true });
        }
      });
    }, 100);
  };

  // 处理确认密码输入框焦点事件
  const handleConfirmPasswordInputFocus = () => {
    // 延迟执行，确保键盘已经弹出
    setTimeout(() => {
      measureInputPositionByRef(confirmPasswordInputRef, (yPosition) => {
        setActiveInputY(yPosition);
        // 当键盘弹出时，滚动到输入框上方2cm位置
        if (scrollViewRef.current) {
          const scrollOffset = Math.max(0, yPosition - 40); // 进一步减少偏移量，上移约0.5cm
          scrollViewRef.current.scrollTo({ y: scrollOffset, animated: true });
        }
      });
    }, 100);
  };

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
        const errorMessage = (error as any).message;
        if (errorMessage.includes('手机号')) {
          Alert.alert('注册失败', '该手机号已被注册');
        } else if (errorMessage.includes('用户名')) {
          Alert.alert('注册失败', '该用户名已被使用');
        } else {
          showErrorAlert('注册失败', errorMessage);
        }
      } else {
        showErrorAlert('注册失败', error as string);
      }
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={[
            styles.scrollContent,
            isKeyboardActive && styles.scrollContentActive
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
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
            <View 
            style={styles.inputContainer}
            onLayout={handleInputLayout}
          >
            <Ionicons name="person" size={20} color={COLORS.PRIMARY} style={styles.inputIcon} />
            <TextInput
              ref={usernameInputRef}
              style={styles.textInput}
              placeholder="用户名"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={handleUsernameInputFocus}
            />
          </View>
          
          <View 
            style={styles.inputContainer}
            onLayout={handleInputLayout}
          >
            <Ionicons name="call" size={20} color={COLORS.PRIMARY} style={styles.inputIcon} />
            <TextInput
              ref={phoneInputRef}
              style={styles.textInput}
              placeholder="手机号"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={handlePhoneInputFocus}
            />
          </View>
          
          <View 
            style={styles.inputContainer}
            onLayout={handleInputLayout}
          >
            <Ionicons name="lock-closed" size={20} color={COLORS.PRIMARY} style={styles.inputIcon} />
            <TextInput
              ref={passwordInputRef}
              style={styles.textInput}
              placeholder="密码"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={handlePasswordInputFocus}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color={COLORS.TEXT_SECONDARY} 
              />
            </TouchableOpacity>
          </View>

          <View 
            style={styles.inputContainer}
            onLayout={handleInputLayout}
          >
            <Ionicons name="lock-closed" size={20} color={COLORS.PRIMARY} style={styles.inputIcon} />
            <TextInput
              ref={confirmPasswordInputRef}
              style={styles.textInput}
              placeholder="确认密码"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={handleConfirmPasswordInputFocus}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off" : "eye"} 
                size={20} 
                color={COLORS.TEXT_SECONDARY} 
              />
            </TouchableOpacity>
          </View>

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
            <Text style={styles.termsLink}>服务条款</Text> 和{' '}
            <Text style={styles.termsLink}>隐私政策</Text>
          </Text>
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
    paddingHorizontal: 20,
    paddingBottom: 0, // 平时底部限制死
    minHeight: Dimensions.get('window').height, // 平时内容高度刚好等于屏幕高度
  },
  scrollContentActive: {
    paddingBottom: 100, // 键盘激活时增加底部内边距
    minHeight: Dimensions.get('window').height + 200, // 键盘激活时确保内容高度超过屏幕高度
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
    backgroundColor: COLORS.PRIMARY,
    opacity: 0.1,
  },
  gradientCircle2: {
    position: 'absolute',
    top: '33%',
    left: -80,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: COLORS.ORANGE,
    opacity: 0.08,
  },
  gradientCircle3: {
    position: 'absolute',
    bottom: 80,
    right: 40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: COLORS.SUCCESS,
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
    shadowColor: COLORS.PRIMARY,
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
    color: COLORS.TEXT_SECONDARY,
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 0,
  },
  passwordToggle: {
    padding: 4,
  },
  registerButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(93,155,250,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 5,
  },
  registerButtonDisabled: {
    backgroundColor: '#2A2A4A',
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
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    color: COLORS.TEXT_SECONDARY,
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
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
  },
  socialButtonText: {
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
  },
  loginContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.PRIMARY,
    fontWeight: '700',
    marginLeft: 4,
  },
  termsText: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 20,
  },
  termsLink: {
    color: COLORS.PRIMARY,
  },
});

export default RegisterScreen;
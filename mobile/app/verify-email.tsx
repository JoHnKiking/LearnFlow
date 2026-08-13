import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { authService } from '../src/services/api';
import { saveAuthData } from '../src/utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../src/utils/storage';

const CODE_LENGTH = 6;

const VerifyEmailScreen = () => {
  const { colors } = useTheme();
  const { email, username } = useLocalSearchParams<{ email: string; username: string }>();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
    backBtn: {
      position: 'absolute' as const, top: 60, left: 20,
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: colors.hairline,
      zIndex: 10,
    },
    title: { color: colors.textPrimary, fontSize: 24, fontWeight: '600', textAlign: 'center' },
    subtitle: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
    emailHighlight: { color: colors.primary, fontWeight: '600' },
    codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 32 },
    codeBox: {
      width: 48, height: 56, borderRadius: 12,
      backgroundColor: colors.surface, borderWidth: 1.5,
      borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
    },
    codeBoxActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
    codeText: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' },
    hiddenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },
    verifyBtn: {
      backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16,
      alignItems: 'center', marginTop: 32, opacity: 1,
    },
    verifyBtnDisabled: { opacity: 0.4 },
    verifyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    resendText: { color: colors.textSecondary, fontSize: 13 },
    resendLink: { color: colors.primary, fontSize: 13, fontWeight: '600' },
    resendDisabled: { color: colors.textTertiary },
  }), [colors]);

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleCodeChange = (text: string, index: number) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (digits.length > 1) {
      // 粘贴多位数
      const newCode = [...code];
      const chars = digits.split('');
      for (let i = 0; i < CODE_LENGTH && i < chars.length; i++) {
        newCode[i] = chars[i];
      }
      setCode(newCode);
      const nextIndex = Math.min(chars.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    const newCode = [...code];
    newCode[index] = digits;
    setCode(newCode);

    // 自动跳转下一个输入框
    if (digits && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) {
      Alert.alert('提示', '请输入完整的6位验证码');
      return;
    }

    setLoading(true);
    try {
      const authResponse = await authService.verifyEmail(email, fullCode);
      await saveAuthData(authResponse);
      await AsyncStorage.setItem(STORAGE_KEYS.IS_NEW_USER, 'true');

      setLoading(false);
      Alert.alert('验证成功', '欢迎加入 LearnFlow！', [
        { text: '开始冒险', onPress: () => router.replace('/onboarding') },
      ]);
    } catch (error: any) {
      setLoading(false);
      const msg = error?.message || '验证失败';
      if (msg.includes('次数过多')) {
        Alert.alert('验证失败', '错误次数过多，请重新发送验证码');
      } else if (msg.includes('已过期')) {
        Alert.alert('验证失败', '验证码错误，请再次验证或重新发送');
      } else {
        Alert.alert('验证失败', msg);
      }
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await authService.resendVerification(email);
      setCountdown(60);
      Alert.alert('已发送', '验证码已重新发送至邮箱');
    } catch (error: any) {
      Alert.alert('发送失败', error?.message || '请稍后再试');
    } finally {
      setResending(false);
    }
  };

  const isComplete = code.every(c => c !== '');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.scrollContent}>
          <Text style={styles.title}>验证邮箱</Text>
          <Text style={styles.subtitle}>
            验证码已发送至{' '}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {/* 6位验证码输入 */}
          <View style={styles.codeRow}>
            {code.map((digit, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={1}
                onPress={() => inputRefs.current[i]?.focus()}
              >
                <View style={[styles.codeBox, digit !== '' && styles.codeBoxActive]}>
                  <Text style={styles.codeText}>{digit}</Text>
                </View>
                <TextInput
                  ref={ref => { inputRefs.current[i] = ref; }}
                  style={styles.hiddenInput}
                  value={digit}
                  onChangeText={text => handleCodeChange(text, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={i === 0}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* 验证按钮 */}
          <TouchableOpacity
            style={[styles.verifyBtn, (!isComplete || loading) && styles.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={!isComplete || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.verifyBtnText}>
              {loading ? '验证中...' : '验证'}
            </Text>
          </TouchableOpacity>

          {/* 重发验证码 */}
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>
              {countdown > 0 ? `${countdown} 秒后可重新发送` : '没收到验证码？'}
            </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={countdown > 0 || resending}
              activeOpacity={0.7}
            >
              <Text style={[styles.resendLink, (countdown > 0 || resending) && styles.resendDisabled]}>
                {resending ? '发送中...' : '重新发送'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyEmailScreen;

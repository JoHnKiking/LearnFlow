import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { authService } from '../src/services/api';
import InputDialog from '../src/components/InputDialog';

const ForgotPasswordScreen = () => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      Alert.alert('提示', '请输入有效的邮箱地址');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setLoading(false);
      Alert.alert('发送成功', '重置验证码已发送至邮箱，请查收', [
        {
          text: '去重置',
          onPress: () => router.push({ pathname: '/reset-password', params: { email: email.trim() } }),
        },
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('发送失败', error.message || '请稍后重试');
    }
  };

  // ---- 当前激活字段的配置 ----
  const activeField = {
    title: '邮箱', icon: 'mail', value: email, onChangeText: setEmail,
    placeholder: '请输入注册邮箱', keyboardType: 'email-address' as any, secureTextEntry: false,
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80 },
    backBtn: {
      width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
      alignItems: 'center', justifyContent: 'center', marginBottom: 32,
    },
    title: { fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
    subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 32, lineHeight: 20 },
    inputContainer: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    inputIcon: { marginRight: 12 },
    displayText: { flex: 1, fontSize: 15, color: colors.textSecondary },
    displayTextFilled: { color: colors.textPrimary },
    submitBtn: {
      height: 52, borderRadius: 14, backgroundColor: colors.primary,
      justifyContent: 'center', alignItems: 'center', marginTop: 8,
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
    },
    submitBtnDisabled: { backgroundColor: colors.border, shadowOpacity: 0 },
    submitBtnText: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>忘记密码</Text>
        <Text style={styles.subtitle}>
          输入注册时使用的邮箱，我们将发送重置验证码
        </Text>

        <TouchableOpacity
          style={styles.inputContainer}
          activeOpacity={0.7}
          onPress={() => setActiveFieldId('email')}
        >
          <Ionicons name="mail" size={20} color={colors.primary} style={styles.inputIcon} />
          <Text
            style={[styles.displayText, email ? styles.displayTextFilled : undefined]}
            numberOfLines={1}
          >
            {email || '请输入注册邮箱'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.submitBtnText}>
            {loading ? '发送中...' : '发送验证码'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <InputDialog
        visible={activeFieldId !== null}
        title={activeField.title}
        icon={activeField.icon}
        value={activeField.value}
        onChangeText={activeField.onChangeText}
        onDismiss={() => setActiveFieldId(null)}
        placeholder={activeField.placeholder}
        keyboardType={activeField.keyboardType}
        secureTextEntry={activeField.secureTextEntry}
        colors={colors}
      />
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

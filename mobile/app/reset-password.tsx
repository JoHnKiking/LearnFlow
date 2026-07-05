import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { authService } from '../src/services/api';
import InputDialog from '../src/components/InputDialog';

const ResetPasswordScreen = () => {
  const { colors } = useTheme();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  const handleSubmit = async () => {
    const email = emailParam;
    if (!email) {
      Alert.alert('错误', '邮箱信息丢失，请返回重新操作');
      return;
    }
    if (!code || code.length !== 6) {
      Alert.alert('提示', '请输入6位验证码');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('提示', '新密码长度至少6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, code, newPassword);
      setLoading(false);
      Alert.alert('重置成功', '密码已重置，请重新登录', [
        { text: '去登录', onPress: () => router.replace('/login') },
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('重置失败', error.message || '请稍后重试');
    }
  };

  const handleResend = async () => {
    const email = emailParam;
    if (!email) return;
    try {
      await authService.forgotPassword(email);
      Alert.alert('已发送', '验证码已重新发送');
    } catch (error: any) {
      Alert.alert('发送失败', error.message || '请稍后重试');
    }
  };

  // ---- 当前激活字段的配置 ----
  const activeField = (() => {
    switch (activeFieldId) {
      case 'code': return { title: '验证码', icon: 'keypad', value: code, onChangeText: setCode, placeholder: '请输入6位验证码', keyboardType: 'number-pad' as any, secureTextEntry: false, maxLength: 6 };
      case 'newPassword': return { title: '新密码', icon: 'lock-closed', value: newPassword, onChangeText: setNewPassword, placeholder: '至少6位新密码', keyboardType: 'default' as any, secureTextEntry: true };
      case 'confirmPassword': return { title: '确认密码', icon: 'lock-closed', value: confirmPassword, onChangeText: setConfirmPassword, placeholder: '再次输入新密码', keyboardType: 'default' as any, secureTextEntry: true };
      default: return null;
    }
  })();

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80 },
    backBtn: {
      width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
      alignItems: 'center', justifyContent: 'center', marginBottom: 32,
    },
    title: { fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
    subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 32, lineHeight: 20 },
    submitBtn: {
      height: 52, borderRadius: 14, backgroundColor: colors.primary,
      justifyContent: 'center', alignItems: 'center', marginTop: 8,
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
    },
    submitBtnDisabled: { backgroundColor: colors.border, shadowOpacity: 0 },
    submitBtnText: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
    inputContainer: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    inputIcon: { marginRight: 12 },
    displayText: { flex: 1, fontSize: 15, color: colors.textSecondary },
    displayTextFilled: { color: colors.textPrimary },
    resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    resendText: { color: colors.textSecondary, fontSize: 13 },
    resendLink: { color: colors.primary, fontSize: 13, fontWeight: '600' },
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

        <Text style={styles.title}>重置密码</Text>
        <Text style={styles.subtitle}>
          验证码已发送至 {emailParam || '邮箱'}，请输入验证码并设置新密码
        </Text>

        <TouchableOpacity
          style={styles.inputContainer}
          activeOpacity={0.7}
          onPress={() => setActiveFieldId('code')}
        >
          <Ionicons name="keypad" size={20} color={colors.primary} style={styles.inputIcon} />
          <Text
            style={[styles.displayText, code ? styles.displayTextFilled : undefined]}
            numberOfLines={1}
          >
            {code || '请输入6位验证码'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.inputContainer}
          activeOpacity={0.7}
          onPress={() => setActiveFieldId('newPassword')}
        >
          <Ionicons name="lock-closed" size={20} color={colors.primary} style={styles.inputIcon} />
          <Text
            style={[styles.displayText, newPassword ? styles.displayTextFilled : undefined]}
            numberOfLines={1}
          >
            {newPassword ? '●'.repeat(Math.min(newPassword.length, 12)) : '至少6位新密码'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.inputContainer}
          activeOpacity={0.7}
          onPress={() => setActiveFieldId('confirmPassword')}
        >
          <Ionicons name="lock-closed" size={20} color={colors.primary} style={styles.inputIcon} />
          <Text
            style={[styles.displayText, confirmPassword ? styles.displayTextFilled : undefined]}
            numberOfLines={1}
          >
            {confirmPassword ? '●'.repeat(Math.min(confirmPassword.length, 12)) : '再次输入新密码'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.submitBtnText}>
            {loading ? '重置中...' : '重置密码'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>没有收到验证码？</Text>
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}> 重新发送</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <InputDialog
        visible={activeFieldId !== null}
        title={activeField?.title || ''}
        icon={activeField?.icon || 'keypad'}
        value={activeField?.value || ''}
        onChangeText={activeField?.onChangeText || (() => {})}
        onDismiss={() => setActiveFieldId(null)}
        placeholder={activeField?.placeholder}
        keyboardType={activeField?.keyboardType}
        secureTextEntry={activeField?.secureTextEntry}
        maxLength={activeField?.maxLength}
        colors={colors}
      />
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

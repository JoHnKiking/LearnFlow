import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, StyleSheet,
  KeyboardAvoidingView, Platform, KeyboardTypeOptions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputDialogProps {
  visible: boolean;
  title: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  onDismiss: () => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  placeholder?: string;
  maxLength?: number;
  colors: {
    background: string;
    surface: string;
    card: string;
    textPrimary: string;
    textSecondary: string;
    primary: string;
    onPrimary: string;
    border: string;
    inputBg: string;
    hairline: string;
  };
}

const InputDialog: React.FC<InputDialogProps> = ({
  visible,
  title,
  icon,
  value,
  onChangeText,
  onDismiss,
  keyboardType,
  secureTextEntry,
  placeholder,
  maxLength,
  colors,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [showValue, setShowValue] = useState(false);
  const isSecure = secureTextEntry && !showValue;

  useEffect(() => {
    if (visible) {
      // 延迟聚焦确保 Modal 动画完成
      const timer = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* 标题 */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

          {/* 输入区域 */}
          <View style={[styles.inputRow, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Ionicons name={icon as any} size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              ref={inputRef}
              style={[styles.textInput, { color: colors.textPrimary }]}
              value={value}
              onChangeText={onChangeText}
              keyboardType={keyboardType}
              secureTextEntry={isSecure}
              placeholder={placeholder}
              placeholderTextColor={colors.textSecondary}
              maxLength={maxLength}
              autoFocus={false}
              onSubmitEditing={onDismiss}
              returnKeyType="done"
            />
            {secureTextEntry && (
              <TouchableOpacity onPress={() => setShowValue(!showValue)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ marginRight: 4 }}>
                <Ionicons name={showValue ? 'eye-off' : 'eye'} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            {value.length > 0 && (
              <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* 完成按钮 */}
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={[styles.doneBtnText, { color: colors.onPrimary }]}>完成</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    width: '88%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    // Android 阴影
    elevation: 10,
    // iOS 阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  doneBtn: {
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default InputDialog;

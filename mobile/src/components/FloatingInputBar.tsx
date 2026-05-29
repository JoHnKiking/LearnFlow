import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  Platform,
  KeyboardEvent,
  StyleSheet,
  InteractionManager,
  KeyboardTypeOptions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ================================================================
// FloatingInputBar
// 键盘上方浮动输入栏（极简版）
//
// 点击页面上的"伪输入框"后，浮层栏出现在键盘上方并自动聚焦。
// 输入内容实时同步到原始字段。点「完成」收起键盘。
// ================================================================

export interface InputFieldConfig {
  id: string;
  label: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  placeholder?: string;
}

interface FloatingInputBarProps {
  fields: InputFieldConfig[];
  activeFieldId: string | null;
  onDismiss: () => void;
  colors: {
    backgroundDark: string;
    background: string;
    primary: string;
    textPrimary: string;
    textSecondary: string;
    borderLight: string;
    border: string;
  };
}

const BAR_BOTTOM_SPACING = 8; // 输入栏与键盘之间的间距

export const FloatingInputBar: React.FC<FloatingInputBarProps> = ({
  fields,
  activeFieldId,
  onDismiss,
  colors,
}) => {
  const inputRef = useRef<TextInput>(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const activeField = fields.find((f) => f.id === activeFieldId);

  // ---- 字段切换或首次挂载时聚焦 ----
  // key={activeFieldId} 确保每次切换都创建新的 TextInput 实例
  // autoFocus 处理首次挂载，InteractionManager 确保动画完成后聚焦
  useEffect(() => {
    if (activeFieldId) {
      InteractionManager.runAfterInteractions(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    }
  }, [activeFieldId]);

  // ---- 键盘动画 ----
  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      // translateY 为负 = 向上移动，减去 BAR_BOTTOM_SPACING 留出间距
      const targetY = -(e.endCoordinates.height + BAR_BOTTOM_SPACING);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: targetY,
          duration: e.duration || 280,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: (e.duration || 280) * 0.5,
          useNativeDriver: true,
        }),
      ]).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e: KeyboardEvent) => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: e.duration || 280,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: (e.duration || 280) * 0.6,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [translateY, opacity]);

  // ---- 收起 ----
  const handleDone = () => {
    onDismiss();
  };

  if (!activeField) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundDark,
          borderTopColor: colors.borderLight,
        },
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {/* 输入行 */}
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.background,
            borderColor: colors.borderLight,
          },
        ]}
      >
        <Ionicons
          name={activeField.icon as any}
          size={18}
          color={colors.primary}
          style={styles.inputIcon}
        />
        <TextInput
          key={activeFieldId}
          ref={inputRef}
          style={[styles.textInput, { color: colors.textPrimary }]}
          value={activeField.value}
          onChangeText={activeField.onChangeText}
          placeholder={activeField.placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={activeField.keyboardType || 'default'}
          secureTextEntry={activeField.secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleDone}
        />
        {activeField.value.length > 0 && (
          <TouchableOpacity
            onPress={() => activeField.onChangeText('')}
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        <View style={styles.doneDivider} />
        <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
          <Text style={[styles.doneText, { color: colors.primary }]}>完成</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  doneDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(128,128,128,0.25)',
    marginHorizontal: 10,
  },
  doneButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  doneText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

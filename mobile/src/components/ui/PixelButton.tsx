import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { PIXEL_COLORS, SPACING, PIXEL_BORDERS } from '../../utils/constants';

/**
 * 像素风格按钮组件属性
 */
interface PixelButtonProps {
  /** 按钮文字 */
  title: string;
  /** 点击事件回调 */
  onPress: () => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 按钮样式变体 */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large';
  /** 是否占满宽度 */
  fullWidth?: boolean;
}

/**
 * 像素风格按钮组件
 * 提供多种颜色变体和尺寸选项，带有复古像素阴影效果
 */
const PixelButton: React.FC<PixelButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
}) => {
  /**
   * 根据变体获取按钮颜色配置
   */
  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: PIXEL_COLORS.PIXEL_DARK_BLUE,
          border: PIXEL_COLORS.PRIMARY,
          shadow: PIXEL_COLORS.PIXEL_PURPLE,
        };
      case 'secondary':
        return {
          bg: PIXEL_COLORS.PIXEL_PURPLE,
          border: PIXEL_COLORS.PIXEL_PINK,
          shadow: PIXEL_COLORS.PIXEL_DARK_BLUE,
        };
      case 'success':
        return {
          bg: PIXEL_COLORS.PIXEL_GREEN,
          border: PIXEL_COLORS.SUCCESS,
          shadow: PIXEL_COLORS.PIXEL_DARK_BLUE,
        };
      case 'warning':
        return {
          bg: PIXEL_COLORS.PIXEL_YELLOW,
          border: PIXEL_COLORS.WARNING,
          shadow: PIXEL_COLORS.PIXEL_ORANGE,
        };
      case 'danger':
        return {
          bg: PIXEL_COLORS.PIXEL_PINK,
          border: PIXEL_COLORS.ERROR,
          shadow: PIXEL_COLORS.PIXEL_DARK_BLUE,
        };
      default:
        return {
          bg: PIXEL_COLORS.PIXEL_DARK_BLUE,
          border: PIXEL_COLORS.PRIMARY,
          shadow: PIXEL_COLORS.PIXEL_PURPLE,
        };
    }
  };

  /**
   * 根据尺寸获取按钮大小配置
   */
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { height: 36, paddingHorizontal: SPACING.MEDIUM };
      case 'medium':
        return { height: 48, paddingHorizontal: SPACING.LARGE };
      case 'large':
        return { height: 60, paddingHorizontal: SPACING.XLARGE };
      default:
        return { height: 48, paddingHorizontal: SPACING.LARGE };
    }
  };

  /**
   * 根据尺寸获取文字大小
   */
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 16;
      case 'large':
        return 20;
      default:
        return 16;
    }
  };

  const colors = getButtonColors();
  const buttonSize = getButtonSize();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? PIXEL_COLORS.PIXEL_GRAY : colors.bg,
          borderColor: disabled ? PIXEL_COLORS.PIXEL_LIGHT_GRAY : colors.border,
          ...buttonSize,
          width: fullWidth ? '100%' : undefined,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
    >
      {/* 像素阴影层 */}
      <View
        style={[
          styles.shadowLayer,
          {
            backgroundColor: disabled ? PIXEL_COLORS.PIXEL_LIGHT_GRAY : colors.shadow,
          },
        ]}
      />
      {/* 按钮文字 */}
      <Text
        style={[
          styles.text,
          {
            fontSize: getTextSize(),
            color: disabled ? PIXEL_COLORS.TEXT_SECONDARY : PIXEL_COLORS.WHITE,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  /** 按钮容器样式 */
  button: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: PIXEL_BORDERS.MEDIUM,
    overflow: 'hidden',
  },
  /** 像素阴影层样式 */
  shadowLayer: {
    position: 'absolute',
    top: -PIXEL_BORDERS.MEDIUM,
    left: -PIXEL_BORDERS.MEDIUM,
    right: -PIXEL_BORDERS.MEDIUM,
    bottom: -PIXEL_BORDERS.MEDIUM,
    zIndex: 0,
  },
  /** 按钮文字样式 */
  text: {
    fontWeight: '800',
    letterSpacing: 1,
    zIndex: 1,
    textTransform: 'uppercase',
  },
});

export default PixelButton;

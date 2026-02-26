import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { PIXEL_COLORS, SPACING, PIXEL_BORDERS } from '../../utils/constants';

interface PixelButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const PixelButton: React.FC<PixelButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
}) => {
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
      <View
        style={[
          styles.shadowLayer,
          {
            backgroundColor: disabled ? PIXEL_COLORS.PIXEL_LIGHT_GRAY : colors.shadow,
          },
        ]}
      />
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
  button: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: PIXEL_BORDERS.MEDIUM,
    overflow: 'hidden',
  },
  shadowLayer: {
    position: 'absolute',
    bottom: -PIXEL_BORDERS.MEDIUM,
    right: -PIXEL_BORDERS.MEDIUM,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 1,
    zIndex: 1,
    textTransform: 'uppercase',
  },
});

export default PixelButton;

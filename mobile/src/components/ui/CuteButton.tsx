import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CUTE_COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/constants';

interface CuteButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const CuteButton: React.FC<CuteButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
}) => {
  const getButtonColor = () => {
    switch (variant) {
      case 'primary':
        return CUTE_COLORS.PINK;
      case 'secondary':
        return CUTE_COLORS.SKY_BLUE;
      case 'success':
        return CUTE_COLORS.MINT;
      case 'warning':
        return CUTE_COLORS.BUTTER_YELLOW;
      case 'danger':
        return CUTE_COLORS.CORAL;
      default:
        return CUTE_COLORS.PINK;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { height: 40, paddingHorizontal: SPACING.MEDIUM };
      case 'medium':
        return { height: 52, paddingHorizontal: SPACING.LARGE };
      case 'large':
        return { height: 64, paddingHorizontal: SPACING.XLARGE };
      default:
        return { height: 52, paddingHorizontal: SPACING.LARGE };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? CUTE_COLORS.GRAY : getButtonColor(),
          ...getButtonSize(),
          width: fullWidth ? '100%' : undefined,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: getTextSize(),
            color: disabled ? CUTE_COLORS.DARK_GRAY : CUTE_COLORS.WHITE,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOWS.SOFT,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default CuteButton;

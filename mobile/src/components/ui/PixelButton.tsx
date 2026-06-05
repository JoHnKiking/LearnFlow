import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface PixelButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const PixelButton: React.FC<PixelButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();

  const getButtonColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: colors.surface,
          border: colors.hairline,
          text: colors.textPrimary,
          iconColor: colors.textPrimary,
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: colors.primary,
          text: colors.primary,
          iconColor: colors.primary,
        };
      default:
        return {
          bg: colors.primary,
          border: colors.primary,
          text: colors.onPrimary,
          iconColor: colors.onPrimary,
        };
    }
  };

  const buttonColors = getButtonColors();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[size],
        {
          backgroundColor: isDisabled ? colors.border : buttonColors.bg,
          borderColor: buttonColors.border,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: variant === 'primary' ? 3 : 1,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={buttonColors.text} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'small' ? 16 : size === 'large' ? 22 : 18}
              color={buttonColors.iconColor}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              styles[`${size}Text` as keyof typeof styles] as TextStyle,
              { color: buttonColors.text },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  text: {
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 17,
  },
  icon: {
    marginRight: 6,
  },
});

export default PixelButton;

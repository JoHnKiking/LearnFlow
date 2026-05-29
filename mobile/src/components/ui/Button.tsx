import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../utils/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = true,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      styles[`button_${variant}`],
      styles[`button_${size}`],
      fullWidth && styles.button_fullWidth,
      disabled && styles.button_disabled,
    ];
    
    return baseStyle.filter(Boolean);
  };

  const getTextStyle = () => {
    return [
      styles.text,
      styles[`text_${variant}`],
      styles[`text_${size}`],
      disabled && styles.text_disabled,
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={getTextStyle()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button_primary: {
    backgroundColor: COLORS.PRIMARY,
  },
  button_secondary: {
    backgroundColor: COLORS.SUCCESS,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  button_small: {
    height: 40,
    paddingHorizontal: SPACING.MEDIUM,
  },
  button_medium: {
    height: 50,
    paddingHorizontal: SPACING.MEDIUM,
  },
  button_large: {
    height: 60,
    paddingHorizontal: SPACING.LARGE,
  },
  button_fullWidth: {
    width: '100%',
  },
  button_disabled: {
    backgroundColor: COLORS.BORDER,
  },
  text: {
    fontWeight: '600',
  },
  text_primary: {
    color: COLORS.WHITE,
  },
  text_secondary: {
    color: COLORS.WHITE,
  },
  text_outline: {
    color: COLORS.PRIMARY,
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 18,
  },
  text_disabled: {
    color: COLORS.TEXT_SECONDARY,
  },
});

export default Button;
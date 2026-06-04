import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface PixelCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'highlight' | 'dark';
}

const PixelCard: React.FC<PixelCardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  const { colors } = useTheme();

  const getCardColors = () => {
    switch (variant) {
      case 'highlight':
        return {
          bg: colors.cardAi,
          border: colors.primary + '30',
        };
      case 'dark':
        return {
          bg: colors.surface,
          border: colors.hairline,
        };
      default:
        return {
          bg: colors.surface,
          border: colors.hairline,
        };
    }
  };

  const cardColors = getCardColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardColors.bg,
          borderColor: cardColors.border,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 3,
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
});

export default PixelCard;

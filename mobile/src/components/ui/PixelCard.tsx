import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { PIXEL_COLORS, PIXEL_BORDERS, SPACING } from '../../utils/constants';

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
  const getCardColors = () => {
    switch (variant) {
      case 'highlight':
        return {
          bg: PIXEL_COLORS.PIXEL_DARK_BLUE,
          border: PIXEL_COLORS.PIXEL_CYAN,
          shadow: PIXEL_COLORS.PIXEL_PURPLE,
        };
      case 'dark':
        return {
          bg: PIXEL_COLORS.BACKGROUND,
          border: PIXEL_COLORS.PIXEL_GRAY,
          shadow: PIXEL_COLORS.BACKGROUND_LIGHT,
        };
      default:
        return {
          bg: PIXEL_COLORS.BACKGROUND_LIGHT,
          border: PIXEL_COLORS.PIXEL_GRAY,
          shadow: PIXEL_COLORS.BACKGROUND,
        };
    }
  };

  const colors = getCardColors();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.shadowLayer,
          {
            backgroundColor: colors.shadow,
          },
        ]}
      />
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    bottom: -PIXEL_BORDERS.MEDIUM,
    right: -PIXEL_BORDERS.MEDIUM,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  card: {
    position: 'relative',
    borderWidth: PIXEL_BORDERS.MEDIUM,
    padding: SPACING.LARGE,
    zIndex: 1,
  },
});

export default PixelCard;

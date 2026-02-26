import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { CUTE_COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/constants';

interface CuteCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  padding?: number;
}

const CuteCard: React.FC<CuteCardProps> = ({
  children,
  style,
  backgroundColor = CUTE_COLORS.WHITE,
  padding = SPACING.LARGE,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          padding,
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
    borderRadius: BORDER_RADIUS.LARGE,
    ...SHADOWS.SOFT,
  },
});

export default CuteCard;

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { PIXEL_COLORS, PIXEL_BORDERS, SPACING } from '../../utils/constants';

/**
 * 像素风格卡片组件属性
 */
interface PixelCardProps {
  /** 卡片内容 */
  children: React.ReactNode;
  /** 自定义样式 */
  style?: ViewStyle;
  /** 卡片样式变体 */
  variant?: 'default' | 'highlight' | 'dark';
}

/**
 * 像素风格卡片组件
 * 提供多种颜色变体，带有复古像素阴影效果
 */
const PixelCard: React.FC<PixelCardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  /**
   * 根据变体获取卡片颜色配置
   */
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
      {/* 像素阴影层 */}
      <View
        style={[
          styles.shadowLayer,
          {
            backgroundColor: colors.shadow,
          },
        ]}
      />
      {/* 卡片主体 */}
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
  /** 容器样式 */
  container: {
    position: 'relative',
  },
  /** 像素阴影层样式 */
  shadowLayer: {
    position: 'absolute',
    bottom: -PIXEL_BORDERS.MEDIUM,
    right: -PIXEL_BORDERS.MEDIUM,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  /** 卡片主体样式 */
  card: {
    position: 'relative',
    borderWidth: PIXEL_BORDERS.MEDIUM,
    padding: SPACING.LARGE,
    zIndex: 1,
  },
});

export default PixelCard;

import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/**
 * 动画复选框组件属性
 */
interface CheckboxProps {
  /** 是否选中 */
  checked: boolean;
  /** 切换选中状态的回调 */
  onToggle: () => void;
  /** 复选框大小 */
  size?: number;
  /** 复选框颜色 */
  color?: string;
}

/**
 * 动画复选框组件
 * 提供自定义样式的复选框，包含SVG对勾
 */
const AnimatedCheckbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  size = 24,
  color = '#80FF00',
}) => {
  return (
    <Pressable onPress={onToggle} style={styles.container}>
      <View style={[styles.box, { width: size * 1.5, height: size * 1.5, borderColor: color }]}>
        {/* 选中时显示SVG对勾 */}
        {checked && (
          <Svg
            width={size * 1.5}
            height={size * 1.5}
            viewBox="0 0 72 97"
            style={styles.checkmark}
          >
            <Path
              d="M28.72 95.673c-6.37.644-11.034-4.445-15.746-8.048-4.947-3.783-8.859-10.482-10.847-16.446-6.689-20.067 18.238-28.312 26.244-9.098.483 1.16 1.961 2.376 1.4 3.5-2.28 4.556-3.675-9.63-4.2-14.697-1.002-9.69-3.335-44.87 6.299-49.688.884-.442 2.82 0 3.849 0 16.149 0 15.046 29.01 15.046 39.89 0 2.38-.318 8.001-1.75 10.148-.723 1.085-2.671 4.421-1.75 3.499 8.01-8.008 18.138-1.516 22.395 6.998 1.282 2.564.948 6.384 1.4 9.098 1.596 9.573-4.291 19.245-14.346 19.245-1.384 0-8.154.838-8.748-.35-.747-1.493 3.261-.722 4.898-1.05"
              strokeWidth="4px"
              stroke={color}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  /** 容器样式 */
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  /** 复选框边框样式 */
  box: {
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  /** 对勾样式 */
  checkmark: {
    position: 'absolute',
  },
});

export default AnimatedCheckbox;

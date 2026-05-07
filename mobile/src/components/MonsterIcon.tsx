import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MONSTER_CONFIG } from '../utils/constants';

/**
 * 怪物类型
 */
type MonsterType = 'lively' | 'calm' | 'rebel';

/**
 * 怪物图标组件属性
 */
interface MonsterIconProps {
  /** 怪物类型 */
  type: MonsterType;
  /** 图标大小 */
  size: number;
}

/**
 * 怪物图标组件
 * 使用绝对定位的嵌套View构建像素风格的怪物图标
 */
const MonsterIcon = ({ type, size }: MonsterIconProps) => {
  const colors = MONSTER_CONFIG.COLORS[type] || MONSTER_CONFIG.COLORS.calm;
  const scale = size / 100;

  return (
    <View style={[styles.monsterIcon, { width: size, height: size }]}>
      {/* 怪物头部 */}
      <View style={[
        styles.monsterHeadIcon,
        {
          width: 44 * scale,
          height: 36 * scale,
          backgroundColor: colors.primary,
          left: 14 * scale,
          top: 20 * scale,
        },
      ]}>
        {/* 左耳朵 */}
        <View style={[
          styles.earIcon,
          {
            width: 8 * scale,
            height: 12 * scale,
            backgroundColor: colors.secondary,
            left: -4 * scale,
            top: 4 * scale,
          },
        ]} />
        {/* 右耳朵 */}
        <View style={[
          styles.earIcon,
          {
            width: 8 * scale,
            height: 12 * scale,
            backgroundColor: colors.secondary,
            right: -4 * scale,
            top: 4 * scale,
          },
        ]} />
        {/* 左眼 */}
        <View style={[
          styles.eyeIcon,
          {
            width: 12 * scale,
            height: 12 * scale,
            backgroundColor: '#FFFFFF',
            left: 4 * scale,
            top: 8 * scale,
          },
        ]}>
          <View style={[
            styles.pupilIcon,
            {
              width: 4 * scale,
              height: 6 * scale,
              backgroundColor: '#1A1A2E',
              left: 4 * scale,
              top: 2 * scale,
            },
          ]} />
        </View>
        {/* 右眼 */}
        <View style={[
          styles.eyeIcon,
          {
            width: 12 * scale,
            height: 12 * scale,
            backgroundColor: '#FFFFFF',
            right: 4 * scale,
            top: 8 * scale,
          },
        ]}>
          <View style={[
            styles.pupilIcon,
            {
              width: 4 * scale,
              height: 6 * scale,
              backgroundColor: '#1A1A2E',
              left: 4 * scale,
              top: 2 * scale,
            },
          ]} />
        </View>
        {/* 嘴巴 */}
        <View style={[
          styles.mouthIcon,
          {
            width: 20 * scale,
            height: 4 * scale,
            backgroundColor: '#1A1A2E',
            left: 12 * scale,
            top: 24 * scale,
          },
        ]} />
      </View>
      {/* 怪物身体 */}
      <View style={[
        styles.bodyIcon,
        {
          width: 36 * scale,
          height: 20 * scale,
          backgroundColor: colors.primary,
          left: 18 * scale,
          top: 56 * scale,
        },
      ]} />
    </View>
  );
};

const styles = StyleSheet.create({
  /** 容器样式 */
  monsterIcon: {
    position: 'relative',
  },
  /** 头部样式 */
  monsterHeadIcon: {
    position: 'absolute',
  },
  /** 耳朵样式 */
  earIcon: {
    position: 'absolute',
  },
  /** 眼睛样式 */
  eyeIcon: {
    position: 'absolute',
  },
  /** 瞳孔样式 */
  pupilIcon: {
    position: 'absolute',
  },
  /** 嘴巴样式 */
  mouthIcon: {
    position: 'absolute',
  },
  /** 身体样式 */
  bodyIcon: {
    position: 'absolute',
  },
});

export default MonsterIcon;

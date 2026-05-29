import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MONSTER_CONFIG } from '../utils/constants';

type MonsterType = 'lively' | 'calm' | 'rebel';

interface MonsterIconProps {
  type: MonsterType;
  size: number;
}

const MonsterIcon = ({ type, size }: MonsterIconProps) => {
  const colors = MONSTER_CONFIG.COLORS[type] || MONSTER_CONFIG.COLORS.calm;
  const scale = size / 100;

  return (
    <View style={[styles.monsterIcon, { width: size, height: size }]}>
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
              backgroundColor: '#0D0D1A',
              left: 4 * scale,
              top: 2 * scale,
            },
          ]} />
        </View>
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
              backgroundColor: '#0D0D1A',
              left: 4 * scale,
              top: 2 * scale,
            },
          ]} />
        </View>
        <View style={[
          styles.mouthIcon,
          {
            width: 20 * scale,
            height: 4 * scale,
            backgroundColor: '#0D0D1A',
            left: 12 * scale,
            top: 24 * scale,
          },
        ]} />
      </View>
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
  monsterIcon: {
    position: 'relative',
  },
  monsterHeadIcon: {
    position: 'absolute',
  },
  earIcon: {
    position: 'absolute',
  },
  eyeIcon: {
    position: 'absolute',
  },
  pupilIcon: {
    position: 'absolute',
  },
  mouthIcon: {
    position: 'absolute',
  },
  bodyIcon: {
    position: 'absolute',
  },
});

export default MonsterIcon;

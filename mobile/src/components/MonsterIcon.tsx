import React from 'react';
import { Image } from 'react-native';

type MonsterType = 'lively' | 'calm' | 'rebel';

interface MonsterIconProps {
  type: MonsterType;
  size: number;
}

const monsterImages: Record<MonsterType, any> = {
  lively: require('../../assets/monster-lively.png'),
  calm: require('../../assets/monster-calm.png'),
  rebel: require('../../assets/monster-rebel.png'),
};

const MonsterIcon = ({ type, size }: MonsterIconProps) => {
  return (
    <Image
      source={monsterImages[type]}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
};

export default MonsterIcon;

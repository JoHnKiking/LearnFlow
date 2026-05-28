import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { MONSTER_CONFIG } from '../utils/constants';

type MonsterType = 'lively' | 'calm' | 'rebel';

interface MonsterIconProps {
  type: MonsterType;
  size: number;
}

/**
 * 像素风格怪兽图标组件
 * 三只怪兽造型各异：
 * - 活力：跳跃姿态 + 展翅 + 大圆眨眼
 * - 沉稳：稳坐 + 豆豆眼 + 呆毛
 * - 叛逆：歪站 + 坏笑眼 + 双角 + 双牙
 */
const MonsterIcon = ({ type, size }: MonsterIconProps) => {
  const colors = MONSTER_CONFIG.COLORS[type] || MONSTER_CONFIG.COLORS.calm;
  const p = colors.primary;
  const s = colors.secondary;
  const h = colors.highlight;
  const scale = size / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {type === 'lively' && <LivelyMonster p={p} s={s} h={h} scale={scale} />}
        {type === 'calm' && <CalmMonster p={p} s={s} h={h} scale={scale} />}
        {type === 'rebel' && <RebelMonster p={p} s={s} h={h} scale={scale} />}
      </Svg>
    </View>
  );
};

// ============================================================
// 活力小怪 — 跳跃 + 展翅 + 大圆眼
// ============================================================
const LivelyMonster = ({ p, s, h, scale }: any) => (
  <>
    {/* 身体 */}
    <Rect x="28" y="38" width="44" height="34" rx="16" fill={p} />
    <Rect x="32" y="34" width="36" height="10" rx="5" fill={h} />
    {/* 翅膀 */}
    <Rect x="18" y="42" width="10" height="18" rx="4" fill={s} />
    <Rect x="22" y="46" width="5" height="10" rx="2" fill={p} />
    <Rect x="68" y="38" width="10" height="20" rx="4" fill={s} />
    <Rect x="66" y="44" width="5" height="10" rx="2" fill={p} />
    {/* 耳朵 */}
    <Rect x="32" y="20" width="6" height="10" rx="2" fill={s} />
    <Rect x="58" y="20" width="6" height="10" rx="2" fill={s} />
    {/* 大圆眼 */}
    <Rect x="32" y="42" width="8" height="8" rx="4" fill="#1A1A2E" />
    <Rect x="34" y="43" width="3" height="3" fill="#FFFFFF" />
    <Rect x="52" y="42" width="8" height="8" rx="4" fill="#1A1A2E" />
    <Rect x="54" y="43" width="3" height="3" fill="#FFFFFF" />
    {/* 大笑嘴 */}
    <Rect x="40" y="54" width="12" height="5" rx="2" fill={s} />
    {/* 腮红 */}
    <Rect x="26" y="48" width="5" height="3" rx="1" fill="#FFB3B3" opacity="0.7" />
    <Rect x="61" y="48" width="5" height="3" rx="1" fill="#FFB3B3" opacity="0.7" />
    {/* 离地脚 */}
    <Rect x="34" y="70" width="8" height="6" rx="2" fill={s} />
    <Rect x="54" y="66" width="8" height="6" rx="2" fill={s} />
  </>
);

// ============================================================
// 沉稳小怪 — 稳坐 + 豆豆眼 + 呆毛
// ============================================================
const CalmMonster = ({ p, s, h, scale }: any) => (
  <>
    {/* 宽身体 */}
    <Rect x="24" y="42" width="52" height="38" rx="18" fill={p} />
    <Rect x="28" y="38" width="44" height="10" rx="5" fill={h} />
    {/* 肚子高光 */}
    <Rect x="34" y="56" width="28" height="12" rx="6" fill={h} opacity="0.4" />
    {/* 呆毛 */}
    <Rect x="44" y="28" width="6" height="10" rx="2" fill={h} />
    {/* 下垂圆耳 */}
    <Rect x="22" y="46" width="6" height="14" rx="3" fill={s} />
    <Rect x="68" y="46" width="6" height="14" rx="3" fill={s} />
    {/* 豆豆眼 */}
    <Rect x="36" y="50" width="5" height="5" rx="2" fill="#1A1A2E" />
    <Rect x="55" y="50" width="5" height="5" rx="2" fill="#1A1A2E" />
    {/* 小嘴 */}
    <Rect x="42" y="60" width="8" height="3" rx="1" fill={s} />
    {/* 腮红 */}
    <Rect x="26" y="56" width="5" height="3" rx="1" fill="#FFB3B3" opacity="0.7" />
    <Rect x="65" y="56" width="5" height="3" rx="1" fill="#FFB3B3" opacity="0.7" />
    {/* 稳坐脚 */}
    <Rect x="32" y="78" width="12" height="8" rx="3" fill={s} />
    <Rect x="52" y="78" width="12" height="8" rx="3" fill={s} />
  </>
);

// ============================================================
// 叛逆小怪 — 歪站 + 坏笑眼 + 双角 + 双牙
// ============================================================
const RebelMonster = ({ p, s, h, scale }: any) => (
  <>
    {/* 身体 */}
    <Rect x="28" y="38" width="44" height="34" rx="16" fill={p} />
    <Rect x="32" y="34" width="36" height="10" rx="5" fill={h} />
    {/* 肚子纹路 */}
    <Rect x="38" y="56" width="6" height="6" rx="2" fill={s} opacity="0.5" />
    <Rect x="48" y="56" width="6" height="6" rx="2" fill={s} opacity="0.5" />
    {/* 双角 */}
    <Rect x="38" y="22" width="5" height="12" rx="1" fill={s} />
    <Rect x="49" y="22" width="5" height="12" rx="1" fill={s} />
    {/* 尖耳 */}
    <Rect x="24" y="44" width="6" height="12" rx="2" fill={s} />
    <Rect x="62" y="44" width="6" height="12" rx="2" fill={s} />
    {/* 正面大圆眼 */}
    <Rect x="32" y="42" width="8" height="8" rx="4" fill="#1A1A2E" />
    <Rect x="34" y="43" width="3" height="3" fill="#FFFFFF" />
    <Rect x="52" y="42" width="8" height="8" rx="4" fill="#1A1A2E" />
    <Rect x="54" y="43" width="3" height="3" fill="#FFFFFF" />
    {/* 小嘴 */}
    <Rect x="42" y="58" width="8" height="3" rx="1" fill={s} />
    {/* 大门牙 */}
    <Rect x="43" y="60" width="4" height="6" rx="1" fill="#FFFFFF" />
    <Rect x="47" y="60" width="4" height="6" rx="1" fill="#FFFFFF" />
    {/* 腮红 */}
    <Rect x="26" y="52" width="5" height="3" rx="1" fill="#FFB3B3" opacity="0.7" />
    <Rect x="61" y="52" width="5" height="3" rx="1" fill="#FFB3B3" opacity="0.7" />
    {/* 歪站脚 */}
    <Rect x="32" y="70" width="8" height="7" rx="2" fill={s} />
    <Rect x="52" y="70" width="8" height="7" rx="2" fill={s} />
  </>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MonsterIcon;

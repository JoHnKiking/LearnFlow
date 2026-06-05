import React from 'react';
import Svg, {
  Circle,
  Ellipse,
  Path,
  G,
} from 'react-native-svg';

type MonsterType = 'lively' | 'calm' | 'rebel';

interface MonsterIconProps {
  type: MonsterType;
  size: number;
}

// ============================================================
// 活力小怪 — 宽猫耳，收窄圆身，圆手
// ============================================================
const LivelyMonster = () => (
  <G>
    {/* 腿部 */}
    <Ellipse cx="34" cy="86" rx="7" ry="6" fill="#E8A090" />
    <Ellipse cx="66" cy="86" rx="7" ry="6" fill="#E8A090" />

    {/* 左臂 + 圆手 */}
    <Path
      d="M24 54 Q12 52 8 60 Q6 66 14 66 Q22 66 26 60"
      fill="#F5C6B8"
    />
    {/* 右臂 + 圆手 */}
    <Path
      d="M76 54 Q88 52 92 60 Q94 66 86 66 Q78 66 74 60"
      fill="#F5C6B8"
    />

    {/* 左猫耳 — 居中，头顶 */}
    <Path
      d="M34 26 Q28 10 26 2 Q34 10 38 22 L48 22 Z"
      fill="#F5C6B8"
    />
    {/* 左猫耳 — 内侧 */}
    <Path
      d="M36 24 Q32 12 31 6 Q36 12 39 22 L44 22 Z"
      fill="#F0AAA0"
    />
    {/* 右猫耳 — 居中，头顶 */}
    <Path
      d="M66 26 Q72 10 74 2 Q66 10 62 22 L52 22 Z"
      fill="#F5C6B8"
    />
    {/* 右猫耳 — 内侧 */}
    <Path
      d="M64 24 Q68 12 69 6 Q64 12 61 22 L56 22 Z"
      fill="#F0AAA0"
    />

    {/* 身体 — 收窄 */}
    <Path
      d="M30 24 C30 24 18 42 18 58 C18 72 28 82 50 82 C72 82 82 72 82 58 C82 42 70 24 70 24 C62 20 38 20 30 24 Z"
      fill="#F5C6B8"
    />

    {/* 左眼白 */}
    <Circle cx="37" cy="49" r="9.5" fill="#FFFFFF" />
    {/* 左瞳孔 */}
    <Circle cx="39.5" cy="49.5" r="5.5" fill="#2D1B0E" />
    {/* 左大高光 */}
    <Circle cx="42" cy="46.5" r="2.8" fill="#FFFFFF" />
    {/* 左小高光 */}
    <Circle cx="37.5" cy="51.5" r="1.3" fill="#FFFFFF" />

    {/* 右眼白 */}
    <Circle cx="63" cy="49" r="9.5" fill="#FFFFFF" />
    {/* 右瞳孔 */}
    <Circle cx="65.5" cy="49.5" r="5.5" fill="#2D1B0E" />
    {/* 右大高光 */}
    <Circle cx="68" cy="46.5" r="2.8" fill="#FFFFFF" />
    {/* 右小高光 */}
    <Circle cx="63.5" cy="51.5" r="1.3" fill="#FFFFFF" />

    {/* 左腮红 */}
    <Ellipse cx="25" cy="60" rx="7" ry="4.5" fill="#F0A090" opacity="0.45" />
    {/* 右腮红 */}
    <Ellipse cx="75" cy="60" rx="7" ry="4.5" fill="#F0A090" opacity="0.45" />

    {/* 嘴巴 — W形微笑 */}
    <Path
      d="M41 62 Q45 67 50 62 Q55 67 59 62"
      fill="none"
      stroke="#2D1B0E"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </G>
);

// ============================================================
// 沉稳小怪 — 天线+侧耳，平头身体
// ============================================================
const CalmMonster = () => (
  <G>
    {/* 腿部 */}
    <Ellipse cx="34" cy="84" rx="8" ry="9" fill="#E87840" />
    <Ellipse cx="66" cy="84" rx="8" ry="9" fill="#E87840" />

    {/* 左臂 */}
    <Path
      d="M20 54 Q10 52 8 60 Q8 66 16 66 Q22 66 24 60"
      fill="#FF9B5E"
    />
    {/* 右臂 */}
    <Path
      d="M80 54 Q90 52 92 60 Q92 66 84 66 Q78 66 76 60"
      fill="#FF9B5E"
    />

    {/* 左天线杆 */}
    <Path d="M38 26 L34 8 L42 8 Z" fill="#FF9B5E" />
    {/* 左天线球 */}
    <Circle cx="38" cy="6" r="5" fill="#FF7A36" />
    {/* 右天线杆 */}
    <Path d="M62 26 L58 8 L66 8 Z" fill="#FF9B5E" />
    {/* 右天线球 */}
    <Circle cx="62" cy="6" r="5" fill="#FF7A36" />

    {/* 左小圆耳 */}
    <Circle cx="16" cy="46" r="9" fill="#FF9B5E" />
    {/* 右小圆耳 */}
    <Circle cx="84" cy="46" r="9" fill="#FF9B5E" />

    {/* 身体 — 平头 */}
    <Path
      d="M28 26 C28 26 22 40 20 54 C18 68 26 80 50 80 C74 80 82 68 80 54 C78 40 72 26 72 26 Z"
      fill="#FF9B5E"
    />

    {/* 左眼白 */}
    <Circle cx="36" cy="48" r="9" fill="#FFFFFF" />
    {/* 左瞳孔 */}
    <Circle cx="39" cy="48.5" r="5.5" fill="#1A1A2E" />
    {/* 左大高光 */}
    <Circle cx="41.5" cy="45" r="2.8" fill="#FFFFFF" />
    {/* 左小高光 */}
    <Circle cx="36.5" cy="51" r="1.3" fill="#FFFFFF" />

    {/* 右眼白 */}
    <Circle cx="64" cy="48" r="9" fill="#FFFFFF" />
    {/* 右瞳孔 */}
    <Circle cx="67" cy="48.5" r="5.5" fill="#1A1A2E" />
    {/* 右大高光 */}
    <Circle cx="69.5" cy="45" r="2.8" fill="#FFFFFF" />
    {/* 右小高光 */}
    <Circle cx="64.5" cy="51" r="1.3" fill="#FFFFFF" />

    {/* 左腮红 */}
    <Ellipse cx="24" cy="58" rx="6" ry="4" fill="#FF7A36" opacity="0.35" />
    {/* 右腮红 */}
    <Ellipse cx="76" cy="58" rx="6" ry="4" fill="#FF7A36" opacity="0.35" />

    {/* 嘴巴 — 简洁短弧 */}
    <Path
      d="M44 62 Q50 67 56 62"
      fill="none"
      stroke="#1A1A2E"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </G>
);

// ============================================================
// 叛逆小怪 — 宽弧恶魔角，收窄圆身，歪嘴+虎牙，触手
// ============================================================
const RebelMonster = () => (
  <G>
    {/* 腿部 */}
    <Ellipse cx="34" cy="86" rx="7" ry="7" fill="#9B85D6" />
    <Ellipse cx="66" cy="86" rx="7" ry="7" fill="#9B85D6" />

    {/* 左触手 — 弯曲伸出 */}
    <Path
      d="M24 52 Q10 44 8 54 Q6 64 20 66 Q26 66 26 58"
      fill="#B8A4E6"
    />
    {/* 右触手 — 弯曲伸出 */}
    <Path
      d="M76 52 Q90 44 92 54 Q94 64 80 66 Q74 66 74 58"
      fill="#B8A4E6"
    />

    {/* 左恶魔角 — 瘦三角形 */}
    <Path
      d="M34 24 L24 4 L40 22 Z"
      fill="#A088D6"
    />
    {/* 右恶魔角 — 瘦三角形 */}
    <Path
      d="M66 24 L76 4 L60 22 Z"
      fill="#A088D6"
    />

    {/* 身体 — 收窄 */}
    <Path
      d="M28 24 C28 24 16 40 16 58 C16 74 28 84 50 84 C72 84 84 74 84 58 C84 40 72 24 72 24 C64 18 36 18 28 24 Z"
      fill="#B8A4E6"
    />

    {/* 左眼白 */}
    <Circle cx="36" cy="48" r="9.5" fill="#FFFFFF" />
    {/* 左瞳孔 */}
    <Circle cx="39" cy="48.5" r="5.5" fill="#1A0A2E" />
    {/* 左大高光 */}
    <Circle cx="41.5" cy="45" r="2.8" fill="#FFFFFF" />
    {/* 左小高光 */}
    <Circle cx="36.5" cy="51" r="1.3" fill="#FFFFFF" />

    {/* 右眼白 */}
    <Circle cx="64" cy="48" r="9.5" fill="#FFFFFF" />
    {/* 右瞳孔 */}
    <Circle cx="67" cy="48.5" r="5.5" fill="#1A0A2E" />
    {/* 右大高光 */}
    <Circle cx="69.5" cy="45" r="2.8" fill="#FFFFFF" />
    {/* 左小高光 */}
    <Circle cx="64.5" cy="51" r="1.3" fill="#FFFFFF" />

    {/* 左腮红 */}
    <Ellipse cx="23" cy="58" rx="6.5" ry="4" fill="#D090C0" opacity="0.4" />
    {/* 右腮红 */}
    <Ellipse cx="77" cy="58" rx="6.5" ry="4" fill="#D090C0" opacity="0.4" />

    {/* 歪嘴 — 左侧高右侧低 + 虎牙 */}
    <Path
      d="M42 58 Q46 62 50 60 Q54 66 60 62"
      fill="none"
      stroke="#1A0A2E"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* 虎牙 — 右侧歪嘴露出 */}
    <Path
      d="M55 60 L56 68 L59 60 Z"
      fill="#FFFFFF"
      stroke="#1A0A2E"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </G>
);

const MonsterIcon = ({ type, size }: MonsterIconProps) => {
  const body = (() => {
    switch (type) {
      case 'lively':
        return <LivelyMonster />;
      case 'calm':
        return <CalmMonster />;
      case 'rebel':
        return <RebelMonster />;
      default:
        return <CalmMonster />;
    }
  })();

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {body}
    </Svg>
  );
};

export default MonsterIcon;

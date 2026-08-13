# LearnFlow 设计规范

> 基于预览设计稿的完整色彩与组件规范。

## 1. 色彩体系

### 1.1 浅色模式（参考图）

整体基调：**暖白底 + 鼠尾草绿卡片 + 温暖米色点缀**

| Token | 色值 | 用途 |
|-------|------|------|
| `background` | `#F5F6F2` | 页面背景（暖白微绿） |
| `canvas` | `#FFFFFF` | 纯白画布 |
| `surface` | `#FFFFFF` | 卡片表面 |
| `cardAi` | `#E4EBE4` | AI/专业技能卡片背景（浅鼠尾草绿） |
| `cardLife` | `#DCE3DC` | 生活技能卡片背景（中鼠尾草绿） |
| `cardLang` | `#E5DDD0` | 语言学习卡片背景（温暖米色） |
| `cardAdd` | `#FAFBF8` | 添加模块卡片背景 |
| `textPrimary` | `#1A1D1C` | 主文字（深墨） |
| `textSecondary` | `#6B756B` | 次文字（灰绿） |
| `textTertiary` | `#9AA39A` | 辅助文字（淡灰绿） |
| `border` | `#D8DDD5` | 边框线 |
| `hairline` | `#E8ECE5` | 发丝边框 |
| `progressFill` | `#8BA892` | 进度条填充（中灰绿） |
| `progressTrack` | `#D5DBD3` | 进度条轨道 |
| `badgeBg` | `#FFFFFF` | 百分比徽章背景 |
| `badgeText` | `#4A5548` | 徽章文字 |
| `badgeBorder` | `#C5CCC2` | 徽章边框 |
| `tipBg` | `#FFFFFF` | 提示卡片背景 |
| `accentGreen` | `#5A7D63` | 绿色强调（成功/完成态） |
| `accentOrange` | `#C49A6C` | 橙色强调（语言类/警告） |
| `decorCircle` | `#C5D0C2` | 装饰圆（角落大圆） |

### 1.2 深色模式（参考图）

整体基调：**深蓝黑底 + 暗紫/暗绿/暗棕分类卡片 + 冷调文字**

| Token | 色值 | 用途 |
|-------|------|------|
| `background` | `#0E1015` | 页面背景（深蓝黑） |
| `canvas` | `#14161C` | 画布底色 |
| `surface` | `#1A1D26` | 卡片表面基础 |
| `cardAi` | `#1C1E2E` | AI/专业技能卡片（暗紫蓝） |
| `cardLife` | `#18231F` | 生活技能卡片（暗墨绿） |
| `cardLang` | `#231E18` | 语言学习卡片（暗棕褐） |
| `cardAdd` | `#161920` | 添加模块卡片背景 |
| `textPrimary` | `#E4E6EC` | 主文字（冷白） |
| `textSecondary` | `#8B9099` | 次文字（冷灰） |
| `textTertiary` | `#5C6270` | 辅助文字（暗灰） |
| `border` | `#2A2E38` | 边框线 |
| `hairline` | `#22262F` | 发丝边框 |
| `progressFillAi` | `#6B7AC0` | AI进度条填充（蓝紫） |
| `progressFillLife` | `#4A8068` | 生活进度条填充（墨绿） |
| `progressFillLang` | `#9A7A50` | 语言进度条填充（棕褐） |
| `progressTrack` | `#282C36` | 进度条轨道 |
| `badgeBg` | `#1A1D26` | 百分比徽章背景 |
| `badgeText` | `#A0AAB8` | 徽章文字 |
| `badgeBorder` | `#3A4050` | 徽章边框 |
| `badgeBorderAi` | `#5A6AAA` | AI徽章边框（蓝紫） |
| `badgeBorderLife` | `#3A7060` | 生活徽章边框（绿） |
| `badgeBorderLang` | `#806840` | 语言徽章边框（棕） |
| `tipBg` | `#1A1D26` | 提示卡片背景 |
| `accentGreen` | `#5AAF78` | 绿色强调 |
| `accentOrange` | `#D4A060` | 橙色强调 |
| `decorCircle` | `#2A2540` | 装饰圆（暗紫） |

### 1.3 品牌色系（全局通用）

| Token | 色值 | 用途 |
|-------|------|------|
| `primary` | `#0a0a0a` | 主色/品牌黑 |
| `onPrimary` | `#ffffff` | 主色上文字 |
| `brandBlue` | `#1456f0` | 品牌蓝 |
| `brandPurple` | `#a855f7` | 品牌紫 |
| `brandCoral` | `#ff5530` | 珊瑚橙 |
| `successText` | `#1ba673` | 成功文字 |
| `error` | `#d45656` | 错误红 |

## 2. 字体排版

| Token | 字号 | 字重 | 行高 | 使用场景 |
|-------|------|------|------|---------|
| `heading-lg` | 32px | 600 | 1.25 | 页面标题"学习地图" |
| `subtitle` | 15px | 400 | 1.5 | 副标题说明 |
| `card-title` | 17px | 600 | 1.4 | 卡片名称（AI产品经理等） |
| `card-subtitle` | 13px | 400 | 1.5 | 卡片副标签（专业技能等） |
| `body-md` | 15px | 400 | 1.5 | 正文/提示文字 |
| `body-sm` | 13px | 400 | 1.5 | 小字/标签 |
| `caption` | 12px | 400 | 1.6 | 极小字/百分比 |
| `button-md` | 14px | 600 | 1.4 | 按钮文字 |

**字体家族**：系统默认 sans-serif（iOS: SF Pro, Android: Roboto）

## 3. 圆角系统

| Token | 值 | 使用场景 |
|-------|-----|---------|
| `xs` | 6px | 标签/徽章 |
| `sm` | 10px | 输入框 |
| `md` | 14px | 卡片内元素 |
| `lg` | 16px | **模块卡片** |
| `xl` | 20px | 大卡片/弹窗 |
| `full` | 9999px | 全圆按钮 |

## 4. 间距系统

| Token | 值 | 用途 |
|-------|-----|-----|
| `xxs` | 4px | 极紧凑 |
| `xs` | 8px | 元素内部间距 |
| `sm` | 12px | 紧凑间距 |
| `md` | 16px | 标准间距 |
| `lg` | 20px | 区块间距 |
| `xl` | 24px | 卡片间距离 |
| `xxl` | 32px | 大区块 |
| `section` | 48px | 区域分隔 |

## 5. 组件规范

### 5.1 模块卡片（核心）

**结构：** 左侧图标区 + 中间信息区 + 右侧百分比徽章 + 底部进度条

```
┌─────────────────────────────┐
│ ┌──┐  标题          ┌────┐ │
│ │icon│  副标签       │42%│ │
│ └──┘               └────┘ │
│ ████████░░░░░░░░░░░░░░░░░ │  ← 进度条
└─────────────────────────────┘
```

- 圆角：`rounded.lg` (16px)
- 内边距：`spacing.md` (16px)
- 图标区：48×48 正方形，圆角 `rounded.sm` (10px)，背景比卡片略深一层
- 百分比徽章：圆角 `rounded.xs` (6px)，内边距 `4px 10px`
- 进度条高度：6px，圆角全圆，轨道透明度30%
- 卡片间距：`spacing.sm` (12px)

### 5.2 添加模块卡片

- 边框：2px dashed `colors.border`
- 背景：`colors.cardAdd`
- 圆角：`rounded.lg` (16px)
- 内部图标圆角正方形 + 文字 + 右箭头

### 5.3 提示卡片（学习提示）

- 背景：`colors.tipBg`
- 圆角：`rounded.md` (14px)
- 内边距：`spacing.md` (16px)
- 左侧带圆形图标（绿色勾/橙色闪电/灰色圆）
- 卡片间距：`spacing.sm` (12px)

### 5.4 按钮

- 主按钮：背景 `colors.primary`，文字 `colors.onPrimary`，圆角 `rounded.full`
- 次按钮：背景 `transparent`，边框 `1px solid colors.border`
- 高度：44px（标准触控区域）

### 5.5 输入框

- 背景：`colors.canvas`
- 边框：`1px solid colors.hairline`
- 圆角：`rounded.sm` (10px)
- 高度：44px
- 聚焦态：边框变为 `colors.brandBlue`

## 6. 阴影系统

| Token | 规则 | 用途 |
|-------|------|------|
| `soft` | `shadow-opacity: 0.04, y: 1px, blur: 3px` | 卡片默认阴影 |
| `medium` | `shadow-opacity: 0.08, y: 4px, blur: 12px` | 弹窗/浮层阴影 |

> 浅色模式使用黑色阴影，深色模式使用 `#000` 低透明度阴影。

## 7. 深色/浅色模式切换

- 支持 light/dark/system 三档
- 切换动画：200ms ease-out
- 所有颜色通过 ThemeContext 统一管理
- 禁止硬编码色值

## 8. 图标规范

- 图标库：`@expo/vector-icons` 的 `Ionicons`
- 尺寸：
  - 卡片图标：24px
  - 导航栏：22px
  - 列表项：18px
  - 提示图标：18px
  - 徽章/装饰：14px

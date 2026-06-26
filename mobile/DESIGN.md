---
# LearnFlow Design Tokens — Machine-Readable
# 所有组件必须通过 {path.token} 引用这些令牌，禁止在组件样式中硬编码色值

colors:
  light:
    background: "#F5EDE0"
    surface: "#FFFFFF"
    cardAi: "#EBE5DC"
    cardLife: "#E2EBE3"
    cardLang: "#EDE3D8"
    cardAdd: "#F8F2EB"
    textPrimary: "#3D3229"
    textSecondary: "#8B7D72"
    textTertiary: "#B0A498"
    border: "#DED3C8"
    borderLight: "#EAE0D6"
    borderDark: "#CDC0B2"
    hairline: "#EAE0D6"
    progressFill: "#7BA67B"
    progressTrack: "#E0D6CA"
    accentGreen: "#5A8F7C"
    accentOrange: "#D4A574"
    decorCircle: "#CDC0B2"
    shadow: "rgba(61,50,41,0.08)"
    primary: "#C77D5A"
    onPrimary: "#FFFFFF"
    warning: "#D4A574"
    success: "#7BA67B"
    error: "#D45656"
    brandPurple: "#A08B8B"
    brandPink: "#D07090"
    planetGlow: "rgba(199,125,90,0.15)"
    starColor: "#D0C8B8"
    glassBg: "rgba(255,255,255,0.70)"

  dark:
    background: "#171717"
    surface: "#292929"
    cardAi: "#2A2420"
    cardLife: "#202A28"
    cardLang: "#2B2422"
    cardAdd: "#222222"
    textPrimary: "#EAE0D8"
    textSecondary: "#9A8E84"
    textTertiary: "#6B6158"
    border: "#3A3A3A"
    borderLight: "#2E2E2E"
    borderDark: "#484848"
    hairline: "#2E2E2E"
    progressFill: "#7AB07A"
    progressTrack: "#3A3A3A"
    accentGreen: "#7AB0A0"
    accentOrange: "#C89070"
    decorCircle: "#363636"
    shadow: "#000000"
    primary: "#D4A574"
    onPrimary: "#1A1510"
    warning: "#C89070"
    success: "#7AB07A"
    error: "#C86A6A"
    brandPurple: "#B892C8"
    brandPink: "#D07090"
    planetGlow: "rgba(212,165,116,0.20)"
    starColor: "#5A5A5A"
    glassBg: "rgba(41,41,41,0.75)"

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  section: 48px

rounded:
  xs: 6px
  sm: 10px
  md: 14px
  lg: 16px
  xl: 20px
  xxl: 24px
  full: 9999px

typography:
  heading:
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.25
  cardTitle:
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  bodySmall:
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.6
  timer:
    fontSize: 56px
    fontWeight: 900
    letterSpacing: 4px

shadow:
  soft: { y: 1px, blur: 3px, opacity: 0.04 }
  medium: { y: 2px, blur: 8px, opacity: 0.06 }
  float: { y: 4px, blur: 16px, opacity: 0.12 }

components:
  moduleCard:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    shadow: "medium"

  primaryButton:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.full}"
    height: 48px
    disabled:
      backgroundColor: "{colors.border}"
      opacity: 0.5

  input:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.md}"
    height: 44px
    focus:
      borderColor: "{colors.primary}"

  modal:
    overlay: "{colors.modalOverlay}"
    cardBg: "{colors.surface}"
    rounded: "{rounded.xxl}"
    padding: "{spacing.md}"
---

# LearnFlow 设计规范

## 设计哲学

**"温暖的星球气泡"** — LearnFlow 的 UI 应该在深色模式下有沉浸的星空气氛，在浅色模式下有干净的暖调阅读体验。卡片像漂浮的气泡，怪兽的三种性格（沉稳粉/活力橙/叛逆紫）渗透在整个视觉系统中。

核心原则：
- **单一品牌强调色**：`primary`（浅: #C77D5A 陶土橙 / 深: #D4A574 暖金）是所有交互行为的唯一视觉锚点
- **三色怪兽系统**：`brandPink`(沉稳)、`accentOrange`(活力)、`brandPurple`(叛逆) 用于怪兽相关 UI
- **气泡悬浮感**：卡片用 medium/float 阴影 + 更大圆角 + hairline 边框
- **对比度保证**：`textPrimary` vs `background` 对比度 ≥ 4.5:1（WCAG AA）
- **令牌唯一来源**：本文档 + ThemeContext.tsx 是 LearnFlow UI 的唯一设计真相来源

---

## 1. 色彩体系

### 规则

1. 所有组件颜色通过 ThemeContext 的 `colors.*` 引用，**禁止**写 `'#xxxxxx'` 或 `'rgba(...)'`。
2. dark/light 模式下每个 token 的语义必须一致。
3. 新品牌色先注册到 ThemeContext 和本文档，再在组件中引用。

### 1.1 浅色模式（暖米白底 + 陶土橙主色）

| Token | 色值 | 用途 |
|-------|------|------|
| `background` | `#F5EDE0` | 页面背景 |
| `surface` | `#FFFFFF` | 卡片表面 |
| `textPrimary` | `#3D3229` | 主文字 |
| `textSecondary` | `#8B7D72` | 次文字 |
| `textTertiary` | `#B0A498` | 辅助文字 |
| `primary` | `#C77D5A` | 强调色（按钮/进度/选中） |
| `onPrimary` | `#FFFFFF` | 强调色上文字 |
| `brandPurple` | `#A08B8B` | 怪兽叛逆色 |
| `brandPink` | `#D07090` | 怪兽沉稳色 |
| `accentOrange` | `#D4A574` | 怪兽活力色/警告色 |
| `accentGreen` | `#5A8F7C` | 绿色强调 |
| `success` | `#7BA67B` | 成功/完成 |
| `error` | `#D45656` | 错误/危险 |
| `warning` | `#D4A574` | 警告 |
| `border` | `#DED3C8` | 边框 |
| `hairline` | `#EAE0D6` | 细边框 |
| `cardAi` | `#EBE5DC` | AI/专业技能卡片 |
| `cardLife` | `#E2EBE3` | 生活技能卡片 |
| `cardLang` | `#EDE3D8` | 语言学习卡片 |
| `planetGlow` | `rgba(199,125,90,0.15)` | 星球发光 |
| `starColor` | `#D0C8B8` | 星点装饰 |
| `glassBg` | `rgba(255,255,255,0.70)` | 玻璃态背景 |

### 1.2 深色模式（暖碳黑底 + 暖金主色）

| Token | 色值 | 用途 |
|-------|------|------|
| `background` | `#171717` | 页面背景 |
| `surface` | `#292929` | 卡片表面 |
| `textPrimary` | `#EAE0D8` | 主文字 |
| `textSecondary` | `#9A8E84` | 次文字 |
| `textTertiary` | `#6B6158` | 辅助文字 |
| `primary` | `#D4A574` | 强调色 |
| `onPrimary` | `#1A1510` | 强调色上文字 |
| `brandPurple` | `#B892C8` | 怪兽叛逆色 |
| `brandPink` | `#D07090` | 怪兽沉稳色 |
| `accentOrange` | `#C89070` | 怪兽活力色/警告色 |
| `accentGreen` | `#7AB0A0` | 绿色强调 |
| `success` | `#7AB07A` | 成功/完成 |
| `error` | `#C86A6A` | 错误/危险 |
| `warning` | `#C89070` | 警告 |
| `border` | `#3A3A3A` | 边框 |
| `hairline` | `#2E2E2E` | 细边框 |
| `cardAi` | `#2A2420` | AI/专业技能卡片 |
| `cardLife` | `#202A28` | 生活技能卡片 |
| `cardLang` | `#2B2422` | 语言学习卡片 |
| `planetGlow` | `rgba(212,165,116,0.20)` | 星球发光 |
| `starColor` | `#5A5A5A` | 星点装饰 |
| `glassBg` | `rgba(41,41,41,0.75)` | 玻璃态背景 |

---

## 2. 字体排版

| Token | 字号 | 字重 | 行高 | 用途 |
|-------|------|------|------|------|
| `heading` | 28px | 600 | 1.25 | 页面标题 |
| `cardTitle` | 17px | 600 | 1.4 | 卡片标题 |
| `body` | 15px | 400 | 1.5 | 正文 |
| `bodySmall` | 13px | 400 | 1.5 | 小字正文 |
| `caption` | 12px | 400 | 1.6 | 说明/标签 |
| `timer` | 56px | 900 | letterSpacing:4px | 番茄钟 |

**规则**：字体家族限定系统默认 sans-serif（SF Pro / Roboto）。不允许写裸 `fontSize: 14`。

---

## 3. 间距系统

| Token | 值 | 用途 |
|-------|-----|------|
| `xs` | 4px | 极紧凑 |
| `sm` | 8px | 元素内紧凑间距 |
| `md` | 16px | 标准间距 |
| `lg` | 24px | 大区块间距 |
| `xl` | 32px | 页面左右边距 |
| `section` | 48px | 区域分隔 |

**规则**：不允许 14px、18px、22px 等魔数。

---

## 4. 圆角系统

| Token | 值 | 用途 |
|-------|-----|------|
| `xs` | 6px | 标签/徽章 |
| `sm` | 10px | 输入框/小面板 |
| `md` | 14px | 卡片内元素 |
| `lg` | 16px | 模块卡片（旧默认） |
| `xl` | 20px | 泡泡卡片（新默认） |
| `xxl` | 24px | 弹窗 |
| `full` | 9999px | 全圆按钮 |

**规则**：卡片统一 `xl`(20px)，弹窗统一 `xxl`(24px)，`full` 仅用于按钮。

---

## 5. 阴影系统

| 级别 | 参数 | 用途 |
|------|------|------|
| soft | y:1px, blur:3px, op:0.04 | 扁平卡片 |
| medium | y:2px, blur:8px, op:0.06 | **默认卡片（泡泡感）** |
| float | y:4px, blur:16px, op:0.12 | 浮层/弹窗 |

> `shadowColor` 浅色用 `rgba(61,50,41,...)` ，深色用 `#000000`。

---

## 6. 组件规范

### 6.1 模块卡片（泡泡卡片）
- 圆角: `rounded.xl`(20px)
- 内边距: `spacing.md`(16px)
- 图标区: 48×48, 圆角 `rounded.sm`(10px)
- 进度条: 高 8px, 全圆角
- 阴影: medium
- 边框: `hairline`, 0.5px

### 6.2 按钮
| 变体 | 背景 | 文字 | 圆角 | 高度 |
|------|------|------|------|------|
| Primary | `primary` | `onPrimary` | `full` | 48px |
| Primary disabled | `border` | op:0.5 | `full` | 48px |
| Secondary | transparent | `textPrimary` | `full` | 48px |

### 6.3 输入框
- 背景: `surface`, 边框: `hairline`, 圆角: `md`(14px), 高: 44px
- 聚焦: 边框变 `primary`

### 6.4 弹窗
- 遮罩: `rgba(0,0,0,0.3)`(浅)/`rgba(0,0,0,0.75)`(深)
- 卡片: `surface`, 圆角 `xxl`(24px), 内边距 `md`(16px)

---

## 7. DO's and DON'Ts

### ✅ DO
- 所有颜色通过 `colors.token` 引用
- 卡片用 `xl`(20px) 圆角 + medium 阴影
- 主按钮用 `full` + 48px 高度
- 间距走令牌系统（4/8/16/24/32）
- dark/light 模式对比度 ≥ 4.5:1
- 新 token 先注册 ThemeContext

### ❌ DON'T
- 禁止组件样式中硬编码色值
- 禁止不在系统中的魔数字号/间距/圆角
- 禁止 textPrimary 与 background 对比度 < 4.5
- 禁止对非交互元素用 primary 色
- 禁止卡片混用多种圆角值

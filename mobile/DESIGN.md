# LearnFlow 设计规范 (Design System)

## 1. 色彩体系

### 1.1 语义色板（全应用通用）

| Token | 深色模式 | 浅色模式 | 用途 |
|-------|---------|---------|------|
| `primary` | `#7B75D8` | `#5A54A0` | 主色/品牌色，按钮/高亮/选中态 |
| `success` | `#4A9840` | `#5A8040` | 成功/完成/绿色元素 |
| `warning` | `#D4A058` | `#C49A60` | 警告/注意/琥珀元素 |
| `error` | `#D05858` | `#C45A5A` | 错误/删除/红色元素 |
| `orange` | `#D4A058` | `#C49A60` | 橙色系（与 warning 相同色值） |
| `purple` | `#7B75D8` | `#5A54A0` | 紫色系（与 primary 相同色值） |
| `pink` | `#D07090` | `#C47088` | 粉色系（怪兽/特殊装饰） |

### 1.2 中性色（背景/表面/文字）

| Token | 深色模式 | 浅色模式 |
|-------|---------|---------|
| `background` | `#0D0D1A` | `#F8F5F0` |
| `backgroundLight` | `#141428` | `#FFFFFF` |
| `surface` | `#111125` | `#FFFFFF` |
| `textPrimary` | `#E8E8F8` | `#2D2D3A` |
| `textSecondary` | `#8A8AA8` | `#6B6B7A` |
| `textTertiary` | `#5A5A78` | `#9B9BAA` |
| `border` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` |

### 1.3 卡片/模块色

卡片背景色遵循**分类色彩体系**，所有预设模块使用语义色，**禁止硬编码自定义色值**：

| 分类 | 色值 token | 色块 | 深色 cardBg | 浅色 cardBg |
|------|-----------|------|------------|------------|
| 专业技能 | `colors.primary` | 🟣 | `rgba(123,117,216,0.10)` | `rgba(90,84,160,0.12)` |
| 生活技能 | `colors.success` | 🟢 | `rgba(74,152,64,0.08)` | `rgba(90,128,64,0.12)` |
| 语言学习 | `colors.orange` | 🟠 | `rgba(212,160,88,0.08)` | `rgba(196,154,96,0.12)` |

**预设模块 → 分类映射：**

| 模块 | 分类 | 使用 color | icon |
|------|------|-----------|------|
| AI产品经理 | 专业技能 | `colors.primary` | `hardware-chip` |
| 编程基础 | 专业技能 | `colors.primary` | `code-slash` |
| 个人理财 | 生活技能 | `colors.success` | `trending-up` |
| 理财入门 | 生活技能 | `colors.success` | `wallet` |
| 理财进阶 | 生活技能 | `colors.success` | `trending-up` |
| 英语沟通 | 语言学习 | `colors.orange` | `globe` |
| 英语学习 | 语言学习 | `colors.orange` | `globe` |
| 四六级过关 | 语言学习 | `colors.orange` | `school` |

### 1.4 自定义模块调色板

当用户创建自定义模块时，按索引轮换使用以下 14 色（深色/浅色各一套）：

**深色模式：**
```
#D05858→flame, #D4A058→sunny, #4EA8B8→water, #6B6BD4→flash,
#E07860→bulb, #88B848→leaf, #9B6BC8→diamond, #58A8B0→earth,
#C87090→heart, #78A8D0→compass, #B8A048→star, #D078D0→sparkles,
#68B068→leaf, #C86848→bonfire
```

**浅色模式：**
```
#C45A5A→flame, #C49A60→sunny, #4A90A0→water, #5A5AB8→flash,
#D46850→bulb, #7AA838→leaf, #8C5CB0→diamond, #4898A0→earth,
#B86080→heart, #6898C0→compass, #A89038→star, #C068C0→sparkles,
#58A058→leaf, #B85838→bonfire
```

## 2. 字体排版

| Token | 字号 | 字重 | 使用场景 |
|-------|------|------|---------|
| 标题 1 | 28 | 800 | 首页问候语 |
| 标题 2 | 26 | 800 | 页面大标题 |
| 标题 3 | 22 | 700 | 弹窗标题/卡片标题 |
| 标题 4 | 18 | 700 | 模块名称/功能区标题 |
| 正文 1 | 16 | 正常 | 正文/说明文字 |
| 正文 2 | 14 | 正常 | 次要描述/提示文字 |
| 小字 1 | 12 | 正常 | 辅助说明/标签/进度文字 |
| 小字 2 | 11 | 正常 | 极简标注/类别标签 |

- 全应用统一字体系列：`Courier`（monospace）
- 备用：系统默认 sans-serif

## 3. 间距系统

| Token | 值 | 使用场景 |
|-------|-----|---------|
| `SPACING.SMALL` | 8 | 元素间紧凑间距 |
| `SPACING.MEDIUM` | 16 | 标准间距/卡片内边距 |
| `SPACING.LARGE` | 24 | 区块间距/页边距 |
| `SPACING.XLARGE` | 32 | 大区块间距 |

## 4. 圆角系统

| Token | 值 | 使用场景 |
|-------|-----|---------|
| `BORDER_RADIUS.SMALL` | 8 | 标签/小元素 |
| `BORDER_RADIUS.MEDIUM` | 12 | 卡片/输入框 |
| `BORDER_RADIUS.LARGE` | 16 | 按钮/大卡片 |
| `BORDER_RADIUS.XLARGE` | 20 | 弹窗/选择卡片 |

## 5. 阴影系统

| Token | 用途 |
|-------|------|
| `SHADOWS.SOFT` | 浅色模式下的轻微浮动 |
| `SHADOWS.MEDIUM` | 按钮/可交互元素的默认阴影 |
| `SHADOWS.STRONG` | 深色模式下按钮发光 + 浅色模式高浮起 |

深色模式按钮阴影使用 `colors.primary` 作为阴影色，浅色模式使用黑色。

## 6. 组件规范

### 6.1 卡片（Card）
- 背景色：`colors.card`
- 圆角：16
- 内边距：16-20
- 深色模式可加 1px `colors.primary + 0.4` 边框
- 浅色模式使用 `colors.border` 边框

### 6.2 按钮（Button）
- 主按钮：`colors.primary` 背景 + 白色文字
- 禁用态：`colors.surface` 背景 + 透明度 0.5
- 深色模式阴影：`colors.primary` + 0.35 透明度
- 浅色模式阴影：黑色 + 0.15 透明度

### 6.3 输入框（Input）
- 背景：`colors.inputBg`
- 边框：`colors.inputBorder`
- 聚焦态：使用模块主题色作为边框色
- 圆角：16

### 6.4 进度条（Progress Bar）
- 背景：深色 `rgba(255,255,255,0.06)` / 浅色 `colors.border`
- 填充：模块主题色
- 高度：8

## 7. 深色/浅色模式切换

- 全局支持 light/dark/system 三档切换
- 切换过渡必须平滑（无闪烁）
- 所有颜色必须通过 `useTheme()` hook 获取
- **禁止在任何地方硬编码色值**（自定义模块调色板除外）

## 8. 图标使用

- 图标库：`@expo/vector-icons` 的 `Ionicons`
- 图标大小规范：
  - 模块卡片图标：22-26
  - 导航栏图标：22-24
  - 列表项图标：18-20
  - 小装饰/徽标：14-16

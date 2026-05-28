# LearnFlow 像素怪兽更新日志

**日期**: 2026-05-24  
**版本范围**: 怪兽模块视觉升级 + 浅色模式适配

---

## 更新功能

### 1. 三只像素小怪兽独立造型
**文件**: `mobile/src/components/MonsterIcon.tsx` — 完全重写

- 从旧版 View 拼接（三只共用同一模板只换色）改为三只**独立 SVG 像素造型**
- 活力橙 `#FF7D00`：跳跃姿态 + 展翅耳朵 + 大圆眼
- 沉稳蓝 `#5D9BFA`：稳坐姿态 + 呆毛 + 豆豆眼
- 叛逆紫 `#A855F7`：歪站姿态 + 双角 + 大门牙
- SVG 像素块坐标精确到 1px，使用 `react-native-svg`

### 2. 怪兽配色更新
**文件**: `mobile/src/utils/constants.ts`

- `MONSTER_CONFIG.COLORS` 每种怪兽新增 `highlight` 属性（亮色高光）
- 叛逆怪兽主色从 `#7B5EA7` 更新为 `#A855F7`（深紫）

### 3. 怪兽选择页接入新组件
**文件**: 
- `mobile/app/monster-selection.tsx` — 移除内联旧版 MonsterIcon，导入新版 SVG 组件
- `mobile/app/module-selection.tsx` — 同上，并且从 `AsyncStorage` 读取用户选择的怪兽类型而非硬编码蓝色

### 4. 怪兽主页完整浅色模式适配
**文件**: `mobile/app/(tabs)/monster.tsx` — 831 行变更

- 导入 `useTheme` + `useMemo`，遵循与 `index.tsx` 一致的模式
- Styles 从模块级静态改为组件内 `useMemo(() => StyleSheet.create({...}), [colors])`
- 全部 12 处硬编码暗色值替换为主题变量：
  - `#1A1A2E` → `colors.background`
  - `#0F1030` → `colors.backgroundDark`
  - `#16213E` → `colors.surface`
  - `#E8E8F0` → `colors.textPrimary`
  - `#8888AA` → `colors.textSecondary`
  - `#555577` → `colors.textTertiary`
  - `#5D9BFA` → `colors.primary`
  - 等
- 按钮文字保持固定白色 `#FFFFFF`（按钮始终蓝色），避免双模式下不可读

### 5. SkillTreeNode 残留代码清理
**文件**: `mobile/src/components/skill-tree/SkillTreeNode.tsx`

- 移除不存在的 `node.links` 引用块（类型定义未包含，导致 TS 编译报错）

### 6. 新增依赖
**文件**: `mobile/package.json`

- 新增 `react-native-svg` — MonsterIcon 的 SVG 渲染引擎

---

## Bug 检查

| 检查项 | 结果 |
|--------|------|
| 前端 TypeScript 编译 | ✅ 0 错误（splash.tsx 预存问题除外） |
| 服务端 TypeScript 编译 | ✅ 0 错误 |
| Metro Web Bundled | ✅ 947 模块编译成功 |
| 怪兽选择页交互 | ✅ 三只独立造型正常展示 |
| 模块选择页怪兽跟随 | ✅ 从 AsyncStorage 读取用户选择 |
| 浅/深色模式切换 | ✅ 怪兽主页容器、卡片、文字、按钮全部跟随主题 |
| 其他页面 | ✅ 无改动 |

### 已知非本次引入问题
- `app/splash.tsx` — `useMemo`/`styles` 未声明（预存，本次未改动）
- `server/package.json` — 残留 `better-sqlite3` 依赖（可手动 `npm uninstall` 清理）

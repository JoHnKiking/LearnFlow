# 项目问题总结

## 一、数据持久化缺口

### 1.1 服务端已就绪但移动端未接入（7 张表无数据写入）

| 表 | 服务端状态 | 缺失 |
|---|---|---|
| `learning_records` | model/路由已就绪 | 学习链接跳转后未记录学习行为 |
| `node_progress` | model/路由已就绪 | 节点完成状态未同步 |
| `study_records` | model/路由已就绪 | 番茄钟学习记录未调用 startLearning/finishLearning |
| `domains` | model/路由已就绪 | 用户选择模块后未创建领域记录 |
| `notes` | model/路由已就绪 | 怪兽页笔记仅存 AsyncStorage，未调用 noteService |
| `rewards` | model/路由已就绪 | 游戏奖励仅本地处理，未写入服务端 |
| `monster_messages` | model/路由已就绪 | 怪兽聊天功能未实现 |

### 1.2 移动端 api.ts 缺少对应 service

`noteService`、`rewardService`、`domainService` 未在 `mobile/src/services/api.ts` 中定义，即使想调用也无接口。

---

## 二、技能树数据流问题

### 2.1 技能树使用本地 mock 数据而非服务端 API

`skill-tree.tsx` 通过 `getSkillTreeByDomain` 读取本地硬编码数据，服务端 `POST /skills/generate` 仅在搜索页被调用。主流程的技能树展示完全绕过了服务端。

### 2.2 技能树页面首次渲染闪烁

`useLocalSearchParams().domain` 首次渲染为 `undefined`，`loadSkillTree` 提前 `setLoading(false)` 导致短暂显示「加载失败」错误态，随后 domain 到达才正确渲染。

---

## 三、体力值逻辑缺陷

### 3.1 上限硬编码

学习弹窗 `DurationModal` 体力上限曾硬编码为 100，沉稳型怪物应为 120。（已修复）

### 3.2 怪兽页不刷新

怪兽 tab 使用 `useEffect([], ...)` 仅首次加载，从学习页返回后体力值不更新。（已修复为 `useFocusEffect`）

### 3.3 弹窗不重读

学习弹窗 `useEffect` 依赖为空数组，每次打开不重新读取体力。（已修复）

---

## 四、小游戏问题

### 4.1 数独无答案显示

数独游戏缺少查看答案功能。（已修复）

### 4.2 Modal 未完全覆盖屏幕

游戏 Modal 底部 tab 栏露出一截。（已修复）

### 4.3 冗余 header

welcome 页面顶部关闭按钮 + 标题与下方内容重复。（已修复）

### 4.4 滚动截断

教程页底部「开始游戏」按钮被截断，无法完全显示。（已修复）

---

## 五、Ionicons 图标名无效

多处使用了 `@expo/vector-icons` Ionicons 不支持的图标名，运行时产生 WARN：

| 文件 | 无效图标名 | 正确图标名 |
|------|-----------|-----------|
| `module-selection.tsx` | `cpu` | `hardware-chip` |
| `module-selection.tsx` | `languages` | `language` |
| `skill-tree.tsx` | `graduation-cap` | `school` |
| `skill-tree.tsx` | `chevron-right` | `chevron-forward` |
| `skill-tree.tsx` | `spinner` | 改用 `ActivityIndicator` 组件 |
| `skill-tree.tsx` | `clock` | `time` |
| `SkillTreeView.tsx` | `graduation-cap` | `school` |
| `SkillTreeView.tsx` | `arrow-right` | `arrow-forward` |
| `SkillTreeView.tsx` | `target` | `locate` |
| `SkillTreeView.tsx` | `clock` | `time` |

---

## 六、TypeScript/代码质量问题

### 6.1 类型错误

- `SkillTreeView.tsx`：`View` 组件使用 `onPress` 属性（应用 `TouchableOpacity`）
- `SkillTreeView.tsx`：`background`/`linear-gradient` 为无效 CSS 属性
- `skill-tree.tsx`：`platformInfo.icon` 类型不匹配，需 `as any` 断言
- `profile.tsx`：`onPress: null` 类型不兼容，`TouchableOpacity` 接受 `undefined` 而非 `null`

### 6.2 未使用变量

- `index.tsx`：`COLORS`、`user`、`isLoggedIn`
- `profile.tsx`：`SPACING`、`BORDER_RADIUS`

---

## 七、配置管理问题

### 7.1 API 地址硬编码

`app.json` 中 `extra.apiBaseUrl` 硬编码 ngrok 地址，本地开发与远程演示切换需手动修改。

### 7.2 环境变量未生效

`.env` 中 `EXPO_PUBLIC_API_URL` 被 `app.json` 的 `extra.apiBaseUrl` 覆盖，优先级混乱。

---

## 八、架构层面问题

### 8.1 过度依赖 AsyncStorage

用户数据、怪物数据、模块选择、笔记等核心数据仅存本地，卸载应用或清除数据即丢失。服务端仅作为认证和体力扣除的辅助。

### 8.2 学习行为无追踪

用户点击学习链接后，无任何学习记录写入服务端。无法统计学习时长、完成节点、学习进度。

### 8.3 游戏奖励无持久化

游戏胜利后的奖励仅在前端展示，未写入 `rewards` 表，无法追踪用户游戏历史。

### 8.4 无全局错误处理

移动端无 ErrorBoundary，服务端无统一错误处理中间件，异常直接暴露给用户或崩溃。
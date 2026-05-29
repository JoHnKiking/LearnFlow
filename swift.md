## 两种运行模式操作流程

### 当前配置链路

```
app.json extra.apiBaseUrl  →  .env EXPO_PUBLIC_API_URL  →  默认 http://localhost:3001/api
      (优先级最高)                  (次优先级)                    (兜底)
```

当前 `app.json` 里硬编码了 ngrok 地址，所以无论 `.env` 怎么改都会被覆盖。

---

### 模式一：远程同事查看（ngrok + tunnel）

**启动步骤：**

```bash
# 终端1：启动 ngrok
ngrok http 3001
# 复制 Forwarding 里的 https 地址，例如 https://xxx.ngrok-free.dev

# 终端2：启动服务端
cd server && npm run dev

# 终端3：启动移动端（--tunnel 让 Expo 通过隧道暴露）
cd mobile && npx expo start --tunnel
```

**配置要求：**

`app.json` 中 `extra.apiBaseUrl` 设为 ngrok 地址：
```json
"extra": {
  "apiBaseUrl": "https://xxx.ngrok-free.dev/api"
}
```

同事用 Expo Go 扫码即可访问。

---

### 模式二：本地快速开发（无 ngrok，无 tunnel）

**启动步骤：**

```bash
# 终端1：启动服务端
cd server && npm run dev

# 终端2：启动移动端（不加 --tunnel，走局域网直连）
cd mobile && npx expo start
```

**配置要求：**

`app.json` 中删除或置空 `extra.apiBaseUrl`，让链路回退到默认 localhost：
```json
"extra": {
  "apiBaseUrl": "",
  "eas": {
    "projectId": "a4114c63-9fd5-43d7-9771-accfb461b82c"
  }
}
```

---

### 模式切换清单

| 切换方向 | `app.json` 改动 | 启动命令变化 |
|---------|----------------|-------------|
| 本地 → 远程 | `apiBaseUrl` 填入 ngrok 地址 | 加 `--tunnel`，多开一个 ngrok 终端 |
| 远程 → 本地 | `apiBaseUrl` 改为 `""` | 去掉 `--tunnel`，关掉 ngrok 终端 |

> `.env` 文件无需改动，因为 `app.json` 的 `extra.apiBaseUrl` 优先级高于它。切换只需改 `app.json` 一个文件，改完重启 Metro（`Ctrl+C` 后重新 `npx expo start`）。
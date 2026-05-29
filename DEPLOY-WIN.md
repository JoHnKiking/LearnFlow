# LearnFlow Windows 本地开发/部署指南

目标环境：全新 Windows 10/11

---

## 一、安装 Node.js 18+

下载安装包：https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi

安装时勾选 **Automatically install the necessary tools**，全部默认下一步。

验证：

```powershell
node -v
npm -v
```

---

## 二、安装 Git

下载安装包：https://git-scm.com/download/win

默认选项安装即可。

```powershell
git --version
```

---

## 三、克隆项目

```powershell
cd C:\
git clone <你的仓库地址> LearnFlow
cd LearnFlow
```

或手动将项目文件夹拷贝到 `C:\LearnFlow`。

---

## 四、安装 MySQL 8.0

### 4.1 下载安装

下载 ZIP 或安装器：https://dev.mysql.com/downloads/mysql/8.0.html

推荐下载 Windows (x86, 64-bit) ZIP Archive，解压到 `C:\mysql`。

### 4.2 初始化并启动

以**管理员身份**打开 PowerShell：

```powershell
cd C:\mysql\bin

# 初始化 data 目录（随机 root 密码）
mysqld --initialize-insecure --console
# --initialize-insecure 表示 root 无密码，方便后续操作

# 安装为 Windows 服务
mysqld --install MySQL

# 启动服务
net start MySQL
```

### 4.3 设置 root 密码

```powershell
mysql -u root
```

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Wzy283537!';
FLUSH PRIVILEGES;
EXIT;
```

> 密码保持与 `.env` 一致：`Wzy283537!`

### 4.4 导入数据库

```powershell
cd C:\LearnFlow\server
mysql -u root -p Wzy283537! < schema.sql
```

> Windows 上 `p` 和密码之间**没有空格**，或输入以下命令后回车再输密码：
> ```powershell
> mysql -u root -p < schema.sql
> ```

验证：

```powershell
mysql -u root -p
```

```sql
USE learnflow;
SHOW TABLES;
EXIT;
```

---

## 五、配置服务端环境变量

复制示例文件并编辑：

```powershell
cd C:\LearnFlow\server
copy .env.example .env
notepad .env
```

修改 `DB_PASSWORD` 为 `Wzy283537!`，其余默认即可：

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Wzy283537!
DB_NAME=learnflow

PORT=3001

JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

LLM_PROVIDER=volcano
LLM_API_KEY=8a91d58b-1ac0-4eb2-8719-e79b56822765
LLM_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
LLM_MODEL=ep-20260222221151-l7tjk
```

---

## 六、安装服务端依赖并启动

```powershell
cd C:\LearnFlow\server
npm install

# 开发模式启动（支持热更新）
npm run dev
```

看到 `Server running on port 3001` 即成功。

验证：

```powershell
curl http://localhost:3001/api/auth/test
```

---

## 七、移动端连接配置

### 方式 A：ngrok 穿透（真机 Expo Go 扫码）

下载 ngrok：https://ngrok.com/download

解压后运行：

```powershell
ngrok http 3001
```

复制 Forwarding 地址（如 `https://xxxx.ngrok-free.app`）。

修改 `C:\LearnFlow\mobile\app.json`：

```json
"extra": {
  "apiBaseUrl": "https://xxxx.ngrok-free.app/api",
  "eas": { "projectId": "a4114c63-9fd5-43d7-9771-accfb461b82c" }
}
```

### 方式 B：局域网 IP（同 WiFi 下手机可直连）

```powershell
ipconfig
```

找到无线局域网适配器的 IPv4 地址（如 `192.168.1.100`）。

修改 `app.json`：

```json
"extra": {
  "apiBaseUrl": "http://192.168.1.100:3001/api"
}
```

> 注意：切换网络后 IP 会变化，需重新修改。推荐用方式 A。

---

## 八、启动移动端（Expo）

```powershell
cd C:\LearnFlow\mobile
npm install
npx expo start --tunnel
```

手机扫描终端二维码即可打开。

---

## 九、打包 Android APK

```powershell
cd C:\LearnFlow\mobile
npx eas build -p android --profile preview
```

生成的可下载链接会显示在终端和 Expo Dashboard 中。

---

## 十、日常操作

| 操作 | 命令 |
|------|------|
| 启动 MySQL | `net start MySQL` |
| 启动服务端 | `cd server && npm run dev` |
| 启动 Expo | `cd mobile && npx expo start --tunnel` |
| 数据库修改后重建 | `mysql -u root -p learnflow < server/schema.sql` |
| 打包 APK | `cd mobile && npx eas build -p android --profile preview` |

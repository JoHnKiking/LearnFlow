# LearnFlow 服务端 Ubuntu 部署指南

目标服务器：`119.31.133.45`（全新 Ubuntu）

---

## 一、SSH 连接服务器

```bash
ssh root@119.31.133.45
```

如使用普通用户，后续命令需加 `sudo`。

---

## 二、安装 Node.js 18+

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v   # 确认 >= 18
npm -v
```

---

## 三、安装 MySQL 8.0

```bash
apt-get update
apt-get install -y mysql-server

# 启动 MySQL
systemctl start mysql
systemctl enable mysql

# 安全初始化（设置 root 密码）
mysql_secure_installation
```

### 3.1 设置 root 密码并认证方式

```bash
mysql -u root
```

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Wzy283537!';
FLUSH PRIVILEGES;
EXIT;
```

> 密码 `Wzy283537!` 与本地 `.env` 保持一致。

### 3.2 导入数据库结构

```bash
mysql -u root -p'Wzy283537!' < /path/to/server/schema.sql
```

`schema.sql` 包含建库 `CREATE DATABASE IF NOT EXISTS learnflow` + 全部表结构，无需手动建库。

---

## 四、安装 PM2（保活进程）

```bash
npm install -g pm2
pm2 startup systemd
```

---

## 五、上传服务端代码

### 方式 A：Git 拉取（推荐）

```bash
cd /opt
git clone <你的仓库地址> learnflow
cd learnflow/server
```

### 方式 B：rsync 从本地上传

```bash
rsync -avz --exclude node_modules --exclude dist \
  /Users/johnkiwu/Documents/github/LearnFlow/server/ \
  root@119.31.133.45:/opt/learnflow/server/
```

---

## 六、配置服务端环境变量

```bash
cd /opt/learnflow/server
cp .env.example .env
nano .env
```

填写以下内容：

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

## 七、安装依赖并构建

```bash
cd /opt/learnflow/server
npm install
npm run build
```

构建产物位于 `dist/`。

---

## 八、用 PM2 启动服务

```bash
pm2 start dist/app.js --name learnflow-server --log-date-format "YYYY-MM-DD HH:mm:ss"
pm2 save
```

验证：

```bash
pm2 status
curl http://localhost:3001/api/auth/test   # 或任意接口
```

---

## 九、开放防火墙端口

```bash
ufw allow 3001/tcp
ufw enable
```

如果是云服务器（如阿里云/腾讯云），还需在**安全组**中放行 3001 端口。

---

## 十、Nginx 反向代理（可选，推荐用于 HTTPS）

```bash
apt-get install -y nginx
```

新增 `/etc/nginx/sites-available/learnflow`：

```nginx
server {
    listen 80;
    server_name 119.31.133.45;

    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/learnflow /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
ufw allow 80/tcp
```

---

## 十一、修改移动端 API 地址

编辑 `/Users/johnkiwu/Documents/github/LearnFlow/mobile/app.json`，将 `extra.apiBaseUrl` 改为：

```json
"extra": {
  "apiBaseUrl": "http://119.31.133.45:3001/api",
  "eas": {
    "projectId": "a4114c63-9fd5-43d7-9771-accfb461b82c"
  }
}
```

若已配置 Nginx 反代，改为：

```json
"apiBaseUrl": "http://119.31.133.45/api"
```

修改后重启 Expo Go 扫描即可生效。打包 APK 则需重新 `eas build`。

---

## 十二、日常运维命令

```bash
pm2 status                    # 查看进程状态
pm2 logs learnflow-server     # 查看日志
pm2 restart learnflow-server  # 重启
pm2 stop learnflow-server     # 停止

# 更新代码后
cd /opt/learnflow/server
git pull
npm install --production
npm run build
pm2 restart learnflow-server

# 查看端口占用
lsof -i :3001
```

---

## 完整流程汇总

```bash
ssh root@119.31.133.45

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs mysql-server nginx git

systemctl start mysql && systemctl enable mysql

mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Wzy283537!'; FLUSH PRIVILEGES;"

mkdir -p /opt/learnflow
cd /opt/learnflow

# 上传代码（选一种）
# rsync -avz --exclude node_modules --exclude dist /Users/johnkiwu/Documents/github/LearnFlow/server/ root@119.31.133.45:/opt/learnflow/server/

cd /opt/learnflow/server
mysql -u root -p'Wzy283537!' < schema.sql
npm install && npm run build

pm2 start dist/app.js --name learnflow-server
pm2 save

ufw allow 3001/tcp && ufw enable
```
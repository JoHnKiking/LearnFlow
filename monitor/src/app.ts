import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { testConnection } from './db';
import { takeSnapshot } from './snapshotService';
import routes from './routes';

// 编译后 dist/app.js → 从 dist/ 目录向上找 .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const PORT = parseInt(process.env.MONITOR_PORT || '3002', 10);
const INTERVAL_MINUTES = parseInt(process.env.SNAPSHOT_INTERVAL_MINUTES || '5', 10);
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

const app = express();

// ==================== 静态文件（看板前端） ====================
// ts-node 运行时从 public/ 读取，编译后从 ../public/ 读取
const publicPath = __filename.includes('dist')
  ? path.join(__dirname, '..', 'public')
  : path.join(__dirname, '..', 'public');
app.use('/', express.static(publicPath));

// ==================== API 路由 ====================
app.use('/', routes);

// ==================== 启动 ====================

async function start() {
  // 1. 测试数据库连接
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error('[Monitor] 数据库连接失败，退出');
    process.exit(1);
  }

  // 2. 立即采集一次快照（不等定时器）
  console.log('[Monitor] 首次采集快照...');
  await takeSnapshot();

  // 3. 启动定时采集
  const timer = setInterval(async () => {
    try {
      await takeSnapshot();
    } catch (err) {
      console.error('[Monitor] 定时采集异常:', err);
    }
  }, INTERVAL_MS);

  // 4. 启动 HTTP 服务
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Monitor] 监控看板已启动 → http://0.0.0.0:${PORT}/dashboard.html`);
    console.log(`[Monitor] 快照采集间隔: ${INTERVAL_MINUTES} 分钟`);
    console.log(`[Monitor] API Key ${process.env.MONITOR_API_KEY ? '已配置' : '未配置（开发模式）'}`);
  });

  // 优雅退出
  const shutdown = () => {
    clearInterval(timer);
    console.log('[Monitor] 已停止');
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();

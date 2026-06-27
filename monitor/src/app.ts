import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { testConnection } from './db';
import { takeSnapshot } from './services/snapshotService';
import dashboardRoutes from './routes/dashboardRoutes';
import userRoutes from './routes/userRoutes';
import contentRoutes from './routes/contentRoutes';
import commerceRoutes from './routes/commerceRoutes';
import opsRoutes from './routes/opsRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const PORT = parseInt(process.env.MONITOR_PORT || '3002', 10);
const INTERVAL_MINUTES = parseInt(process.env.SNAPSHOT_INTERVAL_MINUTES || '5', 10);
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

const app = express();
app.use(express.json());

// 静态文件
const publicPath = path.join(__dirname, '..', 'public');
app.use('/', express.static(publicPath));

// API 路由（6 模块）
app.use('/', dashboardRoutes);
app.use('/', userRoutes);
app.use('/', contentRoutes);
app.use('/', commerceRoutes);
app.use('/', opsRoutes);
app.use('/', adminRoutes);

async function start() {
  const dbOk = await testConnection();
  if (!dbOk) { console.error('[Monitor] DB fail'); process.exit(1); }

  console.log('[Monitor] 首次采集快照...');
  await takeSnapshot();

  const timer = setInterval(async () => {
    try { await takeSnapshot(); } catch (err) { console.error('[Monitor] snap error:', err); }
  }, INTERVAL_MS);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Monitor] 后台系统启动 → http://0.0.0.0:${PORT}/`);
    console.log(`[Monitor] 快照间隔: ${INTERVAL_MINUTES}min`);
  });

  const shutdown = () => { clearInterval(timer); process.exit(0); };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();

import { Router, Request, Response } from 'express';
import { getSnapshots, getLatestSnapshot, ChartRange } from './snapshotService';

const router = Router();

const MONITOR_KEY = process.env.MONITOR_API_KEY || '';

function auth(req: Request, res: Response, next: Function) {
  if (!MONITOR_KEY) return next();
  const key = req.headers['x-monitor-key'] as string || req.query.monitorKey as string;
  if (key === MONITOR_KEY) return next();
  console.warn(`[Monitor] 未授权访问 — IP: ${req.ip}`);
  return res.status(401).json({ error: 'Invalid monitor API key' });
}

router.use(auth);

/**
 * GET /api/snapshots?range=day|week|month|all
 * 返回折线图数据（自动按粒度聚合）
 */
router.get('/api/snapshots', async (req, res) => {
  try {
    const range = (req.query.range as ChartRange) || 'day';
    if (!['day', 'week', 'month', 'all'].includes(range)) {
      return res.status(400).json({ error: 'range must be day | week | month | all' });
    }
    const data = await getSnapshots(range);
    res.json(data);
  } catch (err: any) {
    console.error('[Monitor] 查询快照失败:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/snapshots/latest
 */
router.get('/api/snapshots/latest', async (req, res) => {
  try {
    const data = await getLatestSnapshot();
    if (!data) return res.status(404).json({ error: '暂无快照数据' });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

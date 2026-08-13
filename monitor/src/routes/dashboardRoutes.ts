import { Router } from 'express';
import { getSnapshots, getLatestSnapshot, ChartRange } from '../services/snapshotService';

const router = Router();

router.get('/api/snapshots', async (req, res) => {
  try {
    const range = (req.query.range as ChartRange) || 'day';
    if (!['day', 'week', 'month', 'all'].includes(range)) {
      return res.status(400).json({ error: 'range must be day | week | month | all' });
    }
    res.json(await getSnapshots(range));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/api/snapshots/latest', async (req, res) => {
  try {
    const data = await getLatestSnapshot();
    if (!data) return res.status(404).json({ error: '暂无快照数据' });
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;

import { Router } from 'express';
import { getTomatoConfig, updateTomatoConfig, getAIConfig, updateAIConfig, getGameConfig, updateGameConfig, getPushLogs, createPushLog } from '../services/opsService';

const router = Router();

// 番茄钟
router.get('/api/ops/tomato', async (req, res) => {
  try { res.json(await getTomatoConfig()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});
router.put('/api/ops/tomato', async (req, res) => {
  try { await updateTomatoConfig(req.body); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// AI
router.get('/api/ops/ai', async (req, res) => {
  try { res.json(await getAIConfig()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});
router.put('/api/ops/ai', async (req, res) => {
  try { await updateAIConfig(req.body); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// 游戏化
router.get('/api/ops/game', async (req, res) => {
  try { res.json(await getGameConfig()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});
router.put('/api/ops/game', async (req, res) => {
  try { await updateGameConfig(req.body); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// 推送日志
router.get('/api/ops/push-logs', async (req, res) => {
  try { res.json(await getPushLogs({ page: Number(req.query.page) || 1 })); } catch (err: any) { res.status(500).json({ error: err.message }); }
});
router.post('/api/ops/push-logs', async (req, res) => {
  try { await createPushLog(req.body); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;

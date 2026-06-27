import { Router } from 'express';
import { getUserList, getUserDetail, updateUserStatus, getUserStats } from '../services/userService';

const router = Router();

router.get('/api/users', async (req, res) => {
  try {
    const { search, status, isPro, page, sort } = req.query as any;
    res.json(await getUserList({ search, status, isPro, page: Number(page) || 1, sort }));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/api/users/stats', async (req, res) => {
  try { res.json(await getUserStats()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getUserDetail(Number(req.params.id));
    if (!user) return res.status(404).json({ error: '用户不存在' });
    res.json(user);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/api/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'banned'].includes(status)) return res.status(400).json({ error: '无效状态' });
    await updateUserStatus(Number(req.params.id), status);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;

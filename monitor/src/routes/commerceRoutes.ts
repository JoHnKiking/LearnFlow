import { Router } from 'express';
import { getProUserList, getActivationCodes, generateActivationCode, getCommerceStats } from '../services/commerceService';

const router = Router();

router.get('/api/commerce/stats', async (req, res) => {
  try { res.json(await getCommerceStats()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/api/commerce/pro-users', async (req, res) => {
  try {
    const { search, expiring, page } = req.query as any;
    res.json(await getProUserList({ search, expiring, page: Number(page) || 1 }));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/api/commerce/activation-codes', async (req, res) => {
  try {
    res.json(await getActivationCodes({ status: req.query.status as string, page: Number(req.query.page) || 1 }));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/api/commerce/activation-codes', async (req, res) => {
  try {
    const { planId, count } = req.body;
    if (!planId) return res.status(400).json({ error: 'planId is required' });
    const codes = await generateActivationCode(planId, Number(count) || 1);
    res.json({ success: true, codes });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;

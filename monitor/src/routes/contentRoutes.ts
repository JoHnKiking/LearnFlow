import { Router } from 'express';
import { getDomainList, getSkillTreeList, getMonsterList, getNoteList, getPopularDomainsList } from '../services/contentService';

const router = Router();

router.get('/api/content/domains', async (req, res) => {
  try {
    const { search, type, page } = req.query as any;
    res.json(await getDomainList({ search, type, page: Number(page) || 1 }));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/api/content/skill-trees', async (req, res) => {
  try {
    const { search, page } = req.query as any;
    res.json(await getSkillTreeList({ search, page: Number(page) || 1 }));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/api/content/monsters', async (req, res) => {
  try { res.json(await getMonsterList({ page: Number(req.query.page) || 1 })); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/api/content/notes', async (req, res) => {
  try {
    const { userId, date, page } = req.query as any;
    res.json(await getNoteList({ userId: userId ? Number(userId) : undefined, date, page: Number(page) || 1 }));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/api/content/popular-domains', async (req, res) => {
  try { res.json(await getPopularDomainsList(Number(req.query.limit) || 20)); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;

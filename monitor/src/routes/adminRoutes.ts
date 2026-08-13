import { Router } from 'express';
import { login, verifyToken, getAdminList, createAdmin, updateAdminStatus, changePassword, getAuditLogs, writeLog } from '../services/adminService';

const router = Router();

// 登录（无需鉴权）
router.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
    const result = await login(username, password);
    if (!result) return res.status(401).json({ error: '用户名或密码错误' });
    res.json(result);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// 以下路由需要 token
router.use(async (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: '请先登录' });
  (req as any).adminUser = user;
  next();
});

// 获取当前用户
router.get('/api/admin/me', (req, res) => {
  res.json((req as any).adminUser);
});

// 管理员列表
router.get('/api/admin/users', async (req, res) => {
  try { res.json(await getAdminList()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/api/admin/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
    await createAdmin(username, password, role || 'viewer');
    writeLog((req as any).adminUser.id, (req as any).adminUser.username, 'create', 'admin_users', `创建管理员: ${username}`, req.ip || '');
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/api/admin/users/:id/status', async (req, res) => {
  try {
    await updateAdminStatus(Number(req.params.id), req.body.status ? 1 : 0);
    writeLog((req as any).adminUser.id, (req as any).adminUser.username, 'update', 'admin_users', `更新管理员状态: ${req.params.id}`, req.ip || '');
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/api/admin/users/:id/change-pwd', async (req, res) => {
  try {
    await changePassword(Number(req.params.id), req.body.password);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// 操作日志
router.get('/api/admin/audit-logs', async (req, res) => {
  try { res.json(await getAuditLogs({ page: Number(req.query.page) || 1, action: req.query.action as string })); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;

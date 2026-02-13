import express from 'express';
import { AuthController } from '../controllers/authController';

const router = express.Router();

// 用户登录
router.post('/login', AuthController.login);

// 刷新访问令牌
router.post('/refresh-token', AuthController.refreshToken);

// 验证令牌
router.post('/verify-token', AuthController.verifyToken);

// 用户登出
router.post('/logout', AuthController.logout);

export default router;
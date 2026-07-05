import express from 'express';
import { AuthController } from '../controllers/authController';

const router = express.Router();

// 用户注册
router.post('/register', AuthController.register);

// 邮箱验证
router.post('/verify-email', AuthController.verifyEmail);

// 重新发送验证码
router.post('/resend-verification', AuthController.resendVerification);

// 用户登录
router.post('/login', AuthController.login);

// 刷新访问令牌
router.post('/refresh-token', AuthController.refreshToken);

// 验证令牌
router.post('/verify-token', AuthController.verifyToken);

// 用户登出
router.post('/logout', AuthController.logout);

// 忘记密码
router.post('/forgot-password', AuthController.forgotPassword);

// 重置密码
router.post('/reset-password', AuthController.resetPassword);

export default router;
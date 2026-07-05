import express from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware';

const router = express.Router();

// 公开路由（无需认证）
router.post('/register', AuthController.register);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/verify-token', AuthController.verifyToken);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// 需要认证的路由
router.post('/avatar-upload', authMiddleware, AuthController.uploadAvatar);

export default router;

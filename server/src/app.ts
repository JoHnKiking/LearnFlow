import express from 'express';
import cors from 'cors';
import { skillRoutes, authRoutes } from './routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 请求日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
  
  // 记录请求体（敏感信息如密码会过滤）
  if (req.body && Object.keys(req.body).length > 0) {
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = '***';
    if (logBody.confirmPassword) logBody.confirmPassword = '***';
    console.log(`[${timestamp}] Request Body:`, JSON.stringify(logBody));
  }
  
  // 记录响应时间
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] Response: ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

app.use(cors());
app.use(express.json());

// API路由
app.use('/api/skills', skillRoutes);
app.use('/api/auth', authRoutes);

// 健康检查端点
app.get('/', (req, res) => {
  res.json({ 
    message: 'LearnFlow Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404处理
app.use('*', (req, res) => {
  console.log(`[${new Date().toISOString()}] 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl 
  });
});

// 错误处理中间件
app.use((error: any, req: any, res: any, next: any) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Error:`, error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 LearnFlow Server started at ${new Date().toISOString()}`);
  console.log(`📍 Server is running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});
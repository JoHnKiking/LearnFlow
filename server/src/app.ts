import express from 'express';
import cors from 'cors';
import { skillRoutes, authRoutes } from './routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// 请求日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  
  // 获取客户端真实IP（考虑代理情况）
  const clientIP = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   req.ip ||
                   'unknown';
  
  // 获取用户代理信息
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  // 判断是否为移动设备
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
  const deviceType = isMobile ? '移动设备' : '桌面设备';
  
  // 记录详细连接信息
  console.log(`🌐 [${timestamp}] 新连接 - ${deviceType}`);
  console.log(`   📍 来源IP: ${clientIP}`);
  console.log(`   🔗 请求: ${req.method} ${req.url}`);
  console.log(`   📱 用户代理: ${userAgent.substring(0, 100)}${userAgent.length > 100 ? '...' : ''}`);
  console.log(`   📊 请求头:`, {
    host: req.headers.host,
    origin: req.headers.origin,
    referer: req.headers.referer
  });
  
  // 记录请求体（敏感信息如密码会过滤）
  if (req.body && Object.keys(req.body).length > 0) {
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = '***';
    if (logBody.confirmPassword) logBody.confirmPassword = '***';
    console.log(`   📝 请求体:`, JSON.stringify(logBody));
  }
  
  // 记录响应时间
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`   ✅ 响应: ${res.statusCode} - ${duration}ms`);
    console.log(`   ---`);
  });
  
  next();
});

app.use(cors({
  origin: ['https://heterotrichous-gerty-catadromous.ngrok-free.dev', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 LearnFlow Server started at ${new Date().toISOString()}`);
  console.log(`📍 Server is running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/`);
  console.log(`🌐 External access: http://0.0.0.0:${PORT}/`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});
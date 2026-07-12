/**
 * 「与你」App 后端入口
 * Node.js + Express
 * v1.1 - 加入日志审计、敏感词过滤、错误码标准化、请求日志
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initDatabase } = require('./config/database');
const { initRedis } = require('./config/redis');
const authMiddleware = require('./middleware/auth');
const { logger, requestLogger } = require('./middleware/logger');
const { errorHandler, notFoundHandler, success } = require('./config/errors');

const app = express();
const PORT = process.env.PORT || 3000;

// 注入logger到app locals供路由使用
app.locals.logger = logger;

// 基础中间件
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 速率限制中间件
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '请求过于频繁，请稍后再试', code: 'RATE_LIMITED' },
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '操作过于频繁，请稍后再试', code: 'STRICT_RATE_LIMITED' },
});

// 请求日志中间件（每请求记录）
app.use(requestLogger);

// 健康检查
app.get('/health', (req, res) => {
  res.json(success({ status: 'ok', time: new Date().toISOString() }));
});

// 路由（公开 - 无需认证）- 严格限制登录/注册接口
app.use('/api/v1/user', strictLimiter, require('./routes/user'));

// 路由（需认证）- 常规限制
app.use('/api/v1/partner', authMiddleware, apiLimiter, require('./routes/partner'));
app.use('/api/v1/chat', authMiddleware, apiLimiter, require('./routes/chat'));
app.use('/api/v1/scenarios', authMiddleware, apiLimiter, require('./routes/scenario'));
app.use('/api/v1/training', authMiddleware, apiLimiter, require('./routes/training'));
app.use('/api/v1/growth', authMiddleware, apiLimiter, require('./routes/growth'));
app.use('/api/v1/talent', authMiddleware, apiLimiter, require('./routes/talent'));
app.use('/api/v1/membership', authMiddleware, strictLimiter, require('./routes/membership'));
app.use('/api/v1/compliance', authMiddleware, apiLimiter, require('./routes/compliance'));

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// 启动服务
async function start() {
  try {
    await initDatabase();
    await initRedis();
    
    app.listen(PORT, () => {
      logger.info(`'与你' 后端启动`, { port: PORT, env: process.env.NODE_ENV || 'development' });
    });
  } catch (err) {
    logger.fatal('服务启动失败', { error: err.message });
    process.exit(1);
  }
}

start();

module.exports = app;

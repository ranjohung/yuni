/**
 * 「与你」App 后端入口
 * Node.js + Express
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');
const { initRedis } = require('./config/redis');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 路由（公开）
app.use('/api/v1/user', require('./routes/user'));

// 路由（需认证）
app.use('/api/v1/partner', authMiddleware, require('./routes/partner'));
app.use('/api/v1/chat', authMiddleware, require('./routes/chat'));
app.use('/api/v1/scenarios', authMiddleware, require('./routes/scenario'));
app.use('/api/v1/training', authMiddleware, require('./routes/training'));
app.use('/api/v1/growth', authMiddleware, require('./routes/growth'));
app.use('/api/v1/talent', authMiddleware, require('./routes/talent'));
app.use('/api/v1/membership', authMiddleware, require('./routes/membership'));
app.use('/api/v1/compliance', authMiddleware, require('./routes/compliance'));

// 错误处理
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
    code: err.code || 'INTERNAL_ERROR'
  });
});

// 启动服务
async function start() {
  try {
    await initDatabase();
    console.log('[DB] MySQL 连接成功');
    
    await initRedis();
    console.log('[Redis] 连接成功');
    
    app.listen(PORT, () => {
      console.log(`[Server] 「与你」后端运行在 http://localhost:${PORT}`);
      console.log(`[Server] 环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('[Fatal] 启动失败:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;

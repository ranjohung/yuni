/**
 * 日志审计模块
 * 结构化日志：记录每次请求的关键信息
 */
const fs = require('fs');
const path = require('path');

const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '..', '..', 'logs');

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (e) {
    // 创建目录失败时不阻塞
  }
}

// 日志级别
const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, FATAL: 4 };
const CURRENT_LEVEL = LEVELS[process.env.LOG_LEVEL] || LEVELS.INFO;

function getTimestamp() {
  const now = new Date();
  // ISO 8601 + 毫秒
  return now.toISOString().replace('T', ' ').substring(0, 23);
}

function formatLog(level, msg, meta) {
  const parts = [`[${getTimestamp()}]`, `[${level}]`, msg];
  if (meta) {
    const safe = {};
    for (const [k, v] of Object.entries(meta)) {
      // 避免日志泄露敏感字段
      if (['password', 'token', 'secret', 'key', 'authorization'].includes(k.toLowerCase())) {
        safe[k] = '***';
      } else {
        safe[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
      }
    }
    parts.push(JSON.stringify(safe));
  }
  return parts.join(' ');
}

function writeLog(level, msg, meta) {
  if (LEVELS[level] < CURRENT_LEVEL) return;
  const line = formatLog(level, msg, meta) + '\n';
  
  // 同步写日志（避免异步丢失）
  try {
    const date = new Date().toISOString().substring(0, 10);
    const logFile = path.join(LOG_DIR, `${date}.log`);
    fs.appendFileSync(logFile, line, 'utf-8');
  } catch (e) {
    // 写日志失败不抛异常
    console.error('[Logger] write failed:', e.message);
  }
  
  // 同时输出到控制台
  console.log(line.trim());
}

const logger = {
  debug: (msg, meta) => writeLog('DEBUG', msg, meta),
  info: (msg, meta) => writeLog('INFO', msg, meta),
  warn: (msg, meta) => writeLog('WARN', msg, meta),
  error: (msg, meta) => writeLog('ERROR', msg, meta),
  fatal: (msg, meta) => writeLog('FATAL', msg, meta),
};

// Express中间件：记录每个请求
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.userId || 'guest',
      ip: req.ip || req.connection?.remoteAddress
    });
  });
  next();
}

module.exports = { logger, requestLogger };

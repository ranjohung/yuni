# 后端合规与安全

> 版本：v3.2  
> 适用对象：后端开发团队、运维团队  
> 技术栈：Node.js + Express + MySQL

---

## 1. 数据安全

### 1.1 数据分类与分级

| 数据类型 | 等级 | 处理方式 |
|---------|------|---------|
| 用户手机号 | 敏感 | AES-256加密存储 |
| 身份证号 | 敏感 | AES-256加密存储 |
| 对话内容 | 一般 | 普通存储，脱敏展示 |
| 情绪记录 | 一般 | 普通存储 |
| 好感度数据 | 一般 | 普通存储 |

### 1.2 加密实现

```javascript
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

### 1.3 数据脱敏

```javascript
function maskPhone(phone) {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function maskIdCard(idCard) {
  if (!idCard) return '';
  return idCard.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2');
}
```

---

## 2. 未成年人保护

### 2.1 防沉迷策略

| 年龄段 | 每日使用限制 | 会员限制 | 内容限制 |
|--------|------------|---------|---------|
| <12岁 | 30分钟 | 不可购买 | 仅基础内容 |
| 12-16岁 | 1小时 | 需监护人同意 | 限制部分场景 |
| 16-18岁 | 2小时 | 需监护人同意 | 限制部分场景 |
| ≥18岁 | 无限制 | 正常购买 | 全部内容 |

### 2.2 实名认证流程

```javascript
async function verifyRealName(name, idCard) {
  const encryptedIdCard = encrypt(idCard);
  
  const result = await thirdPartyVerificationAPI({
    name,
    idCard: encryptedIdCard,
  });
  
  if (!result.valid) {
    throw new Error('实名认证失败');
  }
  
  const age = calculateAge(idCard);
  const isMinor = age < 18;
  
  return { isMinor, age, encryptedIdCard };
}

function calculateAge(idCard) {
  const birthDate = idCard.substring(6, 14);
  const birthYear = parseInt(birthDate.substring(0, 4));
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}
```

### 2.3 使用时长监控

```javascript
async function checkUsageLimit(userId) {
  const user = await User.findById(userId);
  
  if (!user.is_minor) return { allowed: true };
  
  const today = new Date().toISOString().split('T')[0];
  const key = `usage:${userId}:${today}`;
  
  const usageSeconds = await redis.get(key);
  const usageMinutes = usageSeconds ? parseInt(usageSeconds) / 60 : 0;
  
  const limits = {
    '<12': 30,
    '12-16': 60,
    '16-18': 120,
  };
  
  let limit = limits['16-18'];
  if (user.age < 12) limit = limits['<12'];
  else if (user.age < 16) limit = limits['12-16'];
  
  if (usageMinutes >= limit) {
    return { allowed: false, message: '今日使用时长已达上限', remainingMinutes: 0 };
  }
  
  return { allowed: true, remainingMinutes: Math.floor(limit - usageMinutes) };
}
```

---

## 3. 隐私保护

### 3.1 用户数据权限

| 操作 | 权限要求 | 说明 |
|------|---------|------|
| 查看对话记录 | 本人 | 需登录验证 |
| 修改个人信息 | 本人 | 需登录验证 |
| 删除账号 | 本人 | 需二次验证 |
| 导出数据 | 本人 | 需申请 |
| 数据匿名分析 | 管理员 | 仅统计用途 |

### 3.2 数据删除流程

```javascript
async function deleteUserAccount(userId) {
  await Promise.all([
    ChatSession.deleteMany({ user_id: userId }),
    Affection.deleteOne({ user_id: userId }),
    EmotionRecord.deleteMany({ user_id: userId }),
    CBTRecord.deleteMany({ user_id: userId }),
    NVCRecord.deleteMany({ user_id: userId }),
    UserSceneProgress.deleteMany({ user_id: userId }),
    UserLearningCard.deleteMany({ user_id: userId }),
    UserMoment.deleteMany({ user_id: userId }),
    User.deleteOne({ _id: userId }),
  ]);
  
  await redis.del(`chat:${userId}:recent`);
  await redis.del(`usage:${userId}:*`);
  
  return { success: true };
}
```

---

## 4. 内容安全

### 4.1 敏感词过滤

```javascript
class ContentFilter {
  constructor() {
    this.sensitiveWords = ['敏感词1', '敏感词2', '敏感词3'];
    this.pattern = new RegExp(this.sensitiveWords.join('|'), 'gi');
  }

  filter(text) {
    return text.replace(this.pattern, '***');
  }

  hasSensitiveContent(text) {
    return this.pattern.test(text);
  }

  async checkContent(text) {
    if (this.hasSensitiveContent(text)) {
      return {
        passed: false,
        reason: '内容包含敏感词',
        filtered: this.filter(text),
      };
    }
    
    const thirdPartyCheck = await thirdPartyContentAPI(text);
    if (!thirdPartyCheck.passed) {
      return {
        passed: false,
        reason: thirdPartyCheck.reason,
        filtered: this.filter(text),
      };
    }
    
    return { passed: true, filtered: text };
  }
}
```

### 4.2 对话安全监控

```javascript
async function monitorChat(userId, content) {
  const filter = new ContentFilter();
  const result = await filter.checkContent(content);
  
  if (!result.passed) {
    await ChatViolation.create({
      user_id: userId,
      content: content,
      violation_type: 'sensitive_content',
      action: 'block',
    });
    
    return { allowed: false, message: '内容包含敏感信息' };
  }
  
  const emotion = await emotionEngine.analyze(userId, content);
  if (emotion.type === 'self_harm' && emotion.score > 80) {
    await ChatViolation.create({
      user_id: userId,
      content: content,
      violation_type: 'self_harm',
      action: 'warn',
    });
    
    return { 
      allowed: true, 
      need_intervention: true,
      message: '检测到负面情绪，请关注心理健康' 
    };
  }
  
  return { allowed: true };
}
```

---

## 5. API安全

### 5.1 认证与授权

```javascript
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'token无效' });
  }
}

function authorize(requiredRole) {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
}
```

### 5.2 请求频率限制

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: '登录尝试次数过多，请稍后再试',
});

const smsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: '验证码发送过于频繁',
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: '请求过于频繁',
});
```

### 5.3 输入验证

```javascript
const Joi = require('joi');

const registerSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
  code: Joi.string().length(6).required(),
  password: Joi.string().min(6).max(30).required(),
});

const messageSchema = Joi.object({
  session_id: Joi.string().required(),
  content: Joi.string().max(1000).required(),
});

function validateSchema(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
}
```

---

## 6. 日志与监控

### 6.1 日志分类

| 类型 | 级别 | 记录内容 |
|------|------|---------|
| 访问日志 | INFO | 请求路径、方法、状态码、耗时 |
| 错误日志 | ERROR | 错误信息、堆栈、请求上下文 |
| 安全日志 | WARN | 登录失败、权限拒绝、限流触发 |
| 业务日志 | INFO | 用户注册、会员购买、场景完成 |

### 6.2 日志实现

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

function logRequest(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
    });
  });
  
  next();
}
```

---

## 7. 数据备份与恢复

### 7.1 备份策略

| 备份类型 | 频率 | 保留时间 | 存储位置 |
|---------|------|---------|---------|
| 全量备份 | 每日凌晨 | 30天 | 云存储 |
| 增量备份 | 每小时 | 7天 | 云存储 |
| 实时备份 | 实时 | 7天 | 异地数据库 |

### 7.2 备份脚本

```javascript
async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `/backup/${timestamp}.sql`;
  
  await exec(`mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${backupPath}`);
  
  await uploadToCloudStorage(backupPath);
  
  await cleanOldBackups(30);
  
  logger.info(`Database backup completed: ${backupPath}`);
}

async function cleanOldBackups(keepDays) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - keepDays);
  
  const backups = await listBackups();
  for (const backup of backups) {
    if (backup.createdAt < cutoffDate) {
      await deleteBackup(backup.path);
    }
  }
}
```

---

## 8. 应急响应

### 8.1 安全事件响应流程

```
检测异常 → 确认事件 → 评估影响 → 隔离威胁 → 修复漏洞 → 恢复服务 → 复盘总结
```

### 8.2 关键指标监控

| 指标 | 阈值 | 告警方式 |
|------|------|---------|
| CPU使用率 | >80% | 邮件 + 钉钉 |
| 内存使用率 | >85% | 邮件 + 钉钉 |
| 请求错误率 | >5% | 邮件 + 钉钉 |
| 登录失败次数 | >10次/分钟 | 邮件 |
| API请求量突增 | >200% | 邮件 + 钉钉 |

### 8.3 告警实现

```javascript
const alerts = {
  highCpu: { threshold: 80, lastAlert: 0 },
  highMemory: { threshold: 85, lastAlert: 0 },
  highErrorRate: { threshold: 5, lastAlert: 0 },
};

async function checkMetrics() {
  const metrics = await collectMetrics();
  
  for (const [key, config] of Object.entries(alerts)) {
    if (metrics[key] > config.threshold) {
      const now = Date.now();
      if (now - config.lastAlert > 3600000) {
        await sendAlert(key, metrics[key]);
        config.lastAlert = now;
      }
    }
  }
}

async function sendAlert(type, value) {
  const message = `【告警】${type} 超过阈值: ${value}%`;
  
  await sendDingTalkMessage(message);
  await sendEmail(message);
  
  logger.error(`Alert triggered: ${type} = ${value}%`);
}
```
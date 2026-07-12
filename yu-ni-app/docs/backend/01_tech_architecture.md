# 后端技术架构

> 版本：v3.2  
> 适用对象：后端开发团队  
> 技术栈：Node.js + Express + MySQL 8.0 + Redis 7.0 + Milvus

---

## 1. 技术选型

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 后端框架 | Node.js + Express | 轻量快速迭代 |
| 数据库 | MySQL 8.0 | 业务数据持久化 |
| 缓存 | Redis 7.0 | Session、热点数据、幂等锁、对话计数 |
| 向量数据库 | Milvus | 长期记忆检索、语义匹配 |
| 对象存储 | 阿里云OSS / 七牛云 | 用户照片、素材、晚安语音 |
| 定时任务 | node-cron | 晚安计划推送、朋友圈生成、每周报告 |
| LLM对话引擎 | DeepSeek + Ollama Qwen2.5:14B | 混合路由，自动降级 |
| TTS语音合成 | Microsoft Azure TTS / 讯飞 | 多音色，文本驱动，情感参数 |
| 实时音视频 | 腾讯云RTC / 声网 | 全双工语音通话 |
| 认证 | JWT | 无状态认证 |

---

## 2. 架构模式

```
┌──────────────────────────────────────────────────────────┐
│                    API网关层                             │
│  认证鉴权 / 速率限制 / 请求日志 / CORS / 统一错误处理     │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                    业务服务层                             │
│  UserService / PartnerService / ChatService              │
│  SceneService / GrowthService / EmotionService          │
│  CBTService / NVCService / MembershipService            │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                    核心引擎层                             │
│  LLM路由引擎 / 数字人引擎 / 模拟引擎 / 好感度引擎        │
│  记忆系统 / 情绪识别引擎 / 融合决策引擎                   │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                    数据访问层                             │
│  MySQL / Redis / Milvus / Object Storage                 │
└──────────────────────────────────────────────────────────┘
```

---

## 3. 项目结构

```
backend/
├── app.js                      # 应用入口
├── config/                     # 配置文件
│   ├── database.js             # 数据库配置
│   ├── redis.js                # Redis配置
│   ├── llm.js                  # LLM配置
│   ├── tts.js                  # TTS配置
│   └── environment.js          # 环境变量
├── middleware/                 # 中间件
│   ├── auth.js                 # 认证鉴权
│   ├── rateLimit.js            # 速率限制
│   ├── errorHandler.js         # 错误处理
│   ├── logger.js               # 请求日志
│   └── ageRestriction.js       # 年龄限制
├── routes/                     # 路由
│   ├── auth.js                 # 用户认证
│   ├── partner.js              # 伴侣管理
│   ├── chat.js                 # 对话服务
│   ├── scene.js                # 模拟训练
│   ├── growth.js               # 成长系统
│   ├── affection.js            # 好感度
│   ├── emotion.js              # 情绪识别
│   ├── cbt.js                  # CBT服务
│   ├── nvc.js                  # NVC服务
│   ├── moments.js              # 朋友圈
│   ├── membership.js           # 会员服务
│   ├── nightly.js              # 晚安计划
│   └── timetravel.js           # 时空穿梭
├── services/                   # 业务服务
│   ├── UserService.js          # 用户服务
│   ├── PartnerService.js       # 伴侣服务
│   ├── ChatService.js          # 对话服务
│   ├── SceneService.js         # 场景服务
│   ├── GrowthService.js        # 成长服务
│   ├── AffectionService.js     # 好感度服务
│   ├── EmotionService.js       # 情绪服务
│   ├── CBTService.js           # CBT服务
│   ├── NVCService.js           # NVC服务
│   ├── MomentsService.js       # 朋友圈服务
│   ├── MembershipService.js    # 会员服务
│   ├── NightlyService.js       # 晚安计划服务
│   └── TimeTravelService.js    # 时空穿梭服务
├── engines/                    # 核心引擎
│   ├── LLMProxy.js             # LLM路由引擎
│   ├── DigitalHumanEngine.js   # 数字人引擎
│   ├── SimulationEngine.js     # 模拟引擎
│   ├── AffectionEngine.js      # 好感度引擎
│   ├── MemoryEngine.js         # 记忆引擎
│   ├── EmotionEngine.js        # 情绪识别引擎
│   └── DecisionEngine.js       # 融合决策引擎
├── models/                     # 数据模型
│   ├── User.js                 # 用户模型
│   ├── CompanionConfig.js      # 伴侣配置模型
│   ├── Affection.js            # 好感度模型
│   ├── ChatSession.js          # 对话会话模型
│   ├── SocialScene.js          # 社交场景模型
│   ├── EmotionRecord.js        # 情绪记录模型
│   ├── CBTRecord.js            # CBT记录模型
│   └── NVCRecord.js            # NVC记录模型
├── utils/                      # 工具类
│   ├── jwt.js                  # JWT工具
│   ├── validator.js            # 数据校验
│   ├── idCard.js               # 身份证校验
│   ├── ageCalculator.js        # 年龄计算
│   └── maskData.js             # 数据脱敏
├── jobs/                       # 定时任务
│   ├── nightlyGreeting.js      # 晚安问候
│   ├── momentsGenerator.js     # 朋友圈生成
│   ├── weeklyReport.js         # 每周报告
│   └── cleanup.js              # 数据清理
├── sockets/                    # WebSocket
│   ├── chatSocket.js           # 对话WebSocket
│   └── voiceSocket.js          # 语音通话WebSocket
└── tests/                      # 测试
    ├── unit/                   # 单元测试
    └── integration/            # 集成测试
```

---

## 4. 环境配置

### 4.1 开发环境

```bash
# .env.development
PORT=3000
NODE_ENV=development

# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_NAME=yuni_dev
DB_USER=root
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# LLM
DEEPSEEK_API_KEY=your_deepseek_key
OLLAMA_BASE_URL=http://localhost:11434

# TTS
AZURE_TTS_KEY=your_azure_key
AZURE_TTS_REGION=eastasia

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### 4.2 生产环境

```bash
# .env.production
PORT=3000
NODE_ENV=production

# 数据库（使用云数据库）
DB_HOST=your-db-host.mysql.rds.aliyuncs.com
DB_PORT=3306
DB_NAME=yuni_prod
DB_USER=prod_user
DB_PASSWORD=prod_password

# Redis（使用云Redis）
REDIS_HOST=your-redis-host.redis.rds.aliyuncs.com
REDIS_PORT=6379
REDIS_PASSWORD=prod_redis_password

# 其他配置类似开发环境，但使用生产密钥
```

---

## 5. API网关中间件

### 5.1 认证鉴权

```javascript
const jwt = require('jsonwebtoken');

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未授权访问' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: '无效的token' });
  }
}
```

### 5.2 速率限制

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: '登录失败次数过多，请稍后再试' },
});
```

### 5.3 统一错误处理

```javascript
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';
  
  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
}
```
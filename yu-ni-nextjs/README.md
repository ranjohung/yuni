# 与你 - AI社交模拟训练平台

AI驱动的数字人社交模拟训练平台，帮助用户提升社交能力和情绪管理能力。

## 🎯 项目概述

"与你"是一款基于人工智能的社交模拟训练平台，旨在通过AI伴侣对话和场景模拟训练，帮助用户提升社交技巧、情绪管理能力和心理健康水平。

## ✨ 核心功能

### 1. AI伴侣系统
- 创建专属AI伴侣，支持MBTI 16种性格类型选择
- 自定义伴侣名称和关系设定（朋友/恋人/家人/同事）
- 智能对话互动，基于性格特点进行回应
- 好感度系统，记录互动成长轨迹

### 2. 社交模拟训练
- 多阶段场景训练（初级/中级/高级）
- 基于真实社交场景的模拟练习
- 五维度能力评估（同理心、表达能力、倾听技巧、自信程度、应对策略）
- 学习卡片记录，巩固训练成果

### 3. 情绪管理
- CBT（认知行为疗法）记录工具
- NVC（非暴力沟通）记录工具
- 情绪分析引擎，实时分析用户情绪状态
- 树洞模式，安全倾诉空间

### 4. 成长中心
- 能力雷达图，可视化展示能力分布
- 训练历史记录，追踪成长轨迹
- 每周报告，总结训练成果

### 5. 每日签到
- 连续签到奖励机制
- 签到积分兑换好感度

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 3
- **图标**: Lucide React
- **表单**: React Hook Form

### 后端
- **数据库**: SQLite (开发) / MySQL (生产)
- **ORM**: Prisma 6
- **认证**: NextAuth.js 4
- **加密**: bcryptjs

### AI引擎
- **情绪分析**: 规则匹配 + BERT模拟
- **决策引擎**: 多维度加权决策
- **好感度系统**: 行为驱动的积分计算
- **LLM代理**: DeepSeek API + Ollama本地部署

## 📁 项目结构

```
yu-ni-nextjs/
├── src/
│   ├── app/                      # 应用页面
│   │   ├── (auth)/login/         # 登录/注册页面
│   │   ├── (main)/               # 主应用布局
│   │   │   ├── partner/          # 伴侣相关页面
│   │   │   │   ├── chat/         # 聊天页面
│   │   │   │   ├── create-partner/ # 创建伴侣页面
│   │   │   │   └── page.tsx      # 伴侣主页
│   │   │   ├── simulation/       # 模拟训练页面
│   │   │   ├── growth/           # 成长中心页面
│   │   │   ├── profile/          # 个人中心页面
│   │   │   └── layout.tsx        # 底部导航布局
│   │   ├── api/                  # API路由
│   │   │   ├── auth/[...nextauth] # 认证API
│   │   │   ├── register/         # 注册API
│   │   │   └── user/me/          # 用户信息API
│   │   ├── layout.tsx            # 根布局
│   │   └── page.tsx              # 首页
│   ├── components/               # 通用组件
│   │   ├── chat-bubble/          # 聊天气泡组件
│   │   ├── checkin-button/       # 签到按钮组件
│   │   ├── emotion-radar/        # 情绪雷达图组件
│   │   ├── progress-bar/         # 进度条组件
│   │   └── SessionProvider.tsx   # 会话提供者
│   ├── lib/                      # 工具库
│   │   ├── auth.ts               # 认证配置
│   │   ├── llm.ts                # LLM代理
│   │   ├── prisma.ts             # Prisma客户端
│   │   ├── redis.ts              # Redis缓存
│   │   ├── tts.ts                # 语音合成
│   │   └── utils.ts              # 工具函数
│   ├── server/                   # 服务端逻辑
│   │   ├── actions/              # Server Actions
│   │   │   ├── chat.ts           # 聊天操作
│   │   │   ├── checkin.ts        # 签到操作
│   │   │   ├── cbt.ts            # CBT记录操作
│   │   │   ├── growth.ts         # 成长数据操作
│   │   │   ├── nvc.ts            # NVC记录操作
│   │   │   ├── partner.ts        # 伴侣操作
│   │   │   ├── training.ts       # 训练操作
│   │   │   └── user.ts           # 用户操作
│   │   └── engines/              # AI引擎
│   │       ├── affection.ts      # 好感度引擎
│   │       ├── decision.ts       # 决策引擎
│   │       └── emotion.ts        # 情绪分析引擎
│   └── types/                    # 类型定义
│       └── next-auth.d.ts        # NextAuth扩展类型
├── prisma/                       # Prisma配置
│   ├── schema.prisma             # 数据库模型
│   ├── seed.ts                   # 初始化数据
│   └── migrations/               # 数据库迁移
├── public/                       # 静态资源
├── .env                          # 环境变量
├── next.config.mjs               # Next.js配置
├── tailwind.config.ts            # Tailwind配置
└── package.json                  # 依赖配置
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.17.0
- npm >= 9.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd yu-ni-nextjs
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

创建 `.env` 文件并配置：
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# 可选：DeepSeek API配置
DEEPSEEK_API_KEY="your-deepseek-api-key"

# 可选：Ollama本地部署地址
OLLAMA_BASE_URL="http://localhost:11434"
```

4. **初始化数据库**
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000 即可使用。

### 测试账号
- 手机号: `11111111111`
- 密码: `123456`

## 📊 数据库模型

### 核心模型

| 模型 | 说明 | 关键字段 |
|------|------|----------|
| User | 用户信息 | id, phone, password, nickname |
| Partner | AI伴侣 | userId, name, coreType(MBTI), extroversion, feeling |
| Affection | 好感度 | userId, score, level |
| ChatSession | 聊天会话 | userId, messages, sessionType |
| SocialScene | 训练场景 | sceneName, difficulty, stage |
| TrainingRecord | 训练记录 | userId, sceneId, score, dimensions |
| CbtRecord | CBT记录 | situation, automaticThought, emotion |
| NvcRecord | NVC记录 | observation, feeling, need, request |
| CheckIn | 签到记录 | userId, checkInDate, streakCount |
| EmotionRecord | 情绪记录 | userId, emotionType, emotionScore |

## 🔌 API接口

### 认证接口
- `POST /api/register` - 用户注册
- `POST /api/auth/signin` - 用户登录
- `GET /api/user/me` - 获取当前用户信息

### Server Actions
- `sendMessage(userId, message)` - 发送消息
- `createPartner(userId, data)` - 创建伴侣
- `checkIn(userId)` - 签到
- `submitTrainingAnswer(userId, sceneId, answer)` - 提交训练答案
- `createCbtRecord(userId, data)` - 创建CBT记录
- `createNvcRecord(userId, data)` - 创建NVC记录

## 🧠 AI引擎

### 情绪分析引擎 (EmotionEngine)
基于关键词匹配分析用户情绪类型：
- `neutral` - 中性
- `positive` - 积极
- `negative` - 消极
- `high_negative` - 高度消极（触发树洞模式）
- `recovery` - 恢复中

### 决策引擎 (DecisionEngine)
根据情绪分析结果决定回应策略：
- `treehole` - 树洞模式
- `suggestion` - 建议模式
- `mixed` - 混合模式
- `force_treehole` - 强制树洞模式

### 好感度引擎 (AffectionEngine)
根据用户行为计算好感度变化：
- `daily_login` - 每日登录 +5
- `chat_message` - 聊天消息 +1（每日上限20次）
- `voice_call` - 语音通话 +5/分钟
- `gift` - 送礼物 +礼物值
- `scene_completion` - 完成场景 +评分相关

## 🔒 安全特性

- JWT会话管理
- 密码bcrypt加密存储
- 路由保护中间件
- 输入验证
- XSS防护
- CSRF防护

## 📝 Git提交规范

```
feat: 新增功能
fix: 修复Bug
docs: 更新文档
style: 代码风格调整
refactor: 重构代码
test: 添加测试
chore: 构建/工具更新
```

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请联系开发团队。

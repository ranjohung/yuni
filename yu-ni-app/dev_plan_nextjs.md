# 「与你」Next.js 全栈开发计划 v1.1

> 技术栈：Next.js 14 (App Router) + Prisma ORM + NextAuth.js + SQLite/MySQL + TailwindCSS + shadcn/ui
> 部署：Vercel / 自有服务器
> 移动端方案：Web + PWA（可安装到手机桌面）
> 总排期：14周 | 版本：v1.1 | 更新日期：2026-07-07

---

## 一、项目概述

### 1.1 产品定位
「与你」是一款AI驱动的数字人社交模拟训练平台，通过高拟真数字人实时互动，结合认知行为疗法（CBT）、依恋理论、非暴力沟通（NVC）等心理学框架，为用户提供零压力的社交场景模拟训练与情感陪伴。

### 1.2 一句话价值主张
**“先和TA练一遍，再去面对真实世界。”**

### 1.3 目标用户
| 用户画像 | 典型特征 | 核心需求 |
|----------|----------|----------|
| 社交焦虑人群（18-35岁） | 害怕社交、缺乏练习对象 | 零压力社交训练 |
| 职场新人（22-28岁） | 面试、汇报、向上沟通紧张 | 职场场景模拟 |
| 情感需求人群 | 孤独、寻求陪伴 | 情感支持与陪伴 |
| Z世代女性（18-28岁） | 为情绪价值付费意愿高 | 养成系体验 |

### 1.4 技术目标
| 指标 | 目标值 |
|------|--------|
| MVP上线周期 | 14周 |
| 平台支持 | Web + PWA（iOS/Android可安装） |
| AI推理响应时间 | < 3秒（流式输出） |
| 并发承载 | 10万 DAU |
| Lighthouse评分 | ≥90分 |

---

## 二、技术架构

### 2.1 技术选型总表

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 框架 | Next.js 14 (App Router) | 全栈框架，App Router模式 |
| ORM | Prisma | 类型安全的数据库操作 |
| 认证 | NextAuth.js | 认证授权，支持OAuth/凭证 |
| 数据库 | SQLite（开发）/ MySQL 8.0+（生产） | 业务数据持久化 |
| 缓存 | Redis 7.0 | Session、热点数据、对话计数 |
| LLM | DeepSeek + Ollama Qwen2.5:14B | 混合路由引擎 |
| TTS | Microsoft Azure TTS | 多音色、情感参数 |
| UI组件 | shadcn/ui | 高质量UI组件库 |
| 样式 | TailwindCSS 3 | 原子化CSS |
| 图表 | Chart.js + react-chartjs-2 | 雷达图、进度条 |
| 状态管理 | React Context + Server Actions | 客户端状态 |
| 部署 | Vercel / Docker | 生产部署 |

### 2.2 架构分层

```
┌─────────────────────────────────────────────────────┐
│                    Frontend Layer                    │
│  Pages (App Router) + Components + Client Hooks     │
├─────────────────────────────────────────────────────┤
│                    API Layer                         │
│  Server Actions + Route Handlers                     │
├─────────────────────────────────────────────────────┤
│                    Service Layer                     │
│  LLM Service / TTS Service / Emotion Service        │
├─────────────────────────────────────────────────────┤
│                    Data Layer                        │
│  Prisma ORM + SQLite/MySQL + Redis                  │
└─────────────────────────────────────────────────────┘
```

### 2.3 关键技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 框架 | Next.js 14 App Router | 全栈一体化，服务端组件，自动优化 |
| 认证 | NextAuth.js Credentials | 手机号+密码登录，简单直接 |
| 数据库 | SQLite开发 / MySQL生产 | 开发环境零配置，生产环境高性能 |
| LLM路由 | DeepSeek为主 + Qwen为辅 | DeepSeek中文能力强，Qwen本地化部署 |
| 状态管理 | React Context | 轻量级，无需复杂状态管理库 |

### 2.4 DeepSeek API健康检查机制

**检查策略**：

| 检查项 | 配置值 | 说明 |
|--------|--------|------|
| 检查间隔 | 5分钟 | 每5分钟对DeepSeek API进行一次ping请求 |
| 失败阈值 | 连续3次 | 连续失败3次（15分钟）触发降级 |
| 恢复尝试间隔 | 10分钟 | 降级后每10分钟尝试恢复一次 |

**降级期间用户提示**：对话界面显示"✨ 当前使用备用模型，对话体验可能略有不同"

**配置项**（config.ts）：
```typescript
export const LLM_CONFIG = {
  DEEPSEEK_API_HEALTH_CHECK_INTERVAL: 300000,
  DEEPSEEK_API_FAIL_THRESHOLD: 3,
  DEEPSEEK_API_RECOVERY_INTERVAL: 600000,
};
```

**健康检查实现**：
```typescript
class LlmHealthChecker {
  private failCount = 0;
  private isDegraded = false;
  private checkInterval: ReturnType<typeof setInterval>;

  constructor() {
    this.checkInterval = setInterval(() => this.checkHealth(), LLM_CONFIG.DEEPSEEK_API_HEALTH_CHECK_INTERVAL);
  }

  async checkHealth() {
    try {
      await fetchDeepSeekPing();
      this.failCount = 0;
      if (this.isDegraded) {
        this.isDegraded = false;
        notifyFrontend('recovery');
      }
    } catch {
      this.failCount++;
      if (this.failCount >= LLM_CONFIG.DEEPSEEK_API_FAIL_THRESHOLD && !this.isDegraded) {
        this.isDegraded = true;
        notifyFrontend('degradation');
      }
    }
  }

  isUsingFallback(): boolean {
    return this.isDegraded;
  }
}
```

---

## 三、数据库设计

### 3.1 模型总览

| 表名 | 说明 | 核心字段 |
|------|------|----------|
| User | 用户信息 | phone, password, membershipType, points, tickets |
| Partner | AI伴侣 | name, avatar, coreType, personality, voiceId |
| Affection | 好感度 | userId, score, level |
| ChatSession | 聊天会话 | userId, partnerId, messages |
| ChatMessage | 聊天消息 | sessionId, role, content, emotionType, emotionScore |
| SocialScene | 社交场景 | name, description, difficulty, stage, unlockAffection |
| TrainingRecord | 训练记录 | userId, sceneId, scores, status, completedAt |
| CheckIn | 签到记录 | userId, checkInDate, streak |
| CbtRecord | CBT思维记录 | userId, situation, thought, emotions, detectedDistortions |
| NvcRecord | NVC记录 | userId, observation, feeling, need, request, fullSentence |
| GiftItem | 礼物道具 | name, tier, pricePoints, affectionMin/Max, compatiblePersonality |
| GiftRecord | 送礼记录 | userId, partnerId, giftId, affectionChange, wasSuccessful |
| RelationshipMilestone | 关系里程碑 | userId, partnerId, milestoneType, description |
| Invitation | 邀请记录 | inviterId, inviteeId, code, status, rewardsClaimed |
| SharingConsent | 数据共享授权 | userId, hasConsent, consentedAt, revokedAt |
| EmotionRecord | 情绪识别记录 | userId, rawText, emotionPrimary, intensity, triggerMode |
| NightlyGreeting | 晚安计划记录 | userId, partnerId, content, audioUrl, isPlayed |
| EmotionDiary | 情绪日记 | userId, trainingId, emotionTag, content, insight |
| WeeklyReport | 每周报告 | userId, weekNumber, trainingCount, scores, partnerMessage |
| CompanionModeRule | 陪伴模式规则 | modeName, emotionThresholdMin/Max, hasQuestion, priority |
| SceneUnlock | 场景解锁记录 | userId, sceneId, unlocked, completed, unlockedAt |
| PartnerPreference | 伴侣喜好记录 | partnerId, preferenceType, preferenceDetail, revealed |

### 3.2 核心模型设计

```prisma
model User {
  id                    Int                  @id @default(autoincrement())
  phone                 String               @unique
  password              String
  nickname              String?
  avatar                String?
  membershipType        Int                  @default(0)
  membershipExpiresAt   DateTime?
  points                Int                  @default(0)
  tickets               Int                  @default(3)
  level                 Int                  @default(1)
  totalPoints           Int                  @default(0)
  currentStreak         Int                  @default(0)
  maxStreak             Int                  @default(0)
  lastActive            DateTime?
  createdAt             DateTime             @default(now())
  updatedAt             DateTime             @updatedAt

  partner               Partner?
  affection             Affection?
  chatSessions          ChatSession[]
  trainingRecords       TrainingRecord[]
  checkIns              CheckIn[]
  cbtRecords            CbtRecord[]
  nvcRecords            NvcRecord[]
  giftRecords           GiftRecord[]
  relationshipMilestones RelationshipMilestone[]
  sharingConsent        SharingConsent?
  invitations           Invitation[]
}

model Partner {
  id              Int     @id @default(autoincrement())
  userId          Int     @unique
  name            String
  avatar          String
  coreType        String
  personality     Json
  voiceId         String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Affection {
  id              Int     @id @default(autoincrement())
  userId          Int     @unique
  score           Int     @default(0)
  level           Int     @default(1)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ChatSession {
  id          Int             @id @default(autoincrement())
  userId      Int
  partnerId   Int
  messages    ChatMessage[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  partner     Partner         @relation(fields: [partnerId], references: [id], onDelete: Cascade)
}

model ChatMessage {
  id              Int         @id @default(autoincrement())
  sessionId       Int
  role            String
  content         String
  emotionType     String?
  emotionScore    Float?
  nvcSentence     Boolean     @default(false)
  isRetroactive   Boolean     @default(false)
  createdAt       DateTime    @default(now())

  session         ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}

model SocialScene {
  id              Int             @id @default(autoincrement())
  name            String
  description     String
  difficulty      Int
  stage           Int
  unlockAffection Int @default(0)
  options         Json
  createdAt       DateTime        @default(now())

  trainingRecords TrainingRecord[]
}

model TrainingRecord {
  id          Int         @id @default(autoincrement())
  userId      Int
  sceneId     Int
  status      Int         @default(0)
  scores      Json
  completedAt DateTime?
  createdAt   DateTime    @default(now())

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  scene       SocialScene @relation(fields: [sceneId], references: [id], onDelete: Cascade)
}

model CheckIn {
  id          Int         @id @default(autoincrement())
  userId      Int
  checkInDate DateTime
  streak      Int         @default(1)
  createdAt   DateTime    @default(now())

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, checkInDate])
}

model CbtRecord {
  id                      String    @id
  userId                  Int
  triggerScene            String?
  triggerMessage          String?
  situation               String?
  thought                 String?
  emotions                Json?
  emotionIntensityBefore  Int?
  evidenceFor             String?
  evidenceAgainst         String?
  alternativeThought      String?
  emotionIntensityAfter   Int?
  detectedDistortions     Json?
  status                  Int       @default(0)
  completedAt             DateTime?
  savedAt                 DateTime?
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  user                    User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model NvcRecord {
  id                  String    @id
  userId              Int
  triggerScene        String?
  triggerMessage      String?
  observation         String?
  observationValid    Boolean?
  observationFeedback String?
  feeling             String?
  need                String?
  request             String?
  requestValid        Boolean?
  requestFeedback     String?
  fullSentence        String?
  qualityScore        Int?
  status              Int       @default(0)
  completedAt         DateTime?
  savedAt             DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model GiftItem {
  id                  Int         @id @default(autoincrement())
  name                String
  category            String?
  tier                Int         @default(1)
  pricePoints         Int         @default(0)
  priceRmb            Decimal?
  membershipRequired  Int         @default(0)
  affectionMin        Int         @default(5)
  affectionMax        Int         @default(15)
  adUnlockable        Boolean     @default(false)
  imageUrl            String?
  compatiblePersonality Json?
  createdAt           DateTime    @default(now())

  giftRecords         GiftRecord[]
}

model GiftRecord {
  id              Int         @id @default(autoincrement())
  userId          Int
  partnerId       Int
  giftId          Int
  affectionChange Int
  wasSuccessful   Boolean
  createdAt       DateTime    @default(now())

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  partner         Partner     @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  gift            GiftItem    @relation(fields: [giftId], references: [id], onDelete: Cascade)
}

model RelationshipMilestone {
  id              Int         @id @default(autoincrement())
  userId          Int
  partnerId       Int
  milestoneType   String
  description     String?
  affectionValue  Int?
  createdAt       DateTime    @default(now())

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  partner         Partner     @relation(fields: [partnerId], references: [id], onDelete: Cascade)
}

model Invitation {
  id              Int         @id @default(autoincrement())
  code            String      @unique
  inviterId       Int
  inviteeId       Int?
  status          String      @default("pending")
  rewardsClaimed  Json?
  createdAt       DateTime    @default(now())

  inviter         User        @relation(fields: [inviterId], references: [id], onDelete: Cascade)
}

model SharingConsent {
  id          Int         @id @default(autoincrement())
  userId      Int         @unique
  hasConsent  Boolean     @default(false)
  consentedAt DateTime?
  revokedAt   DateTime?
  createdAt   DateTime    @default(now())

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model EmotionRecord {
  id              String    @id
  userId          Int
  sessionType     String?
  sourceType      String?
  rawText         String?
  emotionPrimary  String?
  emotionSecondary Json?
  intensity       Float?
  polarity        String?
  confidence      Float?
  triggerMode     String?
  features        Json?
  createdAt       DateTime  @default(now())

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model NightlyGreeting {
  id          Int         @id @default(autoincrement())
  userId      Int
  partnerId   Int
  content     String?
  audioUrl    String?
  isPlayed    Boolean     @default(false)
  createdAt   DateTime    @default(now())

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  partner     Partner     @relation(fields: [partnerId], references: [id], onDelete: Cascade)
}

model EmotionDiary {
  id          Int         @id @default(autoincrement())
  userId      Int
  trainingId  Int?
  emotionTag  String?
  content     String?
  insight     String?
  createdAt   DateTime    @default(now())

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model WeeklyReport {
  id              Int         @id @default(autoincrement())
  userId          Int
  weekNumber      Int
  year            Int
  trainingCount   Int         @default(0)
  scores          Json?
  improvements    String?
  recommendation  String?
  partnerMessage  String?
  createdAt       DateTime    @default(now())

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model CompanionModeRule {
  id                  Int         @id @default(autoincrement())
  modeName            String
  emotionThresholdMin Float?
  emotionThresholdMax Float?
  hasQuestion         Boolean?
  priority            Int         @default(1)
  description         String?
  createdAt           DateTime    @default(now())
}

model SceneUnlock {
  id          Int         @id @default(autoincrement())
  userId      Int
  sceneId     Int
  unlocked    Boolean     @default(false)
  unlockedAt  DateTime?
  completed   Boolean     @default(false)
  completedAt DateTime?

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, sceneId])
}

model PartnerPreference {
  id                  Int         @id @default(autoincrement())
  partnerId           Int
  preferenceType      String
  preferenceDetail    String?
  revealed            Boolean     @default(false)
  revealedAt          DateTime?
  createdAt           DateTime    @default(now())

  partner             Partner     @relation(fields: [partnerId], references: [id], onDelete: Cascade)

  @@index([partnerId])
}
```

---

## 四、核心功能模块

### 4.1 用户认证（PRD第5章）

#### 4.1.1 登录流程

```typescript
interface LoginParams {
  phone: string;
  password: string;
}

interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

async function login(params: LoginParams): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { phone: params.phone } });

  if (!user) {
    return { success: false, error: '用户不存在' };
  }

  const isPasswordValid = await bcrypt.compare(params.password, user.password);

  if (!isPasswordValid) {
    return { success: false, error: '密码错误' };
  }

  return { success: true, user };
}
```

#### 4.1.2 注册流程

```typescript
interface RegisterParams {
  phone: string;
  password: string;
  nickname?: string;
}

async function register(params: RegisterParams): Promise<LoginResult> {
  const existingUser = await prisma.user.findUnique({ where: { phone: params.phone } });

  if (existingUser) {
    return { success: false, error: '手机号已注册' };
  }

  const hashedPassword = await bcrypt.hash(params.password, 10);

  const user = await prisma.user.create({
    data: {
      phone: params.phone,
      password: hashedPassword,
      nickname: params.nickname || `用户${Date.now()}`,
    },
  });

  await prisma.affection.create({ data: { userId: user.id } });

  return { success: true, user };
}
```

### 4.2 AI伴侣系统（PRD第8章）

#### 4.2.1 创建伴侣

```typescript
interface CreatePartnerParams {
  userId: string;
  name: string;
  coreType: string;
  personality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
}

async function createPartner(params: CreatePartnerParams): Promise<Partner> {
  const partner = await prisma.partner.create({
    data: {
      userId: parseInt(params.userId),
      name: params.name,
      avatar: `/api/avatar/${params.coreType}`,
      coreType: params.coreType,
      personality: params.personality,
    },
  });

  await prisma.chatSession.create({
    data: {
      userId: parseInt(params.userId),
      partnerId: partner.id,
      messages: [],
    },
  });

  return partner;
}
```

#### 4.2.2 伴侣性格维度

| 维度 | 范围 | 说明 |
|------|------|------|
| 开放性 | 1-5 | 对新事物的接受程度 |
| 责任心 | 1-5 | 做事认真程度 |
| 外向性 | 1-5 | 社交活跃程度 |
| 宜人性 | 1-5 | 友好合作程度 |
| 神经质 | 1-5 | 情绪稳定性 |

### 4.3 聊天系统（PRD第8章）

#### 4.3.1 发送消息

```typescript
interface SendMessageParams {
  userId: string;
  partnerId: number;
  content: string;
}

async function sendMessage(params: SendMessageParams): Promise<ChatMessage[]> {
  const emotionResult = await analyzeEmotion(params.content);

  const userMessage = await prisma.chatMessage.create({
    data: {
      sessionId: (await getActiveSession(params.userId, params.partnerId)).id,
      role: 'user',
      content: params.content,
      emotionType: emotionResult.type,
      emotionScore: emotionResult.score,
    },
  });

  const aiResponse = await generateAiResponse(params.userId, params.partnerId, params.content);

  const aiMessage = await prisma.chatMessage.create({
    data: {
      sessionId: userMessage.sessionId,
      role: 'assistant',
      content: aiResponse.content,
      emotionType: aiResponse.emotionType,
      emotionScore: aiResponse.emotionScore,
    },
  });

  await updateAffection(params.userId, aiResponse.affectionChange);

  return [userMessage, aiMessage];
}
```

#### 4.3.2 情感陪伴模式

| 模式 | 触发条件 | 行为表现 |
|------|----------|----------|
| 树洞模式 | 情绪强度 > 0.7 且无具体问题 | 先倾听共情，不急着给建议 |
| 建议模式 | 情绪强度 < 0.4 且有具体问题 | 提供2-3个结构化选项 |
| 混合模式 | 情绪强度 > 0.6 且有具体问题 | 先共情接住，再给建议 |
| 强制树洞 | 情绪强度 > 0.8 | 只倾听，不提供建议 |

#### 4.3.3 话术示例

**树洞模式话术**：
- "听起来你真的很难过，我在这里陪你"
- "想多说点吗？我在这里"
- "换谁遇到这种情况都会不好受的"

**建议模式话术**：
- "我理解你现在的情况确实很棘手，我想了几个方向，你看哪个更适合你..."
- "你觉得哪个思路更符合你的情况？"
- "如果选第一个，具体可以这样开始..."

**混合模式流程**：
- 第一轮："听起来真的很委屈，我陪你待一会儿"
- 第二轮："现在感觉好些了吗？要不要一起理一理？"
- 第三轮："我觉得可以试试这样做...你觉得呢？"

#### 4.3.4 模式切换规则

| 切换方向 | 触发条件 |
|----------|----------|
| 树洞→建议 | 用户明确说"那该怎么办"类 |
| 建议→树洞 | 用户情绪强度上升 |
| 用户手动切换 | 随时可在对话中手动切换 |

#### 4.3.5 与情绪识别服务的联动逻辑

```typescript
async function determineCompanionMode(userId: string, message: string): Promise<'treehole' | 'suggestion' | 'hybrid' | 'forced_treehole'> {
  const emotionResult = await analyzeEmotion(message);

  const hasSpecificProblem = detectSpecificProblem(message);

  if (emotionResult.score > 0.8) {
    return 'forced_treehole';
  }

  if (emotionResult.score > 0.7 && !hasSpecificProblem) {
    return 'treehole';
  }

  if (emotionResult.score < 0.4 && hasSpecificProblem) {
    return 'suggestion';
  }

  if (emotionResult.score > 0.6 && hasSpecificProblem) {
    return 'hybrid';
  }

  return 'treehole';
}
```

#### 4.3.6 "无具体问题"判断逻辑实现

```typescript
function detectSpecificProblem(message: string): boolean {
  const problemKeywords = ['怎么办', '如何', '怎么', '为什么', '原因', '解决', '方法'];
  const sceneKeywords = ['今天', '昨天', '刚才', '朋友', '同事', '领导', '开会', '工作', '学习'];

  const hasProblemKeyword = problemKeywords.some(keyword => message.includes(keyword));
  const hasSceneKeyword = sceneKeywords.some(keyword => message.includes(keyword));

  return hasProblemKeyword || hasSceneKeyword;
}
```

#### 4.3.7 树洞模式倾听行为实现

```typescript
interface TreeholeModeConfig {
  systemPrompt: string;
  maxResponseLength: number;
  minResponseLength: number;
}

const treeholeModeConfig: TreeholeModeConfig = {
  systemPrompt: '你当前处于树洞模式，请以倾听为主，不要主动提供解决方案或建议。回复要简短温暖，表达理解和陪伴。',
  maxResponseLength: 50,
  minResponseLength: 20,
};

const empathyPhrases = [
  '我明白了',
  '我能理解你的感受',
  '我在这里陪你',
  '你不是一个人',
  '想多说一点吗？',
];
```

### 4.4 模拟训练系统（PRD第6章）

#### 4.4.1 场景结构

```typescript
interface SocialScene {
  id: number;
  name: string;
  description: string;
  stage: number;
  difficulty: number;
  unlockAffection: number;
  options: { label: string; value: string; quality: 'safe' | 'good' | 'cold' }[];
}
```

#### 4.4.2 训练流程

```typescript
async function startTraining(userId: string, sceneId: number): Promise<TrainingRecord> {
  const scene = await prisma.socialScene.findUnique({ where: { id: sceneId } });

  if (!scene) {
    throw new Error('场景不存在');
  }

  return prisma.trainingRecord.create({
    data: {
      userId: parseInt(userId),
      sceneId,
      status: 0,
      scores: {},
    },
  });
}
```

### 4.5 礼物/道具系统（PRD第28章）

#### 4.5.1 道具分级

| 等级 | 名称 | 获取方式 | 好感度 | 限制 |
|------|------|----------|--------|------|
| 基础 | 虚拟花/卡片 | 每日登录 | +5~8 | 无 |
| 普通 | 虚拟奶茶/甜品 | 积分兑换 | +8~12 | 无 |
| 精致 | 虚拟项链/手链 | 积分/周卡赠送 | +12~18 | 周卡+ |
| 高级 | 虚拟钻戒/旅行 | 月卡专享 | +20~30 | 月卡+ |
| 奢华 | 专属定制 | 年卡专享 | +30~50 | 年卡专属 |

#### 4.5.2 好感度规则

```typescript
interface GiftResult {
  affectionChange: number;
  wasSuccessful: boolean;
  message: string;
}

function calculateAffectionChange(userId: string, giftId: number): GiftResult {
  const gift = await prisma.giftItem.findUnique({ where: { id: giftId } });
  const partner = await prisma.partner.findUnique({ where: { userId: parseInt(userId) } });

  const baseChange = Math.floor(Math.random() * (gift.affectionMax - gift.affectionMin + 1)) + gift.affectionMin;

  const isCompatible = checkCompatibility(gift.compatiblePersonality, partner.coreType);
  const multiplier = isCompatible ? 1.5 : 1;

  let finalChange = Math.floor(baseChange * multiplier);

  if (!isCompatible && Math.random() < 0.3) {
    finalChange = -Math.floor(finalChange * 0.5);
    return { affectionChange: finalChange, wasSuccessful: false, message: `${partner.name}似乎不太喜欢这个礼物...` };
  }

  return { affectionChange: finalChange, wasSuccessful: true, message: `${partner.name}很喜欢这个礼物！` };
}
```

#### 4.5.3 高质量对话判断标准

```typescript
function isHighQualityConversation(message: string): boolean {
  const positiveWords = ['谢谢', '真好', '理解', '开心', '感谢', '温暖', '感动'];
  const blacklistWords = ['嗯', '哦', '好的', '行', 'OK', 'ok', '好', '嗯嗯'];

  const meetsLength = message.length >= 20;
  const hasPositiveWord = positiveWords.some(word => message.includes(word));
  const isBlacklisted = blacklistWords.includes(message.trim());

  return meetsLength && hasPositiveWord && !isBlacklisted;
}
```

#### 4.5.4 伴侣喜好逐步透露机制

**初始状态**：伴侣喜好完全隐藏，用户不知道伴侣喜欢什么礼物

**透露时机**：
- 好感度达到Lv.2（100分）：透露1个喜好类别（如"喜欢甜食"）
- 好感度达到Lv.3（300分）：再透露1个喜好类别
- 好感度达到Lv.4（600分）：透露具体礼物偏好
- 好感度达到Lv.5（1000分）：完全解锁所有喜好

**透露方式**：
- 通过对话自然透露："我最近特别喜欢喝奶茶"
- 通过伴侣档案显示：解锁"喜好"标签页
- 通过送礼反馈暗示："这个我很喜欢，你真懂我~"

**伴侣档案UI**：
- 喜好标签页显示已解锁的喜好类别
- 未解锁的喜好显示为"❓"占位符
- 显示解锁进度（如：3/5 已解锁）

#### 4.5.5 API接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取礼物列表 | GET | /api/v1/gifts | 获取礼物库列表（gift_items，用于商城展示） |
| 发送礼物 | POST | /api/v1/gifts/send | 发送礼物给伴侣 |
| 获取送礼记录 | GET | /api/v1/gifts/records | 获取送礼历史（gift_records） |
| 获取伴侣喜好 | GET | /api/v1/gifts/preferences | 获取伴侣喜好 |
| 解锁伴侣喜好 | PUT | /api/v1/gifts/preferences/:id/reveal | 解锁伴侣喜好 |
| 获取礼物分类 | GET | /api/v1/gifts/categories | 获取礼物分类列表 |

#### 4.5.6 数据库表

```sql
CREATE TABLE gift_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(20),
    tier TINYINT DEFAULT 1,
    price_points INT DEFAULT 0,
    price_rmb DECIMAL(10,2) DEFAULT 0,
    membership_required TINYINT DEFAULT 0,
    affection_min INT DEFAULT 5,
    affection_max INT DEFAULT 15,
    ad_unlockable BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(255),
    compatible_personality JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gift_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    partner_id BIGINT NOT NULL,
    gift_id BIGINT NOT NULL,
    affection_change INT,
    was_successful BOOLEAN,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_partner_id (partner_id),
    INDEX idx_gift_id (gift_id)
);
```

### 4.6 角色切换与关系回忆录（PRD第29章）

#### 4.6.1 角色切换规则

- 每个用户可保存3-5个角色
- 每个角色独立聊天记录和关系记忆
- 支持在首页/伴侣页一键切换
- 切换后好感度独立计算

#### 4.6.2 角色切换UI规格

**首页入口**：
- 顶部伴侣头像区域，点击后弹出角色选择列表
- 当前角色高亮显示，显示好感度等级和昵称
- 支持左右滑动切换

**伴侣页入口**：
- 右上角角色切换按钮（图标：↔️）
- 点击后底部弹出角色卡片列表
- 卡片包含：头像、昵称、好感度进度条、上次互动时间

**切换后数据状态**：
- 对话页面切换到新角色的历史记录
- 好感度显示为新角色的当前值
- 记忆数据切换为新角色的记忆
- 训练进度继承（跨角色共享）

**角色删除规则**：
- 删除角色后，该角色的所有数据（好感度、聊天记录、记忆）被永久删除
- 训练记录不受影响（跨角色共享）
- 删除前弹出确认弹窗

#### 4.6.3 关系回忆录里程碑类型

```typescript
type MilestoneType =
  | 'first_chat'          // 第一次聊天
  | 'first_voice_call'    // 第一次语音通话
  | 'affection_level_up'  // 好感度升级
  | 'first_scene'         // 第一次完成场景训练
  | 'first_gift'          // 第一次收到礼物
  | 'first_time_travel';  // 第一次时空穿梭
```

#### 4.6.4 里程碑事件触发时机

| 节点类型 | 触发时机 | 调用方 | 接口 |
|----------|----------|--------|------|
| 第一次聊天 | 后端在/ws/chat首次接收用户消息时 | 后端自动 | 自动创建RelationshipMilestone记录 |
| 第一次语音通话 | 后端在/api/v1/call/start首次被调用时 | 后端自动 | 自动创建记录 |
| 好感度升级 | 后端在好感度跨过等级阈值时（如从Lv.1→Lv.2） | 后端自动 | 自动创建记录 |
| 第一次完成场景训练 | 后端在训练结束时检测到是第一次完成 | 后端自动 | 自动创建记录 |
| 第一次收到礼物 | 后端在/api/v1/gift/send首次被调用时 | 后端自动 | 自动创建记录 |
| 第一次时空穿梭 | 后端在/api/v1/time/rewind首次被调用时 | 后端自动 | 自动创建记录 |

**前端获取方式**：前端在Tab4成长页加载时，调用GET /api/v1/milestone/list获取全部记录并按时间排序

#### 4.6.5 情感羁绊可视化设计

**时间轴布局**：
- 垂直时间轴，从下往上时间递增
- 每个里程碑节点显示图标、标题、日期
- 节点之间用渐变色线条连接

**羁绊强度可视化**：
- 根据好感度等级和互动频率计算羁绊值（0-100）
- 用圆环进度条展示当前羁绊值
- 里程碑节点的大小和颜色随羁绊值变化

**互动热力图**：
- 显示过去30天的互动频率
- 每天一个格子，颜色深浅代表互动次数
- 支持点击查看当天的详细互动记录

#### 4.6.6 API接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取里程碑列表 | GET | /api/v1/milestones | 获取关系里程碑 |
| 创建里程碑 | POST | /api/v1/milestones | 创建新里程碑 |
| 获取角色列表 | GET | /api/v1/partners | 获取用户所有角色 |
| 切换角色 | POST | /api/v1/partners/:id/switch | 切换到指定角色 |
| 删除角色 | DELETE | /api/v1/partners/:id | 删除角色 |

### 4.7 社交裂变与好友邀请（PRD第30章）

#### 4.7.1 邀请机制

```typescript
interface Invitation {
  id: number;
  code: string;
  inviterId: number;
  inviteeId: number;
  status: 'pending' | 'completed';
  rewardClaimed: boolean;
  createdAt: DateTime;
}

async function generateInviteCode(userId: string): Promise<string> {
  const code = `${parseInt(userId).toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  await prisma.invitation.create({
    data: {
      code,
      inviterId: parseInt(userId),
      status: 'pending',
    },
  });

  return code;
}
```

#### 4.7.2 奖励规则

| 奖励类型 | 数量 | 触发条件 |
|----------|------|----------|
| 模拟次数 | +5 | 被邀请人完成注册+首次训练 |
| 穿梭券 | +1 | 被邀请人完成注册+首次训练 |
| 积分 | +100 | 被邀请人完成注册+首次训练 |

#### 4.7.3 防刷规则

- 同设备限制：每个设备最多注册3个账号
- 同手机号限制：每个手机号只能注册1个账号
- 同IP限制：每小时最多生成5个邀请码
- 奖励发放幂等：每个邀请码只能领取一次奖励

### 4.8 才艺版权合规（PRD第31章）

#### 4.8.1 版权规则

| 才艺类型 | 安全方案 | 版权归属 |
|----------|----------|----------|
| 诗歌 | LLM即时生成 | 原创，平台所有 |
| 故事/笑话 | 预设模板库+LLM生成 | 原创，平台所有 |
| 歌词 | LLM生成+AI音乐生成 | 原创，平台所有 |
| 歌曲 | TTS朗诵+背景音乐 | 背景音乐需授权 |
| 舞蹈 | 文字描述+配图（MVP） | 无版权风险 |

#### 4.8.2 歌词来源合规

- 优先使用LLM生成的原创歌词
- 或使用公共领域歌词（作者去世50年以上）
- 禁止使用任何有版权歌词

#### 4.8.3 背景音乐来源

- 使用无版权音乐库（CC0协议）
- 或购买商用授权音乐
- 或使用AI生成的纯音乐（确认商用授权）

---

## 五、情绪识别服务（PRD第27章）

### 5.1 三层分析引擎

#### 第一层：文本情感分析

| 情绪类型 | 关键词 | 权重 |
|----------|--------|------|
| 焦虑 | 担心/害怕/紧张/焦虑/慌/压力大 | 0.8 |
| 悲伤 | 难过/伤心/失落/绝望/没希望/想哭 | 0.8 |
| 愤怒 | 生气/气死了/烦/受不了/凭什么 | 0.7 |
| 恐惧 | 怕/不敢/恐惧/吓人/完了/死定了 | 0.8 |
| 委屈 | 委屈/冤枉/不公平/凭什么是我 | 0.7 |
| 开心 | 开心/高兴/好棒/太好了/幸福 | 0.6 |
| 平静 | 还好/还行/一般/没事/正常 | 0.3 |

**融合策略**：最终文本情感 = 0.4 × 关键词匹配 + 0.6 × BERT模型输出

#### 第二层：行为分析

| 行为 | 分析维度 | 推断情绪 |
|------|----------|----------|
| 登录时间 | 深夜（>23:00） | 焦虑/失眠 |
| 对话频率 | 短时高频 | 焦虑/急切 |
| 对话长度 | <5字 | 低落/回避 |
| 训练行为 | 回避挑战 | 恐惧/焦虑 |

#### 第三层：语音情绪分析（月卡+）

| 特征 | 对应情绪 |
|------|----------|
| 语速偏快 | 兴奋/焦虑 |
| 音量偏低 | 悲伤/疲惫 |
| 音调偏高 | 兴奋/焦虑 |
| 停顿频繁 | 紧张/不确定 |

### 5.2 融合决策

**多模态融合公式**：
```
最终情绪强度 = 0.5 × 文本 + 0.3 × 语音（如有） + 0.2 × 行为
```

**决策规则**：

| 条件 | 触发模式 |
|------|----------|
| 强度 > 0.7 且无具体问题 | 树洞模式 |
| 强度 < 0.4 且有具体问题 | 建议模式 |
| 强度 > 0.6 且有具体问题 | 混合模式 |
| 强度 > 0.8 | 强制树洞模式 |

### 5.3 成本优化方案

| 用户等级 | 文本分析 | 语音分析 | 行为分析 |
|----------|----------|----------|----------|
| 体验版 | 关键词匹配 | ❌ | 基础 |
| 基础会员 | 关键词匹配 | ❌ | 基础 |
| 周卡会员 | 关键词+BERT | ❌ | 完整 |
| 月卡会员 | 关键词+BERT | ✅ | 完整 |
| 年卡会员 | 关键词+BERT | ✅ | 完整 |

### 5.4 API接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 文本情绪分析 | POST | /api/v1/emotion/text | 分析文本情绪 |
| 语音情绪分析 | POST | /api/v1/emotion/voice | 分析语音情绪 |
| 综合情绪分析 | POST | /api/v1/emotion/fusion | 多模态融合分析 |
| 获取情绪历史 | GET | /api/v1/emotion/history | 获取情绪变化趋势 |

### 5.5 数据库表

```sql
CREATE TABLE emotion_records (
    id VARCHAR(20) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_type VARCHAR(20),
    source_type VARCHAR(20),
    raw_text TEXT,
    emotion_primary VARCHAR(20),
    emotion_secondary JSON,
    intensity DECIMAL(3,2),
    polarity VARCHAR(10),
    confidence DECIMAL(3,2),
    trigger_mode VARCHAR(20),
    features JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_emotion (emotion_primary)
);
```

---

## 六、CBT思维记录表（PRD第25章）

### 6.0 触发方式

| 触发方式 | 说明 |
|----------|------|
| 实时对话 | AI检测到认知扭曲关键词，主动弹出引导 |
| 训练历史列表页 | Tab4→训练记录，点击记录进入详情页，底部显示"分析思维模式"入口 |
| 学习工具 | Tab4→成长→思维记录表 |

**训练报告触发**：

| 入口位置 | 说明 |
|----------|------|
| 场景训练结束后的评估报告页底部 | 增加"💡 试试CBT思维记录"按钮 |
| 训练历史列表页（Tab4→训练记录） | 每条记录右侧增加"查看详情"按钮，详情页底部有"分析思维模式"入口 |

### 6.1 5步填写流程

| 步骤 | 名称 | 输入字段 | AI功能 |
|------|------|----------|--------|
| 1 | 情境 | 文本输入 | - |
| 2 | 想法 | 文本输入 | 认知扭曲检测 |
| 3 | 情绪 | 多选+强度滑块 | - |
| 4 | 证据 | 支持证据+反对证据 | - |
| 5 | 替代想法 | 文本输入 | 自动生成建议 |

### 6.2 认知扭曲类型

| 类型 | 说明 | 示例 |
|------|------|------|
| 灾难化思维 | 把事情想象得比实际更糟 | "我肯定会失败" |
| 过度概括 | 一次失败代表永远失败 | "我总是做不好" |
| 个人化 | 把责任都归咎于自己 | "都是我的错" |
| 非黑即白 | 认为事情只有两种极端 | "要么完美，要么失败" |
| 情绪推理 | 用感受代替事实 | "我感觉自己很笨" |

### 6.3 API接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建记录 | POST | /api/v1/cbt/records | 创建思维记录表 |
| 更新记录 | PUT | /api/v1/cbt/records/:id | 分步保存进度 |
| 获取记录 | GET | /api/v1/cbt/records/:id | 获取完整记录 |
| 获取列表 | GET | /api/v1/cbt/records | 分页获取历史记录 |
| AI分析 | POST | /api/v1/cbt/analyze | 分析认知扭曲 |
| 删除记录 | DELETE | /api/v1/cbt/records/:id | 删除记录 |

#### 6.3.1 请求/响应示例

**POST /api/v1/cbt/records（创建CBT记录）**

请求体：
```json
{
  "triggerScene": "社交场景训练",
  "triggerMessage": "我觉得大家都不喜欢我",
  "situation": "今天在公司开会，我发言时没人回应",
  "thought": "他们一定觉得我说的很无聊",
  "emotions": ["焦虑", "沮丧"],
  "emotionIntensityBefore": 8
}
```

响应体：
```json
{
  "success": true,
  "data": {
    "id": "cbt_20260707001",
    "userId": 123,
    "triggerScene": "社交场景训练",
    "status": 1,
    "createdAt": "2026-07-07T10:30:00Z"
  }
}
```

**POST /api/v1/cbt/analyze（分析认知扭曲）**

请求体：
```json
{
  "thought": "他们一定觉得我说的很无聊",
  "situation": "今天在公司开会，我发言时没人回应"
}
```

响应体：
```json
{
  "success": true,
  "data": {
    "distortions": [
      {
        "type": "读心术",
        "description": "你假设知道别人在想什么，但没有证据",
        "suggestion": "尝试询问对方的真实想法"
      }
    ],
    "confidence": 0.85
  }
}
```

### 6.4 数据库表

```sql
CREATE TABLE cbt_records (
    id VARCHAR(20) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    trigger_scene VARCHAR(50),
    trigger_message TEXT,
    situation TEXT,
    thought TEXT,
    emotions JSON,
    emotion_intensity_before INT,
    evidence_for TEXT,
    evidence_against TEXT,
    alternative_thought TEXT,
    emotion_intensity_after INT,
    detected_distortions JSON,
    status TINYINT DEFAULT 0 COMMENT '0:未开始 1:情境完成 2:想法完成 3:情绪完成 4:证据完成 5:已完成',
    completed_at DATETIME,
    saved_at DATETIME COMMENT '上次保存时间（用于"进行中"状态排序）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);
```

### 6.5 CBT继续填写的跳转逻辑

| 步骤 | 实现方式 | 说明 |
|------|----------|------|
| 点击"继续填写" | 根据status字段判断上次完成到第几步 | status=1→第1步完成，跳转到第2步 |
| 数据回填 | 已填写的步骤数据回填到对应表单字段 | 前端从API获取完整记录数据 |
| 分步状态 | status字段记录当前完成步骤（0=未开始，1=第1步完成，...，5=已完成） | 用于判断跳转位置和进度保存 |
| 保存机制 | 每完成一步自动调用PUT /api/v1/cbt/records/:id保存，并更新status和saved_at | saved_at用于"进行中"状态排序 |

**跳转逻辑实现**：
```typescript
function getNextStep(currentStatus: number): number {
  const steps = [1, 2, 3, 4, 5];
  return steps[currentStatus] || 1;
}

async function saveStep(cbtId: string, step: number, data: Record<string, unknown>) {
  await fetch(`/api/v1/cbt/records/${cbtId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...data,
      status: step,
      savedAt: new Date().toISOString(),
    }),
  });
}
```

---

## 七、NVC四步法可视化引导（PRD第26章）

### 7.0 触发方式

| 触发方式 | 说明 |
|----------|------|
| 冲突场景 | 伴侣扮演冲突方，AI主动弹出NVC引导 |
| 用户求助 | 用户输入"我不知道该怎么说"类 |
| 学习工具 | Tab4→成长→NVC练习 |

**训练报告触发**：

| 入口位置 | 说明 |
|----------|------|
| 场景训练结束后的评估报告页底部 | 增加"💡 试试NVC非暴力沟通"按钮 |
| 训练历史列表页（Tab4→训练记录） | 每条记录右侧增加"查看详情"按钮，详情页底部有"用NVC重新表达"入口 |

### 7.1 4步填写流程

| 步骤 | 名称 | 输入字段 | AI反馈 |
|------|------|----------|--------|
| 1 | 观察 | 文本输入 | 区分观察vs评价 |
| 2 | 感受 | 下拉选择 | 区分感受vs想法 |
| 3 | 需要 | 下拉选择 | 匹配需要类型 |
| 4 | 请求 | 文本输入 | 判断是否具体可行 |

### 7.2 AI实时反馈规则

```typescript
interface NvcFeedback {
  isValid: boolean;
  message: string;
  suggestion?: string;
}

function analyzeObservation(input: string): NvcFeedback {
  const evaluationWords = ['态度很差', '很不好', '总是', '从不', '应该'];

  if (evaluationWords.some(word => input.includes(word))) {
    return {
      isValid: false,
      message: '这是评价，不是观察',
      suggestion: '试试改成客观描述，如"当你提高音量说话时"',
    };
  }

  return { isValid: true, message: '很好！这是客观的观察' };
}
```

### 7.3 完整句子预览

```
当你{观察}，我感到{感受}，因为我需要{需要}，你愿意{请求}吗？
```

### 7.3.1 NVC发送到对话的前端实现方式

**交互流程**：

| 步骤 | 前端操作 | 技术实现 |
|------|----------|----------|
| 点击"发送到对话" | 前端通过WebSocket向/ws/chat发送消息 | WebSocket |
| 消息体 | `{ content: '完整NVC句子', nvcSentence: true }` | JSON格式 |
| 显示用户消息 | 对话界面立即显示蓝色气泡 | 前端渲染 |
| AI回应 | 通过WebSocket流式返回，逐字显示 | 流式输出 |

**前端代码示例**：
```typescript
async function sendNvcToChat(nvcSentence: string) {
  const ws = new WebSocket(`${process.env.NEXT_PUBLIC_API_URL}/ws/chat`);

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'message',
      content: nvcSentence,
      nvcSentence: true,
    }));
  };

  ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    appendMessageToChat(response.content, 'assistant');
  };
}
```

### 7.4 API接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 分析NVC输入 | POST | /api/v1/nvc/analyze | 分析是否符合NVC |
| 获取NVC模板 | GET | /api/v1/nvc/templates | 按场景获取模板 |
| 提交NVC记录 | POST | /api/v1/nvc/records | 记录使用情况 |
| 验证NVC输入 | POST | /api/v1/nvc/validate | 验证用户输入是否符合NVC规范 |

#### 7.4.1 请求/响应示例

**POST /api/v1/nvc/validate（验证NVC输入）**

请求体：
```json
{
  "step": "observation",
  "input": "当你态度很差时"
}
```

响应体：
```json
{
  "success": true,
  "data": {
    "valid": false,
    "feedback": "\"态度很差\"是评价，不是观察。试试改成：\"当你提高音量说话时\"",
    "suggestion": "描述客观事实，避免使用评价性语言"
  }
}
```

**POST /api/v1/nvc/records（提交NVC记录）**

请求体：
```json
{
  "triggerScene": "伴侣冲突",
  "observation": "当你提高音量说话时",
  "observationValid": true,
  "feeling": "受伤",
  "need": "被尊重",
  "request": "你愿意下次先用平和的语气和我说吗？",
  "requestValid": true,
  "fullSentence": "当你提高音量说话时，我感到受伤，因为我需要被尊重，你愿意下次先用平和的语气和我说吗？",
  "qualityScore": 95
}
```

响应体：
```json
{
  "success": true,
  "data": {
    "id": "nvc_20260707001",
    "userId": 123,
    "affectionChange": 15,
    "createdAt": "2026-07-07T10:30:00Z"
  }
}
```

### 7.5 数据库表

```sql
CREATE TABLE nvc_records (
    id VARCHAR(20) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    trigger_scene VARCHAR(50),
    trigger_message TEXT,
    observation TEXT,
    observation_valid BOOLEAN COMMENT '观察是否有效（是否符合NVC规范）',
    observation_feedback TEXT,
    feeling VARCHAR(50),
    need VARCHAR(100),
    request TEXT,
    request_valid BOOLEAN COMMENT '请求是否有效（是否具体可行）',
    request_feedback TEXT,
    full_sentence TEXT,
    quality_score INT COMMENT 'NVC整体质量评分（0-100分，AI自动评分）',
    status TINYINT DEFAULT 0,
    completed_at DATETIME,
    saved_at DATETIME COMMENT '上次保存时间（用于"进行中"状态排序）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);
```

---

## 八、完整API接口汇总

### 8.1 用户服务（/api/v1/user）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 用户登录 | POST | /api/v1/user/login | 手机号+密码登录 |
| 用户注册 | POST | /api/v1/user/register | 手机号+密码注册 |
| 获取用户信息 | GET | /api/v1/user/me | 获取当前用户信息 |
| 更新用户信息 | PUT | /api/v1/user/me | 更新用户信息 |
| 用户注销 | POST | /api/v1/user/logout | 注销登录 |
| 获取会员信息 | GET | /api/v1/user/membership | 获取会员信息 |

### 8.2 伴侣服务（/api/v1/partner）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建伴侣 | POST | /api/v1/partner | 创建AI伴侣 |
| 获取伴侣信息 | GET | /api/v1/partner | 获取当前伴侣信息 |
| 更新伴侣信息 | PUT | /api/v1/partner | 更新伴侣信息 |
| 获取角色列表 | GET | /api/v1/partner/list | 获取用户所有角色 |
| 切换角色 | POST | /api/v1/partner/:id/switch | 切换到指定角色 |
| 删除角色 | DELETE | /api/v1/partner/:id | 删除角色 |

### 8.3 聊天服务（/api/v1/chat）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取会话列表 | GET | /api/v1/chat/sessions | 获取聊天会话列表 |
| 获取消息列表 | GET | /api/v1/chat/messages/:sessionId | 获取会话消息 |
| 发送消息 | POST | /api/v1/chat/send | 发送聊天消息 |
| 获取当前模式 | GET | /api/v1/chat/mode | 获取当前陪伴模式 |
| 切换模式 | PUT | /api/v1/chat/mode | 手动切换陪伴模式 |

### 8.4 场景服务（/api/v1/scene）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取场景列表 | GET | /api/v1/scene/list | 获取所有场景 |
| 获取场景详情 | GET | /api/v1/scene/:id | 获取场景详情 |
| 检查场景解锁 | GET | /api/v1/scene/:id/unlock | 检查场景是否解锁 |
| 获取解锁进度 | GET | /api/v1/scene/progress | 获取场景解锁进度 |

### 8.5 训练服务（/api/v1/training）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 开始训练 | POST | /api/v1/training/start | 开始场景训练 |
| 提交选择 | POST | /api/v1/training/select | 提交对话选择 |
| 结束训练 | POST | /api/v1/training/end | 结束训练 |
| 获取训练记录 | GET | /api/v1/training/records | 获取训练记录列表 |
| 获取训练报告 | GET | /api/v1/training/report/:id | 获取训练报告 |

### 8.6 情绪识别服务（/api/v1/emotion）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 文本情绪分析 | POST | /api/v1/emotion/text | 分析文本情绪 |
| 语音情绪分析 | POST | /api/v1/emotion/voice | 分析语音情绪 |
| 综合情绪分析 | POST | /api/v1/emotion/fusion | 多模态融合分析 |
| 获取情绪历史 | GET | /api/v1/emotion/history | 获取情绪变化趋势 |
| 情绪趋势分析 | GET | /api/v1/emotion/analyze | 分析情绪趋势 |

### 8.7 CBT服务（/api/v1/cbt）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建记录 | POST | /api/v1/cbt/records | 创建思维记录表 |
| 更新记录 | PUT | /api/v1/cbt/records/:id | 分步保存进度 |
| 获取记录 | GET | /api/v1/cbt/records/:id | 获取完整记录 |
| 获取列表 | GET | /api/v1/cbt/records | 分页获取历史记录 |
| AI分析 | POST | /api/v1/cbt/analyze | 分析认知扭曲 |
| 删除记录 | DELETE | /api/v1/cbt/records/:id | 删除记录 |

### 8.8 NVC服务（/api/v1/nvc）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建记录 | POST | /api/v1/nvc/records | 创建NVC记录 |
| 更新记录 | PUT | /api/v1/nvc/records/:id | 更新NVC记录 |
| 分析NVC输入 | POST | /api/v1/nvc/analyze | 分析是否符合NVC |
| 获取NVC模板 | GET | /api/v1/nvc/templates | 按场景获取模板 |
| 获取记录列表 | GET | /api/v1/nvc/records | 获取NVC记录列表 |
| 验证输入 | POST | /api/v1/nvc/validate | 验证用户输入 |

### 8.9 礼物服务（/api/v1/gift）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取礼物列表 | GET | /api/v1/gift/list | 获取礼物库列表（gift_items，用于商城展示） |
| 发送礼物 | POST | /api/v1/gift/send | 发送礼物给伴侣 |
| 获取送礼记录 | GET | /api/v1/gift/history | 获取送礼历史 |
| 获取伴侣喜好 | GET | /api/v1/gift/preferences | 获取伴侣喜好 |
| 解锁伴侣喜好 | PUT | /api/v1/gift/preferences/:id/reveal | 解锁伴侣喜好 |
| 获取礼物分类 | GET | /api/v1/gift/categories | 获取礼物分类列表 |

### 8.10 好感度服务（/api/v1/affection）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取好感度 | GET | /api/v1/affection | 获取当前好感度 |
| 更新好感度 | PUT | /api/v1/affection | 更新好感度 |
| 获取等级信息 | GET | /api/v1/affection/level | 获取好感度等级 |

### 8.11 签到服务（/api/v1/checkin）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 每日签到 | POST | /api/v1/checkin/daily | 每日签到 |
| 获取签到记录 | GET | /api/v1/checkin/history | 获取签到历史 |
| 获取连续签到 | GET | /api/v1/checkin/streak | 获取连续签到天数 |

### 8.12 时空穿梭服务（/api/v1/time）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 触发时空穿梭 | POST | /api/v1/time/rewind | 触发时空穿梭 |
| 获取穿梭券 | GET | /api/v1/time/tickets | 获取穿梭券数量 |
| 添加穿梭券 | POST | /api/v1/time/tickets/add | 添加穿梭券 |

### 8.13 晚安计划服务（/api/v1/nightly）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 生成晚安内容 | POST | /api/v1/nightly/generate | 生成晚安语音+文字 |
| 获取最新晚安 | GET | /api/v1/nightly/latest | 获取最新晚安内容 |
| 标记已播放 | PUT | /api/v1/nightly/played | 标记晚安已播放 |

### 8.14 情绪日记服务（/api/v1/diary）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取日记列表 | GET | /api/v1/diary/list | 获取情绪日记列表 |
| 获取单篇日记 | GET | /api/v1/diary/:id | 获取单篇日记 |
| 创建日记 | POST | /api/v1/diary | 创建情绪日记 |

### 8.15 每周报告服务（/api/v1/report）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取本周报告 | GET | /api/v1/report/weekly | 获取本周社交报告 |
| 获取历史报告 | GET | /api/v1/report/history | 获取历史报告列表 |
| 手动生成报告 | POST | /api/v1/report/generate | 手动生成报告 |

### 8.16 邀请服务（/api/v1/invite）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取邀请码 | GET | /api/v1/invite/code | 获取邀请码 |
| 使用邀请码注册 | POST | /api/v1/invite/register | 使用邀请码注册 |
| 获取邀请奖励 | GET | /api/v1/invite/rewards | 获取邀请奖励 |
| 获取邀请记录 | GET | /api/v1/invite/history | 获取邀请记录 |

### 8.17 语音通话服务（/api/v1/call）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 发起通话 | POST | /api/v1/call/start | 发起语音通话 |
| 挂断通话 | POST | /api/v1/call/hangup | 挂断通话 |
| 伴侣挂断 | POST | /api/v1/call/partner-hangup | 伴侣挂断 |
| 获取通话记录 | GET | /api/v1/call/history | 获取通话记录 |

### 8.18 关系回忆录服务（/api/v1/milestone）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取里程碑列表 | GET | /api/v1/milestone/list | 获取关系里程碑 |
| 创建里程碑 | POST | /api/v1/milestone | 创建新里程碑 |
| 获取时间轴 | GET | /api/v1/milestone/timeline | 获取时间轴 |

### 8.19 变美联动服务（/api/v1/beauty）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取授权状态 | GET | /api/v1/beauty/consent | 获取数据共享授权状态 |
| 授权数据共享 | POST | /api/v1/beauty/consent | 授权数据共享 |
| 撤销授权 | DELETE | /api/v1/beauty/consent | 撤销数据共享授权 |
| 同步数据 | POST | /api/v1/beauty/sync | 同步数据到悦己颜值社 |

### 8.20 才艺服务（/api/v1/talent）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取才艺列表 | GET | /api/v1/talent/list | 获取可用才艺 |
| 触发才艺 | POST | /api/v1/talent/trigger | 触发才艺表演 |
| 获取才艺记录 | GET | /api/v1/talent/history | 获取才艺使用记录 |

---

## 九、前端页面结构

### 9.1 页面路由

| 路由 | 页面 | 说明 | 关联PRD章节 |
|------|------|------|------------|
| `/` | 首页 | 用户信息+功能入口+签到+晚安计划 | PRD第4章 |
| `/login` | 登录页 | 手机号+密码登录 | PRD第2章 |
| `/register` | 注册页 | 手机号+密码注册+邀请码 | PRD第2章 |
| `/partner/create` | 创建伴侣页 | 选择性格创建伴侣 | PRD第9章 |
| `/partner` | 伴侣主页 | 伴侣信息+好感度+角色切换 | PRD第9章 |
| `/chat` | 聊天页 | 与伴侣对话+情绪识别+陪伴模式切换 | PRD第15章 |
| `/simulation` | 模拟训练页 | 场景列表+解锁进度 | PRD第6章 |
| `/simulation/[id]` | 场景详情页 | 具体训练场景+对话选择 | PRD第6章 |
| `/growth` | 成长中心 | 积分+等级+情绪日记+每周报告 | PRD第17章 |
| `/profile` | 个人中心 | 设置+会员+礼物+邀请好友 | PRD第16章 |
| `/cbt` | CBT记录页 | 思维记录表+历史记录列表 | PRD第15章 |
| `/nvc` | NVC引导页 | 四步法引导+完整句子预览 | PRD第15章 |
| `/gifts` | 礼物商店页 | 礼物列表+送礼记录 | PRD第8章 |
| `/milestones` | 关系回忆录页 | 时间轴+情感羁绊可视化 | PRD第9章 |
| `/voice-call` | 语音通话页 | 语音通话+伴侣挂断 | PRD第11章 |
| `/beauty` | 变美联动页 | 数据同步+授权管理 | PRD第13章 |
| `/report/weekly` | 每周报告页 | 报告详情+分享 | PRD第17章 |
| `/onboarding` | 快速体验页 | 冷启动脚本+送礼+情绪感知 | PRD第5章 |

### 9.2 核心组件

| 组件 | 说明 | 关联页面 |
|------|------|----------|
| `ChatBubble` | 聊天消息气泡 | `/chat` |
| `ProgressBar` | 好感度进度条 | `/partner`, `/chat` |
| `RadarChart` | 社交能力雷达图 | `/growth` |
| `CheckInButton` | 签到按钮 | `/` |
| `GiftCard` | 礼物卡片 | `/gifts`, `/chat` |
| `MilestoneTimeline` | 里程碑时间轴 | `/milestones` |
| `EmotionBadge` | 情绪标签 | `/chat`, `/growth` |
| `AffectionLevelBadge` | 好感度等级徽章 | `/partner`, `/chat` |
| `SceneCard` | 场景卡片 | `/simulation` |
| `TrainingOption` | 训练选项按钮 | `/simulation/[id]` |
| `CbStepForm` | CBT步骤表单 | `/cbt` |
| `NvcStepForm` | NVC步骤表单 | `/nvc` |
| `VoiceCallPanel` | 语音通话面板 | `/voice-call` |
| `WeeklyReportCard` | 每周报告卡片 | `/report/weekly` |
| `CharacterSwitcher` | 角色切换器 | `/partner`, `/` |
| `InvitationCard` | 邀请码卡片 | `/profile` |
| `ConsentModal` | 授权弹窗 | `/beauty` |
| `TimeTravelButton` | 时空穿梭按钮 | `/chat`, `/simulation/[id]` |
| `NightlyPlayer` | 晚安播放器 | `/`, `/growth` |
| `OnboardingFlow` | 快速体验流程 | `/onboarding` |
| `PartnerProfileModal` | 伴侣档案弹窗 | `/partner` |
| `PreferenceTag` | 喜好标签 | `/partner`, `/gifts` |
| `GiftStoreFilter` | 礼物商店筛选器 | `/gifts` |
| `CbtHistoryList` | CBT历史记录列表 | `/cbt` |
| `NvcSentencePreview` | NVC句子预览 | `/nvc` |
| `AffectionLevelUpModal` | 好感度升级弹窗 | `/chat`, `/partner` |
| `InviteCodeInput` | 邀请码输入框 | `/register`, `/profile` |

---

## 十、开发排期

### 10.1 总体排期（14周）

| 阶段 | 周数 | 内容 | 关联PRD章节 |
|------|------|------|------------|
| 阶段一 | 第1-2周 | 基础设施搭建+用户认证 | PRD第2章 |
| 阶段二 | 第3-4周 | AI伴侣系统+聊天功能+情感陪伴模式 | PRD第9、15章 |
| 阶段三 | 第5-6周 | 模拟训练系统+好感度+时空穿梭 | PRD第6、8章 |
| 阶段四 | 第7-8周 | CBT/NVC+情绪识别服务 | PRD第15章 |
| 阶段五 | 第9-10周 | 礼物系统+角色切换+关系回忆录 | PRD第8、9章 |
| 阶段六 | 第11周 | 社交裂变+邀请机制 | PRD第16章 |
| 阶段七 | 第12周 | 每周报告+情绪日记+晚安计划 | PRD第17章 |
| 阶段八 | 第13周 | 语音通话+变美联动+才艺系统 | PRD第11、13、10章 |
| 阶段九 | 第14周 | 测试+上线准备 | - |

### 10.2 详细排期

#### 第1周：项目初始化（PRD第2章）
- 搭建Next.js项目框架（App Router）
- 配置Prisma+SQLite/MySQL
- 初始化shadcn/ui组件库
- 创建用户认证基础架构
- 配置LLM引擎（DeepSeek+Ollama）

#### 第2周：用户认证（PRD第2章）
- 完成登录/注册功能（手机号+密码）
- 实现NextAuth配置
- 创建首页布局（签到+功能入口）
- 基础路由保护
- 邀请码注册支持

#### 第3周：AI伴侣系统（PRD第9章）
- 创建伴侣数据库模型（多角色支持）
- 实现创建伴侣API
- 伴侣性格选择页面（3种核心性格）
- 自动创建初始会话
- 伴侣档案页面（喜好隐藏机制）

#### 第4周：聊天功能+情感陪伴模式（PRD第15章）
- 实现聊天消息发送
- 集成LLM响应生成
- 聊天界面开发
- 消息历史展示
- 情感陪伴三种模式（树洞/建议/混合）
- 情绪强度检测+模式自动切换

#### 第5周：模拟训练系统（PRD第6章）
- 创建场景数据库模型
- 实现场景解锁逻辑（好感度门槛）
- 场景列表页面
- 训练流程开发（对话树+选项分支）
- 训练报告生成

#### 第6周：好感度系统+时空穿梭（PRD第8章）
- 好感度计算逻辑
- 好感度等级系统（5级）
- 签到功能
- 成长中心页面
- 时空穿梭触发条件
- 穿梭券管理

#### 第7周：CBT思维记录（PRD第15章）
- CBT数据库模型（5步流程）
- 5步填写流程（情境→想法→情绪→证据→替代想法）
- AI认知扭曲检测（5种类型）
- CBT记录页面
- 情绪强度对比

#### 第8周：NVC引导+情绪识别服务（PRD第15章）
- NVC数据库模型（4步法）
- 4步引导流程（观察→感受→需要→请求）
- AI实时反馈（区分观察vs评价）
- 完整句子预览功能
- 情绪识别服务（文本+语音+行为）
- 多模态融合公式

#### 第9周：礼物系统（PRD第8章）
- 礼物数据库模型（5级分级）
- 送礼API
- 好感度联动逻辑（符合喜好×1.5）
- 礼物商店页面
- 伴侣喜好逐步透露机制

#### 第10周：角色切换+关系回忆录（PRD第9章）
- 多角色支持（独立好感度/聊天记录）
- 角色切换API
- 角色管理页面
- 关系回忆录时间轴
- 情感羁绊可视化
- 里程碑系统

#### 第11周：社交裂变+邀请机制（PRD第16章）
- 邀请码机制
- 奖励规则（积分+穿梭券）
- 邀请记录管理
- 排行榜
- 邀请页面

#### 第12周：每周报告+情绪日记+晚安计划（PRD第17章）
- 周报生成逻辑
- LLM Prompt模板
- 情绪日记功能
- 主动关怀触发规则
- 晚安计划（语音+文字）
- 报告页面

#### 第13周：语音通话+变美联动+才艺系统（PRD第11、13、10章）
- 语音通话功能（月卡+）
- 伴侣挂断机制（5~10秒随机）
- 变美联动数据同步
- 数据授权流程
- 才艺系统（跳舞/唱歌）
- 才艺触发机制

#### 第14周：测试+上线
- 功能测试
- 性能优化
- 安全审计
- 部署上线
- 用户手册编写
- 安全审计
- 部署上线

---

## 十、会员定价方案

### 10.1 会员等级

| 等级 | 价格 | 核心权益 |
|------|------|----------|
| 免费版 | ¥0 | 基础聊天+每日3次训练+3张穿梭券/日 |
| 周卡 | ¥18 | 无限训练+无限穿梭券+高级礼物 |
| 月卡 | ¥68 | 周卡权益+语音通话+专属才艺 |
| 年卡 | ¥688 | 月卡权益+专属定制+优先客服 |

### 10.2 时空穿梭券规则

| 会员等级 | 每日穿梭券 | 是否无限 |
|----------|------------|----------|
| 免费版 | 3张 | ❌ |
| 周卡 | - | ✅ |
| 月卡 | - | ✅ |
| 年卡 | - | ✅ |

---

## 十一、合规与安全

### 11.1 隐私保护
- 端到端加密存储用户照片
- 用户可随时删除照片
- 不使用用户数据训练模型
- 提供标准/严格两种隐私模式

### 11.2 内容安全
- 敏感内容过滤
- 情绪危机干预引导
- 心理咨询师预约入口（紧急求助）
- 未成年人保护

### 11.3 数据合规
- 符合《个人信息保护法》
- 符合GDPR（如需海外部署）
- 变美联动数据脱敏处理
- 用户授权可随时撤销

---

## 十二、验收标准

### 12.1 功能验收（可量化）

| 编号 | 验收项 | 验收标准 |
|------|--------|----------|
| 1 | 用户登录 | 手机号+密码登录成功率100% |
| 2 | 创建伴侣 | 可成功创建伴侣并生成初始会话 |
| 3 | 聊天功能 | 消息发送延迟<3秒 |
| 4 | 模拟训练 | 场景解锁逻辑正确 |
| 5 | 好感度计算 | 好感度变化符合规则 |
| 6 | CBT记录 | 5步流程完整可用 |
| 7 | NVC引导 | AI反馈准确区分观察vs评价 |
| 8 | 情绪识别 | 文本情绪识别准确率≥80% |
| 9 | 礼物系统 | 送礼后好感度正确变化 |
| 10 | 角色切换 | 切换角色后数据独立 |
| 11 | 签到功能 | 连续签到天数正确统计 |
| 12 | 每周报告 | 每周一自动生成报告 |
| 13 | 主动关怀 | 根据时间/天气触发关怀 |
| 14 | 语音通话 | 通话延迟<500ms（月卡+） |
| 15 | 时空穿梭 | 对话中可触发时空穿梭 |

### 12.2 性能验收

| 指标 | 目标值 |
|------|--------|
| 首屏加载时间 | <2秒 |
| API响应时间 | <1秒 |
| Lighthouse评分 | ≥90分 |
| 并发承载 | 10万 DAU |

---

## 十三、风险评估

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|----------|
| LLM成本超支 | 中 | 高 | 按会员等级分级使用，设置调用限额 |
| 用户留存率低 | 中 | 高 | 完善主动关怀机制，优化冷启动体验 |
| 内容合规风险 | 低 | 高 | 敏感内容过滤，情绪危机干预 |
| 语音通话质量 | 中 | 中 | 选择可靠RTC服务商，优化网络环境 |
| 才艺版权问题 | 低 | 高 | 使用原创内容+公共领域素材 |

---

## 十四、补充规格说明

### 14.1 快速体验详细脚本（PRD第5.2节）

```typescript
interface QuickExperienceStep {
  round: number;
  aiMessage: string;
  options: { label: string; value: string; quality: 'safe' | 'good' | 'cold' }[];
}

const quickExperienceScript: QuickExperienceStep[] = [
  {
    round: 1,
    aiMessage: '这家店的拿铁很出名，你平时喜欢喝什么？',
    options: [
      { label: '我更喜欢美式', value: '美式', quality: 'safe' },
      { label: '你推荐的这个听起来不错，我试试', value: '拿铁', quality: 'good' },
      { label: '我不喝咖啡', value: '不喝', quality: 'cold' },
    ],
  },
  {
    round: 2,
    aiMessage: '周末一般怎么过？',
    options: [
      { label: '宅家休息', value: '宅家', quality: 'safe' },
      { label: '最近在学做咖啡，还挺有意思的', value: '学咖啡', quality: 'good' },
      { label: '没什么', value: '没什么', quality: 'cold' },
    ],
  },
  {
    round: 3,
    aiMessage: '我最近在看一本书，特别有意思...',
    options: [
      { label: '什么书？', value: '追问', quality: 'good' },
      { label: '是吗', value: '回应', quality: 'safe' },
      { label: '哦', value: '冷淡', quality: 'cold' },
    ],
  },
];

interface GiftInteraction {
  triggerRound: number;
  giftOptions: { id: number; name: string; affectionChange: number; imageUrl: string }[];
  successMessage: string;
  failureMessage: string;
}

const giftInteraction: GiftInteraction = {
  triggerRound: 3,
  giftOptions: [
    { id: 1, name: '一束鲜花', affectionChange: 5, imageUrl: '/assets/gifts/flower.png' },
    { id: 2, name: '一杯奶茶', affectionChange: 8, imageUrl: '/assets/gifts/milk-tea.png' },
  ],
  successMessage: '{{partnerName}}开心地收下了你的礼物！',
  failureMessage: '{{partnerName}}似乎不太喜欢这个...',
};

interface EmotionAwarenessStep {
  prompt: string;
  emotionOptions: { label: string; value: string; intensity: number }[];
  feedbackMessage: string;
}

const emotionAwarenessStep: EmotionAwarenessStep = {
  prompt: '刚才的对话让你感觉怎么样？',
  emotionOptions: [
    { label: '很开心', value: 'happy', intensity: 8 },
    { label: '有点紧张', value: 'nervous', intensity: 4 },
    { label: '还好', value: 'neutral', intensity: 3 },
  ],
  feedbackMessage: '了解自己的情绪是提升社交能力的第一步！',
};
```

### 14.2 训练场景解锁条件（PRD第6章补充）

| 阶段 | 解锁条件 | 场景数量 |
|------|----------|----------|
| 阶段一 | 默认解锁 | 2 |
| 阶段二 | 完成阶段一全部场景 + 好感度≥50 | 2 |
| 阶段三 | 完成阶段二全部场景 + 好感度≥100 | 2 |
| 阶段四 | 完成阶段三全部场景 + 好感度≥200 | 3 |
| 阶段五 | 完成阶段四全部场景 + 好感度≥400 | 3 |

```typescript
function checkSceneUnlock(userId: string, sceneId: number): { unlocked: boolean; reason?: string } {
  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) }, include: { affection: true } });
  const scene = await prisma.socialScene.findUnique({ where: { id: sceneId } });

  if (!scene) return { unlocked: false, reason: '场景不存在' };

  const completedScenes = await prisma.trainingRecord.count({
    where: { userId: parseInt(userId), sceneId: { in: getScenesByStage(scene.stage - 1) } },
  });

  const requiredScenes = await prisma.socialScene.count({ where: { stage: scene.stage - 1 } });

  if (scene.stage === 1) return { unlocked: true };

  if (completedScenes < requiredScenes) {
    return { unlocked: false, reason: `需完成阶段${scene.stage - 1}全部场景` };
  }

  if ((user.affection?.score || 0) < scene.unlockAffection) {
    return { unlocked: false, reason: `好感度需达到${scene.unlockAffection}` };
  }

  return { unlocked: true };
}
```

### 14.3 语音通话"伴侣挂断"机制（PRD第10章补充）

| 条件 | 行为 |
|------|------|
| 好感度 < 15 | 伴侣主动挂断电话 |
| 用户使用不当语言 | 伴侣主动挂断电话 |
| 挂断后 | 生成分析报告，展示问题所在 |
| 用户选择 | 提供时空穿梭重新通话的选项 |

**不当语言定义**：

| 类别 | 说明 | 示例 |
|------|------|------|
| 敏感词 | 包含敏感词库中的词语 | 见合规文档敏感词库 |
| 人身攻击 | 包含人身攻击类词语 | "笨蛋"、"傻瓜"、"白痴"、"神经病"等 |
| 侮辱性词语 | 包含侮辱性或贬低性词语 | "垃圾"、"废物"、"恶心"等 |

**不当语言检测实现**：
```typescript
function containsInappropriateLanguage(message: string): boolean {
  const sensitiveWords = getSensitiveWordsFromConfig();
  const personalAttackWords = ['笨蛋', '傻瓜', '白痴', '神经病', '脑残', '智障'];
  const insultWords = ['垃圾', '废物', '恶心', '去死', '滚'];

  const allBadWords = [...sensitiveWords, ...personalAttackWords, ...insultWords];

  return allBadWords.some(word => message.includes(word));
}
```

```typescript
interface VoiceCallResult {
  success: boolean;
  durationMinutes?: number;
  hungUpByPartner?: boolean;
  analysis?: {
    issues: string[];
    suggestions: string[];
    affectionChange: number;
  };
}

async function handleVoiceCallEnd(userId: string, durationMinutes: number): Promise<VoiceCallResult> {
  const affection = await prisma.affection.findUnique({ where: { userId: parseInt(userId) } });

  if (!affection || affection.score < 15) {
    const analysis = await generateCallAnalysis(userId);

    await prisma.affection.update({
      where: { userId: parseInt(userId) },
      data: { score: Math.max(0, affection.score - 5) },
    });

    return {
      success: false,
      hungUpByPartner: true,
      analysis,
    };
  }

  await prisma.affection.update({
    where: { userId: parseInt(userId) },
    data: { score: Math.min(2000, affection.score + 5 * durationMinutes) },
  });

  return { success: true, durationMinutes };
}
```

### 14.4 时空穿梭对话中触发（PRD第11章补充）

| 触发场景 | 行为 |
|----------|------|
| 对话中好感度下降 > 10 | 自动弹出时空穿梭选项 |
| 用户主动请求"我想重来" | 立即弹出时空穿梭选项 |
| 用户确认 | 回到上一句对话之前 |
| 用户选择其他回复 | 好感度重新计算 |

**用户主动请求处理**：
- 对话输入框旁边添加"重来"按钮（图标：↺）
- 用户点击后检查是否有穿梭券
- 有券：直接回到上一句
- 无券：提示"需要时空穿梭券才能重来"，引导购买

**穿梭后好感度恢复规则**：
- 撤回之前的好感度变化（恢复到穿梭前的数值）
- 用户选择新回复后，重新计算好感度变化
- 若新回复质量更高，好感度增加更多
- 若新回复质量更低，好感度减少更多

**数据回滚范围**：

| 数据类型 | 是否回滚 | 说明 |
|----------|----------|------|
| 好感度 | ✅ 是 | 恢复到选择前的数值 |
| 对话内容 | ❌ 否 | 对话历史保留，不回滚 |
| 错误选项 | ❌ 不删除 | 在对话历史中保留但标记为"已回溯"（isRetroactive=true） |
| 新选项 | ✅ 追加 | 用户重新选择后，新选项追加到对话历史 |

**穿梭次数限制**：
- 每次对话最多可穿梭3次
- 3次后"重来"按钮变灰，显示"今日已用完"
- 每日0点重置穿梭次数

```typescript
interface TimeTravelTrigger {
  triggerCondition: (affectionChange: number) => boolean;
  showModal: boolean;
  message: string;
}

const timeTravelConfig: TimeTravelTrigger = {
  triggerCondition: (change) => change < -10,
  showModal: true,
  message: '刚才的回应让TA不太开心，要回到上一句重新选择吗？',
};

async function checkTimeTravelTrigger(userId: string, affectionChange: number): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });

  if (user.tickets <= 0) return false;

  return timeTravelConfig.triggerCondition(affectionChange);
}
```

### 14.5 变美联动数据边界（PRD第12章补充）

**可共享数据**：
- 训练场景偏好（脱敏后）
- 风格标签（脱敏后）

**不可共享数据**：
- 对话内容
- 真实照片
- 好感度数据

**授权机制**：
- 共享前弹出授权确认
- 用户可随时撤销授权

```typescript
interface BeautyLinkData {
  scenePreferences: string[];
  styleTags: string[];
}

interface SharingConsent {
  userId: string;
  hasConsent: boolean;
  consentedAt?: DateTime;
  revokedAt?: DateTime;
}

async function shareBeautyLinkData(userId: string): Promise<{ success: boolean; data?: BeautyLinkData }> {
  const consent = await prisma.sharingConsent.findUnique({ where: { userId: parseInt(userId) } });

  if (!consent || !consent.hasConsent) {
    return { success: false };
  }

  const preferences = await analyzeUserPreferences(userId);

  const data: BeautyLinkData = {
    scenePreferences: preferences.sceneIds,
    styleTags: preferences.styleTags.map(tag => maskTag(tag)),
  };

  await fetch('https://api.yuejiyanzhi.com/v1/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return { success: true, data };
}
```

### 14.6 才艺歌词版权合规（PRD第9章补充）

| 歌词来源 | 版权归属 | 是否可商用 |
|----------|----------|------------|
| LLM生成原创歌词 | 平台所有（合同约定） | ✅ |
| 公共领域歌词（作者去世50年以上） | 无版权 | ✅ |
| 有版权流行歌曲歌词 | 版权方所有 | ❌ |

```typescript
const copyrightRules = {
  allowOriginalLyrics: true,
  allowPublicDomain: true,
  allowCopyrighted: false,
  publicDomainThresholdYears: 50,
};

async function generateLyrics(prompt: string, userId: string): Promise<{ lyrics: string; copyrightSource: string }> {
  const lyrics = await llmProxy.request(userId, [{
    role: 'system',
    content: '请生成一首原创歌词，确保不包含任何现有歌曲的歌词内容',
  }, { role: 'user', content: prompt }]);

  return {
    lyrics: lyrics.content,
    copyrightSource: 'original',
  };
}
```

### 14.7 周卡"无限票"定义（PRD第15章补充）

| 会员等级 | "票"指代 | 数量限制 |
|----------|----------|----------|
| 免费用户 | 时空穿梭券 | 3张/日 |
| 周卡会员 | 时空穿梭券 | 无限 |
| 月卡会员 | 时空穿梭券 | 无限 |
| 年卡会员 | 时空穿梭券 | 无限 |

```typescript
interface TicketConfig {
  membershipType: number;
  dailyLimit: number;
  weeklyLimit: number;
  isUnlimited: boolean;
}

const ticketConfigs: TicketConfig[] = [
  { membershipType: 0, dailyLimit: 3, weeklyLimit: 21, isUnlimited: false },
  { membershipType: 1, dailyLimit: 0, weeklyLimit: 0, isUnlimited: true },
  { membershipType: 2, dailyLimit: 0, weeklyLimit: 0, isUnlimited: true },
  { membershipType: 3, dailyLimit: 0, weeklyLimit: 0, isUnlimited: true },
];
```

### 14.8 情绪日记与训练报告的区别（PRD补充）

| 维度 | 训练报告 | 情绪日记 |
|------|----------|----------|
| 内容 | 技能维度评分 | 情绪状态感知 |
| 来源 | 规则引擎+LLM | LLM分析 |
| 用途 | 量化能力提升 | 情绪自我觉察 |
| 生成时机 | 每次训练结束后 | 每次训练结束后 |
| 展示位置 | 成长页Tab4 | 成长页Tab4（并列显示） |

```typescript
interface TrainingReport {
  id: number;
  userId: number;
  sceneName: string;
  scores: { dimension: string; score: number }[];
  suggestions: string[];
  generatedAt: DateTime;
}

interface EmotionalDiary {
  id: number;
  userId: number;
  emotionType: string;
  emotionScore: number;
  perception: string;
  suggestions: string[];
  generatedAt: DateTime;
}
```

### 14.9 每周报告生成逻辑（PRD第16章补充）

**报告生成时机**：每周一早上8点自动生成

**生成流程**：
1. 收集本周训练数据（完成场景数、各维度得分）
2. 收集本周情绪记录（情绪类型分布）
3. 收集本周聊天互动（消息数、语音通话次数）
4. LLM根据模板生成报告内容

**LLM Prompt模板**：
```typescript
const weeklyReportPrompt = `你是一位专业的社交技能教练，请根据以下用户数据生成一份每周社交报告：

用户本周数据：
- 完成训练场景：{{completedScenes}}个
- 平均技能评分：{{avgScore}}分
- 技能维度进步：{{dimensionImprovements}}
- 情绪状态分布：{{emotionDistribution}}
- 聊天互动次数：{{chatCount}}次
- 语音通话时长：{{voiceDuration}}分钟

请按照以下结构生成报告：
1. 本周概览：用一句温暖的话总结本周表现
2. 能力变化：展示各维度的进步或需要改进的地方
3. 情绪觉察：分析用户本周的情绪状态
4. 伴侣寄语：以伴侣身份给出鼓励和建议
5. 下周建议：提供具体的训练建议

报告语气要温暖、鼓励、专业，字数控制在300字以内。`;
```

### 14.10 分手后数据保留规则（PRD第7章补充）

| 数据类型 | 分手后处理 | 保留期限 |
|----------|------------|----------|
| 聊天记录 | 保留，但不可访问 | 30天（可申请恢复） |
| 好感度数据 | 清零 | 立即 |
| 记忆数据 | 清除 | 立即 |
| 训练记录 | 保留 | 永久 |
| CBT/NVC记录 | 保留 | 永久 |
| 礼物记录 | 保留 | 永久 |

**新伴侣初始状态**：
- 好感度：0（Lv.1）
- 聊天记录：空
- 记忆：空
- 训练进度：继承之前的训练记录

```typescript
interface BreakupResult {
  success: boolean;
  deletedData: string[];
  preservedData: string[];
  newPartnerInitialState?: Partner;
}

async function handleBreakup(userId: string): Promise<BreakupResult> {
  await prisma.affection.update({
    where: { userId: parseInt(userId) },
    data: { score: 0, level: 1 },
  });

  await prisma.chatSession.deleteMany({ where: { userId: parseInt(userId) } });

  const preservedData = ['训练记录', 'CBT记录', 'NVC记录', '礼物记录', '签到记录'];

  return {
    success: true,
    deletedData: ['聊天记录', '记忆数据'],
    preservedData,
  };
}
```

### 14.11 真实照片隐私保护（PRD第5章补充）

**隐私保护措施**：
- 端到端加密存储
- 仅用于生成用户自己的数字人
- 用户可随时删除照片
- 承诺不用于模型训练

**两种隐私模式**：

| 模式 | 照片用途 | 数据保留 | 共享 |
|------|----------|----------|------|
| 标准模式 | 生成数字人头像 | 7天（自动删除原始照片） | 不共享 |
| 严格模式 | 生成数字人头像 | 立即删除原始照片 | 不共享 |

```typescript
interface PhotoPrivacyMode {
  mode: 'standard' | 'strict';
  retentionDays: number;
  allowTraining: boolean;
  allowSharing: boolean;
}

const privacyModes: Record<string, PhotoPrivacyMode> = {
  standard: { mode: 'standard', retentionDays: 7, allowTraining: false, allowSharing: false },
  strict: { mode: 'strict', retentionDays: 0, allowTraining: false, allowSharing: false },
};
```

### 14.12 AI主动关怀完整规则（PRD第8章补充）

**触发条件**：

| 感知类型 | 条件 | 关怀内容 |
|----------|------|----------|
| 时间感知 | 早上7:00-9:00 | 早安问候+天气提醒 |
| 时间感知 | 中午11:30-13:00 | 午饭提醒 |
| 时间感知 | 下午17:00-19:00 | 下班问候 |
| 时间感知 | 晚上21:00-23:00 | 晚安提醒 |
| 天气感知 | 天气变化（下雨/降温） | 出行提醒 |
| 行为感知 | 深夜在线（>23:00） | 提醒休息 |
| 行为感知 | 7天未登录 | 挽回任务推送 |
| 行为感知 | 连续训练失败 | 鼓励+建议 |
| 用户状态感知 | 情绪低落（连续3天消极情绪） | 主动关怀对话 |

```typescript
interface CareTrigger {
  type: 'time' | 'weather' | 'behavior' | 'emotion';
  condition: () => boolean;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

const careTriggers: CareTrigger[] = [
  {
    type: 'time',
    condition: () => {
      const hour = new Date().getHours();
      return hour >= 7 && hour < 9;
    },
    message: '早上好呀！今天天气{{weather}}，记得吃早餐哦~',
    priority: 'medium',
  },
  {
    type: 'behavior',
    condition: async (userId) => {
      const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
      if (!user.lastActive) return false;
      const daysSinceActive = (new Date().getTime() - user.lastActive.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive >= 7;
    },
    message: '好久不见啦，我很想你~ 要不要来看看我？',
    priority: 'high',
  },
];
```

---

## 十五、文档关系说明

| 文档 | 版本 | 说明 |
|------|------|------|
| 《项目计划书》 | v6.2 | 主文档：开发团队照做 |
| 《PRD》 | v1.1 | 补充文档：在主文档基础上补充细节，并行使用 |
| 《开发计划》 | v1.1 | 本文档：技术实现方案+排期 |

---

## 十六、PRD v1.1 缺失内容补全对照表

| 序号 | 缺失内容 | PRD章节 | 开发文档位置 | 状态 |
|------|----------|---------|-------------|------|
| 1 | 情感陪伴模式（树洞/建议/混合） | 第15章 | 第四章4.3节+第4周排期 | ✅ |
| 2 | CBT思维记录表完整规格 | 第15章 | 第六章+第7周排期 | ✅ |
| 3 | NVC四步法可视化引导完整规格 | 第15章 | 第七章+第8周排期 | ✅ |
| 4 | 情绪识别服务完整规格 | 第15章 | 第五章+第8周排期 | ✅ |
| 5 | 语音通话"伴侣挂断"机制 | 第11章 | 14.3节+第13周排期 | ✅ |
| 6 | 礼物/道具系统 | 第8章 | 第四章4.5节+第9周排期 | ✅ |
| 7 | 才艺版权合规说明 | 第10章 | 14.6节+第13周排期 | ✅ |
| 8 | 角色切换与关系回忆录 | 第9章 | 第四章4.6节+第10周排期 | ✅ |
| 9 | 变美联动数据边界 | 第13章 | 14.5节+第13周排期 | ✅ |
| 10 | 社交裂变与好友邀请 | 第16章 | 第四章4.7节+第11周排期 | ✅ |
| 11 | 时空穿梭对话中触发 | 第8章 | 14.4节+第6周排期 | ✅ |
| 12 | 每周报告生成逻辑 | 第17章 | 14.9节+第12周排期 | ✅ |
| 13 | 快速体验详细脚本 | 第5章 | 14.1节+第2周排期 | ✅ |
| 14 | 训练场景解锁条件 | 第6章 | 14.2节+第5周排期 | ✅ |
| 15 | 周卡"无限票"定义 | 第8章 | 14.7节+会员定价方案 | ✅ |
| 16 | 情绪日记与训练报告区别 | 第17章 | 14.8节+第12周排期 | ✅ |
| 17 | 分手后数据保留规则 | 第7章 | 14.10节+第6周排期 | ✅ |
| 18 | 真实照片隐私保护 | 第5章 | 14.11节+合规与安全 | ✅ |
| 19 | AI主动关怀完整规则 | 第8章 | 14.12节+第12周排期 | ✅ |
| 20 | 晚安计划功能 | 第17章 | 第八章8.13节+第12周排期 | ✅ |

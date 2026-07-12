# 后端开发文档

> 版本：v3.2  
> 适用对象：后端开发团队  
> 技术栈：Node.js + Express + MySQL 8.0 + Redis 7.0 + Milvus

---

## 目录

1. [技术架构](#1-技术架构)
2. [项目结构](#2-项目结构)
3. [数据库设计](#3-数据库设计)
4. [API接口设计](#4-api接口设计)
5. [LLM混合路由引擎](#5-llm混合路由引擎)
6. [数字人引擎](#6-数字人引擎)
7. [模拟引擎](#7-模拟引擎)
8. [好感度引擎](#8-好感度引擎)
9. [记忆系统](#9-记忆系统)
10. [才艺服务](#10-才艺服务)
11. [语音通话服务](#11-语音通话服务)
12. [时空穿梭服务](#12-时空穿梭服务)
13. [成长服务](#13-成长服务)
14. [依恋风格分析](#14-依恋风格分析)
15. [情绪识别服务](#15-情绪识别服务)
16. [用户自定义角色系统](#16-用户自定义角色系统)
17. [合规与安全](#17-合规与安全)
18. [定时任务](#18-定时任务)
19. [WebSocket协议](#19-websocket协议)
20. [CBT思维记录服务](#20-cbt思维记录服务)
21. [NVC引导服务](#21-nvc引导服务)

---

## 1. 技术架构

### 1.1 技术选型

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
| 限流 | express-rate-limit | API速率限制 |
| 内容审核 | 第三方审核API | 敏感词过滤、内容风控 |

### 1.2 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                      客户端层 (iOS/Android)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 数字人渲染│ │ 实时音视频│ │   UI层   │ │ 本地缓存 │          │
│  │ (Spine 2D)│ │  (RTC)   │ │(Flutter) │ │ (Hive)  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└───────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS/WSS
┌───────────────────────────▼─────────────────────────────────────┐
│                      API网关层 (Nginx)                          │
│              认证鉴权 / 限流 / 日志 / 路由                       │
└───────────────────────────┬─────────────────────────────────────┘
                             │
┌───────────────────────────▼─────────────────────────────────────┐
│                        业务服务层 (Node.js)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │  用户服务    │ │  数字人引擎  │ │  模拟引擎   │               │
│  │ (注册/登录/  │ │ (对话/人格/  │ │ (场景/反馈/  │               │
│  │  会员/实名)  │ │  记忆/好感)  │ │  评估)      │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │  才艺服务    │ │  语音服务   │ │  联动服务   │               │
│  │ (生成/库管理)│ │ (RTC/TTS)  │ │ (悦己颜值社)│               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└───────────────────────────┬─────────────────────────────────────┘
                             │
┌───────────────────────────▼─────────────────────────────────────┐
│                       数据层                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ MySQL    │ │ Redis    │ │ Milvus   │ │  OSS     │          │
│  │ (业务)   │ │ (缓存)   │ │ (向量)   │ │ (图片)   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 核心设计原则

| 原则 | 说明 |
|------|------|
| 模块化 | 按业务领域拆分独立服务模块 |
| 可扩展 | LLM路由、数字人渲染支持多供应商切换 |
| 高性能 | Redis缓存热点数据、Milvus向量检索 |
| 安全性 | JWT认证、输入验证、敏感词过滤、防沉迷 |
| 合规性 | 严格遵循《人工智能拟人化互动服务管理暂行办法》 |

---

## 2. 项目结构

```
backend/
├── src/
│   ├── app.js                    # Express应用入口
│   ├── config/                   # 配置文件
│   │   ├── database.js           # MySQL数据库配置
│   │   ├── redis.js              # Redis配置
│   │   ├── milvus.js             # Milvus向量数据库配置
│   │   ├── llm.js                # LLM配置+混合路由
│   │   ├── tts.js                # TTS配置
│   │   ├── rtc.js                # RTC配置
│   │   └── config.js             # 全局配置
│   ├── middleware/               # 中间件
│   │   ├── auth.js               # JWT认证
│   │   ├── rateLimit.js          # 速率限制
│   │   ├── sensitive.js          # 敏感词过滤+CBT引导
│   │   ├── validation.js         # 输入验证
│   │   └── compliance.js         # 合规检查（防沉迷、年龄限制）
│   ├── routes/                   # 路由模块
│   │   ├── auth.js               # 认证路由
│   │   ├── user.js               # 用户路由
│   │   ├── companion.js          # 伴侣路由
│   │   ├── chat.js               # 对话路由
│   │   ├── scenes.js             # 场景路由
│   │   ├── simulation.js         # 模拟训练路由
│   │   ├── affection.js          # 好感度路由
│   │   ├── talent.js             # 才艺路由
│   │   ├── call.js               # 语音通话路由
│   │   ├── timetravel.js         # 时空穿梭路由
│   │   ├── growth.js             # 成长路由
│   │   ├── home.js               # 首页路由
│   │   ├── checkin.js            # 签到路由
│   │   └── link.js               # 联动路由
│   ├── controllers/              # 控制器
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── companionController.js
│   │   ├── chatController.js
│   │   ├── sceneController.js
│   │   ├── simulationController.js
│   │   ├── affectionController.js
│   │   ├── talentController.js
│   │   ├── callController.js
│   │   ├── timetravelController.js
│   │   ├── growthController.js
│   │   ├── homeController.js
│   │   ├── checkinController.js
│   │   └── linkController.js
│   ├── services/                 # 业务服务
│   │   ├── llmService.js         # LLM服务
│   │   ├── digitalHumanService.js # 数字人服务
│   │   ├── simulationService.js  # 模拟服务
│   │   ├── affectionService.js   # 好感度服务
│   │   ├── talentService.js      # 才艺服务
│   │   ├── ttsService.js         # TTS服务
│   │   ├── memoryService.js      # 记忆服务（Milvus）
│   │   ├── complianceService.js  # 合规服务
│   │   ├── attachmentService.js  # 依恋风格分析服务
│   │   └── checkinService.js     # 签到服务
│   ├── models/                   # 数据模型
│   │   ├── User.js
│   │   ├── Companion.js
│   │   ├── Affection.js
│   │   ├── Scene.js
│   │   ├── TrainingRecord.js
│   │   ├── ChatHistory.js
│   │   ├── InteractionRecord.js
│   │   ├── TimeTravelRecord.js
│   │   ├── LearningCard.js
│   │   ├── Moment.js
│   │   ├── GiftItem.js
│   │   ├── PointTransaction.js
│   │   ├── CheckIn.js
│   │   ├── NightlyGreeting.js
│   │   ├── EmotionDiary.js
│   │   └── WeeklyReport.js
│   ├── data/                     # 预设数据
│   │   ├── scenes.json           # 场景数据（6个MVP场景）
│   │   ├── moments.json          # 朋友圈模板（30条）
│   │   ├── talents.json          # 才艺数据
│   │   ├── cbtKeywords.json      # CBT关键词（14类）
│   │   ├── giftItems.json        # 礼物数据（9种）
│   │   └── memberships.json      # 会员配置
│   ├── utils/                    # 工具类
│   │   ├── logger.js             # 日志工具
│   │   ├── errorHandler.js       # 错误处理
│   │   ├── idempotent.js         # 幂等处理
│   │   ├── dateUtils.js          # 日期工具
│   │   └── sentiment.js          # 情感分析工具
│   └── cron/                     # 定时任务
│       ├── nightlyPlan.js        # 晚安计划（21:00）
│       ├── momentsGenerator.js   # 朋友圈生成（08:00）
│       ├── weeklyReport.js       # 每周报告（周一08:00）
│       └── weeklyReset.js        # 周统计重置（周一00:00）
├── package.json
├── .env.example
└── README.md
```

---

## 3. 数据库设计

### 3.1 核心数据表（19张）

#### 3.1.1 用户表 (users)

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
    real_name VARCHAR(50) COMMENT '真实姓名',
    id_card VARCHAR(18) COMMENT '身份证号-加密存储',
    age TINYINT COMMENT '年龄',
    is_minor BOOLEAN DEFAULT FALSE COMMENT '是否未成年人',
    membership_type TINYINT DEFAULT 0 COMMENT '0:体验版 1:基础会员 2:标准会员 3:尊享会员',
    membership_expire DATETIME COMMENT '会员到期时间',
    points INT DEFAULT 0 COMMENT '当前积分',
    weekly_simulations INT DEFAULT 15 COMMENT '本周剩余模拟次数',
    week_start DATE COMMENT '周期起始日',
    nickname VARCHAR(50) COMMENT '用户昵称',
    avatar_url VARCHAR(255) COMMENT '用户头像',
    referral_code VARCHAR(20) COMMENT '邀请码',
    referrer_id BIGINT COMMENT '邀请人ID',
    tickets INT DEFAULT 0 COMMENT '穿梭券数量',
    daily_usage_seconds INT DEFAULT 0 COMMENT '今日使用时长(秒)',
    last_active DATETIME COMMENT '最后活跃时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_age (age),
    INDEX idx_referral_code (referral_code),
    INDEX idx_membership_type (membership_type)
);
```

#### 3.1.2 伴侣配置表 (companion_config)

```sql
CREATE TABLE companion_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL COMMENT '用户ID',
    core_type VARCHAR(20) NOT NULL COMMENT '追寻者/守护者/流浪者/疗愈者',
    extroversion TINYINT COMMENT '1-10 外向程度',
    intuition TINYINT COMMENT '1-10 直觉程度',
    feeling TINYINT COMMENT '1-10 感性程度',
    judging TINYINT COMMENT '1-10 计划程度',
    relationship_origin VARCHAR(20) COMMENT '青梅竹马/大学同学/职场前辈/陌生人',
    flaw VARCHAR(50) COMMENT '小缺陷',
    name VARCHAR(20) COMMENT '伴侣名字',
    voice_type VARCHAR(20) COMMENT '音色类型',
    avatar_config JSON COMMENT '数字人形象配置',
    custom_role_config JSON COMMENT '用户自定义角色完整设定',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);
```

#### 3.1.3 亲密度表 (affection)

```sql
CREATE TABLE affection (
    user_id BIGINT PRIMARY KEY,
    level TINYINT DEFAULT 1 COMMENT '1-5级',
    score INT DEFAULT 0 COMMENT '当前好感度分值',
    trust_score INT DEFAULT 0 COMMENT '信赖值',
    attraction_score INT DEFAULT 0 COMMENT '吸引力值',
    rapport_score INT DEFAULT 0 COMMENT '默契值',
    charm_score INT DEFAULT 0 COMMENT '魅力值(联动激活)',
    daily_interaction_count INT DEFAULT 0 COMMENT '今日互动次数',
    last_interaction_date DATE COMMENT '最后互动日期',
    voice_call_used_today INT DEFAULT 0 COMMENT '今日语音通话次数',
    voice_call_free_used BOOLEAN DEFAULT FALSE COMMENT '是否已使用首次免费通话',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3.1.4 社交场景表 (social_scenes)

```sql
CREATE TABLE social_scenes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    scene_name VARCHAR(50) NOT NULL COMMENT '场景名称',
    stage TINYINT NOT NULL COMMENT '1-6 所属阶段',
    difficulty TINYINT DEFAULT 1 COMMENT '1-5 难度',
    estimated_time INT COMMENT '预计时长(分钟)',
    description TEXT COMMENT '场景描述',
    background TEXT COMMENT '背景设定',
    teaching_points JSON COMMENT '教学点列表',
    variables JSON COMMENT '场景变量',
    good_example TEXT COMMENT '好的回应示例',
    bad_example TEXT COMMENT '要避免的回应示例',
    good_outcome TEXT COMMENT '好的结果描述',
    bad_outcome TEXT COMMENT '坏的结果描述',
    unlock_affection INT DEFAULT 0 COMMENT '解锁所需好感度',
    is_paid BOOLEAN DEFAULT FALSE COMMENT '是否需要付费',
    dialogue_flow JSON COMMENT '对话树结构',
    evaluation_dimensions JSON COMMENT '评估维度',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stage (stage),
    INDEX idx_difficulty (difficulty),
    INDEX idx_unlock_affection (unlock_affection)
);
```

#### 3.1.5 训练记录表 (training_records)

```sql
CREATE TABLE training_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    scene_id BIGINT NOT NULL,
    duration INT COMMENT '训练时长(秒)',
    completion_rate DECIMAL(5,2) COMMENT '完成度 0-100',
    scores JSON COMMENT '各维度得分',
    feedback TEXT COMMENT 'AI教练反馈',
    affection_change INT COMMENT '好感度变化',
    learning_card_id BIGINT COMMENT '生成的学习卡片ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_scene_id (scene_id)
);
```

#### 3.1.6 对话记录表 (chat_history)

```sql
CREATE TABLE chat_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    session_type VARCHAR(20) COMMENT 'companion/simulation/call',
    role VARCHAR(10) COMMENT 'user/companion/coach',
    content TEXT COMMENT '对话内容',
    emotion_tag VARCHAR(20) COMMENT '情绪标签',
    affection_at_moment INT COMMENT '该时刻好感度',
    llm_provider VARCHAR(20) COMMENT 'LLM服务商',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_session (user_id, session_type),
    INDEX idx_created_at (created_at)
);
```

#### 3.1.7 互动记录表 (interaction_records)

```sql
CREATE TABLE interaction_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    companion_id BIGINT NOT NULL,
    interaction_type VARCHAR(20) COMMENT 'gift/dining/movie/activity',
    item_id BIGINT COMMENT '关联礼物/物品ID',
    affection_change INT COMMENT '好感度变化',
    was_successful BOOLEAN COMMENT '是否成功',
    ai_feedback TEXT COMMENT 'AI分析反馈',
    time_travel_used BOOLEAN DEFAULT FALSE COMMENT '是否使用时空穿梭',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_companion (user_id, companion_id)
);
```

#### 3.1.8 时空穿梭记录表 (time_travel_records)

```sql
CREATE TABLE time_travel_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    interaction_id BIGINT COMMENT '关联互动记录',
    reason TEXT COMMENT '出错原因分析',
    correct_choice TEXT COMMENT '正确选择指导',
    learning_card_id BIGINT COMMENT '生成的学习卡片ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);
```

#### 3.1.9 学习卡片表 (learning_cards)

```sql
CREATE TABLE learning_cards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    category VARCHAR(20) COMMENT '破冰技巧/共情回应/拒绝话术/道歉模板',
    title VARCHAR(50) COMMENT '卡片标题',
    error_analysis TEXT COMMENT '错误分析',
    correct_approach TEXT COMMENT '正确做法',
    script_template TEXT COMMENT '话术模板',
    is_collected BOOLEAN DEFAULT FALSE COMMENT '是否收藏',
    scene_id BIGINT COMMENT '关联场景',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category)
);
```

#### 3.1.10 朋友圈动态表 (moments)

```sql
CREATE TABLE moments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    content VARCHAR(200) COMMENT '动态内容',
    template_id INT COMMENT '模板ID',
    likes_count INT DEFAULT 0 COMMENT '点赞数',
    comments JSON COMMENT '评论列表',
    created_at DATE DEFAULT CURRENT_DATE,
    INDEX idx_user_date (user_id, created_at)
);
```

#### 3.1.11 礼物道具表 (gift_items)

```sql
CREATE TABLE gift_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '名称',
    category VARCHAR(20) COMMENT 'gift/dining/movie/activity',
    tier TINYINT DEFAULT 1 COMMENT '1:基础 2:普通 3:精致 4:高级 5:奢华',
    price_points INT DEFAULT 0 COMMENT '积分价格',
    price_rmb DECIMAL(10,2) DEFAULT 0 COMMENT '人民币价格',
    membership_required TINYINT DEFAULT 0 COMMENT '0:无 1:基础会员 2:标准会员 3:尊享会员',
    affection_min INT DEFAULT 5 COMMENT '好感度最小值',
    affection_max INT DEFAULT 15 COMMENT '好感度最大值',
    ad_unlockable BOOLEAN DEFAULT FALSE COMMENT '是否可广告解锁',
    image_url VARCHAR(255) COMMENT '图标URL',
    compatible_personality JSON COMMENT '适配的人格类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.12 扣费日志表 (point_transactions)

```sql
CREATE TABLE point_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL COMMENT '操作类型',
    amount INT NOT NULL COMMENT '变化金额',
    balance_after INT NOT NULL COMMENT '操作后余额',
    idempotent_key VARCHAR(64) UNIQUE COMMENT '幂等键',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_idempotent_key (idempotent_key)
);
```

#### 3.1.13 签到表 (check_ins)

```sql
CREATE TABLE check_ins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    check_in_date DATE NOT NULL COMMENT '签到日期',
    streak INT DEFAULT 1 COMMENT '连续签到天数',
    reward_points INT DEFAULT 0 COMMENT '奖励积分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_date (user_id, check_in_date)
);
```

#### 3.1.14 晚安计划表 (nightly_greetings)

```sql
CREATE TABLE nightly_greetings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    content TEXT COMMENT '晚安内容',
    audio_url VARCHAR(255) COMMENT '语音URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

#### 3.1.15 情绪日记表 (emotion_diaries)

```sql
CREATE TABLE emotion_diaries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    scene_id BIGINT COMMENT '关联场景',
    content TEXT COMMENT '日记内容',
    emotion_score INT COMMENT '情绪评分(1-10)',
    insights TEXT COMMENT 'AI分析洞察',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

#### 3.1.16 每周报告表 (weekly_reports)

```sql
CREATE TABLE weekly_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    week_start DATE COMMENT '周起始日',
    total_trainings INT DEFAULT 0 COMMENT '本周训练次数',
    average_score DECIMAL(5,2) COMMENT '平均分',
    ability_changes JSON COMMENT '能力变化',
    partner_message TEXT COMMENT '伴侣寄语',
    recommendations JSON COMMENT '下周推荐',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_week_start (week_start)
);
```

#### 3.1.17 通话记录表 (call_records)

```sql
CREATE TABLE call_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    room_id VARCHAR(64) COMMENT 'RTC房间ID',
    status VARCHAR(20) COMMENT 'started/ended/aborted',
    duration INT COMMENT '通话时长(秒)',
    affection_change INT COMMENT '好感度变化',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    report TEXT COMMENT '通话分析报告',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_start_time (start_time)
);
```

#### 3.1.18 才艺记录表 (talent_records)

```sql
CREATE TABLE talent_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    talent_type VARCHAR(20) COMMENT 'poetry/joke/song/quote',
    content TEXT COMMENT '才艺内容',
    style VARCHAR(20) COMMENT '风格',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_talent_type (talent_type)
);
```

#### 3.1.19 会员购买记录表 (membership_purchases)

```sql
CREATE TABLE membership_purchases (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    membership_type TINYINT COMMENT '购买的会员类型',
    duration INT COMMENT '时长(天)',
    amount DECIMAL(10,2) COMMENT '支付金额',
    payment_method VARCHAR(20) COMMENT '支付方式',
    transaction_id VARCHAR(64) COMMENT '支付流水号',
    status VARCHAR(20) COMMENT 'pending/success/failed/refunded',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

### 3.1.20 CBT思维记录表 (cbt_records)

```sql
CREATE TABLE cbt_records (
    id VARCHAR(20) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    situation TEXT COMMENT '情境描述',
    thought TEXT COMMENT '自动思维',
    emotions JSON COMMENT '情绪列表',
    emotion_intensity_before INT COMMENT '情绪强度前(0-100)',
    evidence_for TEXT COMMENT '支持想法的证据',
    evidence_against TEXT COMMENT '反对想法的证据',
    alternative_thought TEXT COMMENT '替代思维',
    emotion_intensity_after INT COMMENT '情绪强度后(0-100)',
    detected_distortions JSON COMMENT '检测到的认知扭曲',
    ai_guidance TEXT COMMENT 'AI建议',
    status VARCHAR(20) DEFAULT 'draft' COMMENT 'draft/completed',
    scene_id BIGINT COMMENT '关联场景',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### 3.1.21 NVC引导记录表 (nvc_records)

```sql
CREATE TABLE nvc_records (
    id VARCHAR(20) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    observation TEXT COMMENT '观察',
    feeling TEXT COMMENT '感受',
    need TEXT COMMENT '需要',
    request TEXT COMMENT '请求',
    original_text TEXT COMMENT '原始表达',
    revised_text TEXT COMMENT '修正后的表达',
    correction JSON COMMENT '错误修正建议',
    status VARCHAR(20) DEFAULT 'draft' COMMENT 'draft/completed',
    scene_id BIGINT COMMENT '关联场景',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### 3.1.22 情绪记录表 (emotion_records)

```sql
CREATE TABLE emotion_records (
    id VARCHAR(20) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_type VARCHAR(20) COMMENT 'companion/simulation/call',
    source_type VARCHAR(20) COMMENT 'text/voice/behavior/fusion',
    raw_text TEXT COMMENT '原始文本(如有)',
    emotion_primary VARCHAR(20) COMMENT '主要情绪',
    emotion_secondary JSON COMMENT '次要情绪列表',
    intensity DECIMAL(3,2) COMMENT '强度 0-1',
    polarity VARCHAR(10) COMMENT 'positive/negative/neutral',
    confidence DECIMAL(3,2) COMMENT '置信度 0-1',
    trigger_mode VARCHAR(20) COMMENT 'tree/suggestion/mixed/forced_tree',
    features JSON COMMENT '详细特征数据',
    analysis_detail JSON COMMENT '各维度贡献度',
    recommended_response TEXT COMMENT '推荐回应',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_emotion (emotion_primary),
    INDEX idx_trigger_mode (trigger_mode)
);
```

### 3.2 Milvus向量数据库设计（记忆系统）

```json
{
  "collection_name": "companion_memory",
  "schema": {
    "id": {"type": "VARCHAR", "max_length": 64, "is_primary": true},
    "user_id": {"type": "INT64"},
    "embedding": {"type": "FLOAT_VECTOR", "dim": 768},
    "content": {"type": "VARCHAR", "max_length": 500},
    "memory_type": {"type": "VARCHAR", "max_length": 20},
    "importance": {"type": "FLOAT"},
    "related_topics": {"type": "ARRAY", "element_type": "VARCHAR"},
    "created_at": {"type": "DATETIME"},
    "last_accessed_at": {"type": "DATETIME"},
    "access_count": {"type": "INT32"}
  },
  "index": {
    "field_name": "embedding",
    "index_type": "IVF_FLAT",
    "metric_type": "COSINE",
    "params": {"nlist": 1024}
  }
}
```

---

## 4. API接口设计

### 4.1 用户与认证

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 发送验证码 | POST | /api/v1/auth/send_code | 手机号验证码 | `{"phone":"13800138000"}` | `{"success":true,"message":"验证码已发送","expire_seconds":300}` |
| 登录/注册 | POST | /api/v1/auth/login | 验证码登录 | `{"phone":"13800138000","code":"123456"}` | `{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","refresh_token":"xxx","user":{"id":1,"phone":"13800138000","nickname":"小雨","membership_type":0,"points":0,"tickets":1}}` |
| 实名认证 | POST | /api/v1/auth/verify | 公安系统实名 | `{"real_name":"张三","id_card":"110101199001011234"}` | `{"success":true,"age":36,"is_minor":false}` |
| 获取用户信息 | GET | /api/v1/user/info | 含会员状态 | - | `{"user":{"id":1,"phone":"13800138000","nickname":"小雨","avatar_url":"...","age":25,"is_minor":false},"membership":{"type":"体验版","expire":null,"weekly_simulations":15},"points":120,"tickets":3}` |
| 刷新Token | POST | /api/v1/auth/refresh | 刷新JWT | `{"refresh_token":"xxx"}` | `{"token":"xxx","refresh_token":"xxx"}` |
| 更新用户信息 | PUT | /api/v1/user/update | 修改昵称/头像 | `{"nickname":"小雨","avatar_url":"https://xxx"}` | `{"success":true,"user":{...}}` |
| 邀请好友 | POST | /api/v1/user/invite | 生成邀请链接 | `{"referral_code":"xxx"}` | `{"success":true,"bonus_points":50}` |
| 获取邀请记录 | GET | /api/v1/user/invites | 邀请好友列表 | - | `{"invites":[{"id":1,"phone":"13900139000","status":"registered","created_at":"2026-07-01"}]}` |

### 4.2 伴侣模块

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 创建伴侣 | POST | /api/v1/companion/create | 配置三层人格 | `{"core_type":"追寻者","extroversion":7,"feeling":8,"judging":6,"relationship_origin":"青梅竹马","name":"小晴"}` | `{"success":true,"companion":{"id":1,"name":"小晴","core_type":"追寻者","affection":{"level":1,"score":0}}}` |
| 获取伴侣信息 | GET | /api/v1/companion/info | 含亲密度数据 | - | `{"companion":{"id":1,"name":"小晴","core_type":"追寻者","voice_type":"default","relationship_origin":"青梅竹马"},"affection":{"level":3,"score":450,"trust_score":80,"attraction_score":75,"rapport_score":90}}` |
| 更新伴侣配置 | PUT | /api/v1/companion/update | 修改形象/声音 | `{"name":"小悦","voice_type":"治愈系"}` | `{"success":true,"companion":{...}}` |
| 获取伴侣状态 | GET | /api/v1/companion/status | 在线状态/今日动态 | - | `{"online":true,"today_moment":"今天路过一家花店...","daily_task":"完成一次场景训练"}` |
| 伴侣主动联系 | POST | /api/v1/companion/contact | 触发主动联系 | `{"type":"morning"}` | `{"success":true,"message":"早安！今天也要加油哦～","affection_change":1}` |
| 自定义角色 | POST | /api/v1/companion/customize | 创建自定义角色 | `{"role_name":"沈清欢","gender":"男","age":25,"core_personality":["温柔","文艺"],"relationship":"青梅竹马","nickname_for_user":"小雨"}` | `{"success":true,"companion":{...}}` |
| 数字人对话 | WebSocket | wss://api.yuni.app/ws/digital_human | 实时互动+流式输出 | - | 见17.1节 |

### 4.3 模拟训练模块

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 获取场景列表 | GET | /api/v1/scenes | 分类+难度筛选 | `?stage=1&difficulty=1` | `{"scenes":[{"id":1,"scene_name":"咖啡厅破冰","stage":1,"difficulty":1,"estimated_time":8,"is_unlocked":true,"teaching_points":["从环境开启话题"]}]}` |
| 获取场景详情 | GET | /api/v1/scenes/:id | 完整场景数据 | - | `{"scene":{"id":1,"scene_name":"咖啡厅破冰","background":"你在公司楼下咖啡厅排队...","dialogue_flow":[...]}}` |
| 开始模拟 | POST | /api/v1/simulation/start | 初始化模拟会话 | `{"scene_id":1}` | `{"success":true,"session_id":"sim_xxx","remaining_simulations":14}` |
| 模拟对话 | WebSocket | wss://api.yuni.app/ws/simulate | 场景对话+实时反馈 | - | 见17.2节 |
| 提交训练报告 | POST | /api/v1/simulation/report | 生成评估报告 | `{"scene_id":1,"duration":480,"choices":[...]}` | `{"success":true,"report":{"score":75,"dimensions":{"communication":85},"feedback":"很好的表现！","learning_card_id":123}}` |
| 重新挑战场景 | POST | /api/v1/simulation/retry | 不消耗次数重试 | `{"scene_id":1}` | `{"success":true}` |
| 获取训练记录 | GET | /api/v1/simulation/history | 训练历史列表 | `?page=1&limit=10` | `{"records":[{"id":1,"scene_id":1,"score":75,"duration":480,"created_at":"2026-07-05"}]}` |

### 4.4 好感度模块

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 获取好感度 | GET | /api/v1/affection | 当前好感度+等级 | - | `{"level":3,"score":450,"level_name":"知己","next_level_score":600,"trust_score":80,"attraction_score":75,"rapport_score":90}` |
| 赠送礼物 | POST | /api/v1/affection/gift | 赠送礼物+好感度变化 | `{"gift_id":1}` | `{"success":true,"affection_change":8,"new_score":458,"ai_feedback":"谢谢你的花，我很喜欢～"}` |
| 查看挽回任务 | GET | /api/v1/affection/crisis | 好感度归零挽回任务 | - | `{"status":"crisis","tasks":[{"id":1,"name":"认真道歉","completed":false},{"id":2,"name":"送符合喜好的礼物","completed":false}],"retry_count":3}` |
| 提交挽回任务 | POST | /api/v1/affection/save | 提交挽回任务 | `{"task_id":1,"content":"我错了，因为我没有考虑你的感受，以后我会更加注意"}` | `{"success":true,"task_completed":true}` |
| 结束关系 | POST | /api/v1/affection/end | 结束当前关系 | - | `{"success":true,"message":"关系已结束，你可以创建新的伴侣"}` |
| 获取礼物列表 | GET | /api/v1/affection/gifts | 礼物道具列表 | - | `{"gifts":[{"id":1,"name":"鲜花","tier":1,"price_points":50,"affection_min":5,"affection_max":8}]}` |

### 4.5 才艺模块

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 获取才艺列表 | GET | /api/v1/talents | 按类型获取 | `?type=song` | `{"talents":[{"type":"poetry","name":"写诗","description":"让TA为你写一首诗","cooldown":1800},{"type":"joke","name":"讲笑话","description":"听TA讲个笑话","cooldown":600}]}` |
| 触发才艺 | POST | /api/v1/talents/perform | 伴侣表演才艺 | `{"type":"song","style":"治愈系"}` | `{"success":true,"content":"在时光的长河中，我只为遇见你...","audio_url":"https://xxx/audio.mp3"}` |
| 点歌 | POST | /api/v1/talents/request | 用户点歌 | `{"song_id":1}` | `{"success":true,"song":{"id":1,"name":"小星星","lyrics":"一闪一闪亮晶晶...","audio_url":"https://xxx"}}` |
| 获取才艺记录 | GET | /api/v1/talents/history | 才艺表演历史 | - | `{"records":[{"id":1,"talent_type":"poetry","content":"...","created_at":"2026-07-05"}]}` |

### 4.6 语音通话模块

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 获取RTC Token | POST | /api/v1/call/token | 获取通话Token | - | `{"token":"xxx","room_id":"room_xxx","max_duration":180}` |
| 开始通话 | POST | /api/v1/call/start | 记录通话开始 | - | `{"success":true,"call_id":1,"room_id":"room_xxx"}` |
| 结束通话 | POST | /api/v1/call/end | 生成通话报告 | `{"duration":180,"affection_change":8}` | `{"success":true,"report":{"duration":180,"affection_change":8,"issues":[],"suggestions":["继续保持！"]}}` |
| 获取通话报告 | GET | /api/v1/call/report/:id | 通话详情 | - | `{"call":{"id":1,"duration":180,"affection_change":8,"report":{...}}}` |
| 获取通话记录 | GET | /api/v1/call/history | 通话历史 | `?page=1&limit=10` | `{"calls":[{"id":1,"duration":180,"affection_change":8,"created_at":"2026-07-05"}]}` |
| 获取通话权限 | GET | /api/v1/call/permission | 检查通话权限 | - | `{"can_call":true,"remaining_today":3,"max_duration":180}` |

### 4.7 时空穿梭模块

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 获取穿梭券余额 | GET | /api/v1/timetravel/tickets | 剩余穿梭券 | - | `{"tickets":3,"daily_limit":3,"available_ways":["每日登录","完成训练","积分兑换","看广告"]}` |
| 执行穿梭 | POST | /api/v1/timetravel/execute | 回到选择前 | `{"interaction_id":123}` | `{"success":true,"learning_card":{"id":1,"category":"破冰技巧","title":"从环境开启话题"},"affection_recovery":15}` |
| 获取学习卡片 | GET | /api/v1/timetravel/cards | 学习卡片列表 | `?category=破冰技巧` | `{"cards":[{"id":1,"category":"破冰技巧","title":"开放式问题","is_collected":false}]}` |
| 收藏学习卡片 | POST | /api/v1/timetravel/cards/collect | 收藏卡片 | `{"card_id":1}` | `{"success":true,"is_collected":true}` |
| 获取穿梭记录 | GET | /api/v1/timetravel/history | 穿梭历史 | - | `{"records":[{"id":1,"interaction_id":123,"created_at":"2026-07-05"}]}` |

### 4.8 成长模块

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 获取成长数据 | GET | /api/v1/growth | 雷达图+曲线数据 | - | `{"radar":{"dimensions":["沟通力","表达力","共情力","情绪控制","应变力"],"scores":[75,68,80,70,72],"total":73},"trend":[{"date":"2026-07-01","score":65},{"date":"2026-07-05","score":73}]}` |
| 获取里程碑 | GET | /api/v1/growth/milestones | 时间轴节点 | - | `{"milestones":[{"id":1,"title":"第一次训练","date":"2026-07-01","icon":"🎉"},{"id":2,"title":"连续签到7天","date":"2026-07-08","icon":"🔥"}]}` |
| 获取情绪日记 | GET | /api/v1/growth/diary | 情绪日记列表 | `?page=1&limit=10` | `{"diaries":[{"id":1,"content":"模拟面试虽然紧张但完成得不错","emotion_score":7,"created_at":"2026-07-05"}]}` |
| 获取每周报告 | GET | /api/v1/growth/weekly | 本周社交报告 | - | `{"report":{"week_start":"2026-07-01","total_trainings":5,"average_score":72,"ability_changes":{"沟通力":"+5%"},"partner_message":"本周你进步很大！"}}` |
| 获取依恋分析 | GET | /api/v1/growth/attachment | 依恋风格分析（月卡+） | - | `{"style":"secure","scores":{"secure":85,"anxious":20,"avoidant":15,"fearful":10},"suggestions":["保持现有互动模式"]}` |

### 4.9 首页模块

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 获取首页数据 | GET | /api/v1/home/dashboard | 签到天数+训练状态+推荐场景 | - | `{"greeting":"晚上好，小雨","streak":5,"today_checked":true,"weekly_progress":{"trained_days":3,"total_days":7,"percentage":43},"recommended_scene":{"id":1,"name":"咖啡厅破冰","difficulty":1,"estimated_time":8},"nightly_plan_available":true}` |
| 获取今日推荐 | GET | /api/v1/home/recommend | 今日推荐场景 | - | `{"scene":{"id":1,"name":"咖啡厅破冰","difficulty":1,"estimated_time":8,"description":"从环境开启话题"}}` |

### 4.10 签到模块

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 每日签到 | POST | /api/v1/checkin/daily | 签到+奖励 | - | `{"success":true,"streak":5,"reward_points":10,"message":"签到成功！连续签到5天"}` |
| 获取签到记录 | GET | /api/v1/checkin/history | 签到历史 | - | `{"records":[{"date":"2026-07-05","streak":5,"reward_points":10}]}` |
| 获取签到统计 | GET | /api/v1/checkin/stats | 连续签到天数等统计 | - | `{"current_streak":5,"total_checkins":30,"longest_streak":14}` |

### 4.11 联动模块

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 生成跳转Token | POST | /api/v1/link/jump | 生成悦己颜值社跳转Token | - | `{"success":true,"url":"https://yueji.com?token=xxx&source=yuni"}` |
| 检查联动状态 | GET | /api/v1/link/status | 检查悦己颜值社联动状态 | - | `{"linked":false,"app_installed":false}` |
| 同步形象数据 | POST | /api/v1/link/sync | 同步用户形象数据（用户授权后） | - | `{"success":true,"message":"形象数据已同步"}` |
| 获取联动入口文案 | GET | /api/v1/link/copy | 获取联动入口文案 | `?location=home` | `{"copy":"想从形象上提升社交自信？","button_text":"去悦己颜值社看看"}` |

### 4.12 CBT模块

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 创建CBT记录 | POST | /api/v1/cbt/create | 创建思维记录 | `{"situation":"面试前紧张","thought":"我肯定会搞砸","emotions":["焦虑","恐惧"],"emotion_intensity_before":80}` | `{"success":true,"record":{"id":"cbt_xxx","status":"draft"}}` |
| 更新CBT记录 | PUT | /api/v1/cbt/update | 更新记录 | `{"id":"cbt_xxx","evidence_for":"上次面试失败了","evidence_against":"我准备得很充分"}` | `{"success":true}` |
| 完成CBT记录 | POST | /api/v1/cbt/complete | 完成记录并获取AI分析 | `{"id":"cbt_xxx","alternative_thought":"我已经尽力准备了"}` | `{"success":true,"record":{"id":"cbt_xxx","status":"completed","detected_distortions":[...],"ai_guidance":"..."}}` |
| 获取CBT列表 | GET | /api/v1/cbt/list | CBT记录列表 | `?page=1&limit=10` | `{"records":[{"id":"cbt_xxx","situation":"...","created_at":"2026-07-05"}]}` |
| 获取CBT详情 | GET | /api/v1/cbt/detail/:id | 单条记录详情 | - | `{"record":{"id":"cbt_xxx","situation":"...","thought":"...","emotions":["焦虑"]}}` |
| 删除CBT记录 | DELETE | /api/v1/cbt/delete/:id | 删除记录 | - | `{"success":true}` |

### 4.13 NVC模块

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 创建NVC记录 | POST | /api/v1/nvc/create | 创建NVC引导记录 | `{"original_text":"你总是不回我消息","observation":"你昨天没回我消息","feeling":"难过","need":"被重视","request":"希望你忙的时候告诉我"}` | `{"success":true,"record":{"id":"nvc_xxx","status":"draft"}}` |
| 更新NVC记录 | PUT | /api/v1/nvc/update | 更新记录 | `{"id":"nvc_xxx","feeling":"失望"}` | `{"success":true}` |
| 分析原始表达 | POST | /api/v1/nvc/analyze | 分析原始表达并给出修正建议 | `{"text":"你总是不回我消息"}` | `{"analysis":{"has_criticism":true,"correction":"将'总是'改为具体描述","revised_text":"当你昨天没回我消息时，我感到难过，因为我需要被重视，你愿意忙的时候告诉我吗？"}}` |
| 完成NVC记录 | POST | /api/v1/nvc/complete | 完成记录 | `{"id":"nvc_xxx"}` | `{"success":true,"record":{"id":"nvc_xxx","status":"completed"}}` |
| 获取NVC列表 | GET | /api/v1/nvc/list | NVC记录列表 | `?page=1&limit=10` | `{"records":[{"id":"nvc_xxx","original_text":"...","created_at":"2026-07-05"}]}` |
| 获取NVC详情 | GET | /api/v1/nvc/detail/:id | 单条记录详情 | - | `{"record":{"id":"nvc_xxx","observation":"...","feeling":"...","need":"...","request":"..."}}` |

### 4.14 情绪识别模块

| 接口 | 方法 | 路径 | 说明 | 请求参数 | 响应示例 |
|------|------|------|------|---------|---------|
| 文本情绪分析 | POST | /api/v1/emotion/text | 分析文本情绪 | `{"text":"我好紧张，明天面试不知道会怎样"}` | `{"emotion":"焦虑","intensity":0.75,"confidence":0.82,"keywords":["紧张","不知道"]}` |
| 语音情绪分析 | POST | /api/v1/emotion/voice | 分析语音情绪（月卡+） | `{"audio_url":"https://xxx/audio.wav","duration":120}` | `{"emotion":"焦虑","intensity":0.68,"features":{"pitch_mean":180,"energy_std":0.25}}` |
| 行为情绪分析 | POST | /api/v1/emotion/behavior | 分析行为特征推断情绪 | `{"login_time":"23:47","recent_messages":12,"avg_length":8,"scene_avoidance_count":3}` | `{"inferred_emotion":"焦虑","intensity":0.65,"triggers":[{"behavior":"深夜登录","detail":"登录时间 23:47"}]}` |
| 综合情绪分析 | POST | /api/v1/emotion/fusion | 多模态融合分析 | `{"text":"我好紧张","voice_features":null,"behavior_data":{"login_time":"23:47"}}` | 见4.14.2节 |
| 获取情绪历史 | GET | /api/v1/emotion/history | 获取用户情绪变化趋势 | `?days=7` | `{"history":[{"date":"2026-07-01","emotion":"焦虑","intensity":0.7},{"date":"2026-07-02","emotion":"平静","intensity":0.3}]}` |
| 获取当前状态 | GET | /api/v1/emotion/status | 获取当前情绪状态机状态 | - | `{"state":"neutral","current_emotion":"平静","intensity":0.3}` |

#### 4.14.1 综合情绪分析请求

```json
{
  "text": "我好紧张，明天面试不知道会怎样",
  "voice_features": null,
  "behavior_data": {
    "login_time": "23:47",
    "recent_messages": 12,
    "avg_length": 8
  },
  "session_context": {
    "scene": "模拟面试",
    "affection_level": 3
  }
}
```

#### 4.14.2 综合情绪分析响应

```json
{
  "emotion": {
    "primary": "焦虑",
    "secondary": ["恐惧", "紧张"],
    "intensity": 0.78,
    "polarity": "负面",
    "confidence": 0.85
  },
  "trigger_mode": "混合模式",
  "recommended_response": "我注意到你有点紧张，能跟我说说具体在担心什么吗？",
  "analysis_detail": {
    "text_contribution": 0.45,
    "behavior_contribution": 0.20,
    "voice_contribution": 0.35
  }
}
```

---

## 5. LLM混合路由引擎

### 5.1 路由逻辑

```javascript
async function routeLLM(userId, userInput) {
    const user = await getUser(userId);
    
    if (!user) {
        return { provider: 'deepseek', reason: '未注册用户使用DeepSeek' };
    }
    
    switch (user.membership_type) {
        case 0:
            if (Math.random() < 0.1) {
                return { provider: 'deepseek', reason: '10%幸运偶遇' };
            }
            return { provider: 'ollama', reason: '免费用户使用Ollama' };
        
        case 1:
        case 2:
            return { provider: 'deepseek', reason: '会员使用DeepSeek' };
        
        case 3:
            return { provider: 'deepseek_high_priority', reason: '年卡用户使用DeepSeek高优' };
        
        default:
            return { provider: 'ollama', reason: '默认使用Ollama' };
    }
}
```

### 5.2 对话计数持久化

```javascript
async function getDialogueCount(userId) {
    const key = `yuni:dialogue_count:${userId}`;
    const cached = await redis.get(key);
    if (cached !== null) {
        return parseInt(cached);
    }
    return 0;
}

async function setDialogueCount(userId, count) {
    const key = `yuni:dialogue_count:${userId}`;
    await redis.set(key, count, 'EX', 604800);
}

async function incrementDialogueCount(userId) {
    const key = `yuni:dialogue_count:${userId}`;
    return await redis.incr(key);
}
```

### 5.3 免费额度检查

```javascript
async function checkFreeQuota(userId) {
    const user = await getUser(userId);
    if (user.membership_type !== 0) {
        return { allowed: true, reason: '会员用户无限制' };
    }
    
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `yuni:daily_simulations:${userId}:${today}`;
    const dailyCount = parseInt(await redis.get(dailyKey) || '0');
    
    if (dailyCount >= 15) {
        return { allowed: false, reason: '今日模拟次数已用完' };
    }
    
    return { allowed: true, remaining: 15 - dailyCount };
}
```

---

## 6. 数字人引擎

### 6.1 三层人格结构

```javascript
function buildPersonalityPrompt(config) {
    const coreTraits = {
        '追寻者': '渴望深度连接与被看见，非常在意细节，反复确认对方是否开心',
        '守护者': '渴望照顾和保护重要之人，把对方当小孩叮嘱，对方受伤时情绪波动大',
        '流浪者': '追逐新鲜感和精神自由，对话跳脱，需用智慧和有趣吸引',
        '疗愈者': '极度共情，渴望治愈他人，提供顶级安慰，但内心有敏感区域'
    };
    
    return {
        core_type: config.core_type,
        core_description: coreTraits[config.core_type],
        traits: {
            extroversion: config.extroversion,
            intuition: config.intuition,
            feeling: config.feeling,
            judging: config.judging
        },
        relationship: {
            origin: config.relationship_origin,
            nickname_for_user: config.nickname_for_user || '你'
        },
        current_state: {
            emotion: 'happy',
            affection_level: 'lv.1'
        },
        memory: []
    };
}
```

### 6.2 人格一致性校验

```javascript
async function validateResponse(response, personality, memory) {
    const checks = [
        checkToneMatch(response, personality.core_type),
        checkContentSafety(response),
        checkMemoryConsistency(response, memory),
        checkAffectionAppropriate(response, personality.current_state.affection_level),
        checkCompliance(response)
    ];
    
    return checks.every(check => check.passed);
}

function checkCompliance(response) {
    const sensitivePatterns = [
        /暧昧|性暗示|恋爱|结婚/g,
        /暴力|自杀|自残/g,
        /辱骂|威胁|恐吓/g
    ];
    
    for (const pattern of sensitivePatterns) {
        if (pattern.test(response.content)) {
            return { passed: false, reason: '内容不符合合规要求' };
        }
    }
    
    return { passed: true };
}
```

### 6.3 动作触发逻辑

```javascript
function triggerAction(emotion, affectionLevel, messageContent) {
    const actionMap = {
        'happy': ['A01', 'A02', 'A05', 'A19'],
        'sad': ['A18'],
        'surprised': ['A17'],
        'thinking': ['A06', 'A09', 'A20'],
        'grateful': ['A10', 'A15'],
        'worried': ['A07', 'A08']
    };
    
    let availableActions = actionMap[emotion] || ['A01', 'A02'];
    
    if (affectionLevel >= 3) {
        availableActions.push('A14', 'A22');
    }
    
    if (affectionLevel >= 5) {
        availableActions.push('A13', 'A25');
    }
    
    if (messageContent.includes('谢谢') || messageContent.includes('感谢')) {
        availableActions = ['A10', 'A15'];
    }
    
    if (messageContent.includes('对不起') || messageContent.includes('抱歉')) {
        availableActions = ['A10', 'A14'];
    }
    
    return availableActions[Math.floor(Math.random() * availableActions.length)];
}
```

---

## 7. 模拟引擎

### 7.1 场景对话流程

```javascript
async function processSimulationStep(userId, sceneId, nodeId, userChoice) {
    const scene = await Scene.findById(sceneId);
    const node = scene.dialogue_flow.find(n => n.round === nodeId);
    
    if (!node) {
        throw new Error('节点不存在');
    }
    
    const option = node.options.find(o => o.id === userChoice);
    
    if (!option) {
        throw new Error('选项不存在');
    }
    
    const cbtAnalysis = analyzeCBTKeywords(option.content);
    const feedback = {
        type: option.quality === 'high' ? 'positive' : 
              option.quality === 'medium' ? 'neutral' : 'negative',
        message: option.feedback,
        cbt_guidance: cbtAnalysis.guidance
    };
    
    const affectionChange = calculateAffectionChange(option);
    
    await updateAffection(userId, affectionChange);
    await saveTrainingProgress(userId, sceneId, nodeId, option, feedback);
    await saveChatHistory(userId, 'simulation', 'user', option.content, affectionChange);
    
    const nextRound = node.round + 1;
    const nextNode = scene.dialogue_flow.find(n => n.round === nextRound);
    
    return {
        aiResponse: nextNode?.ai_line || generateCompletion(scene, node, option),
        feedback,
        affectionChange,
        nextRound: nextNode?.round || null,
        isCompleted: !nextNode
    };
}
```

### 7.2 评分算法

```javascript
function calculateScore(sceneId, choices) {
    const config = scenarioConfigs[sceneId];
    let totalScore = 0;
    const dimensionScores = {
        communication: 0,
        expression: 0,
        empathy: 0,
        emotionControl: 0,
        adaptability: 0
    };
    
    const weights = config.weights || {
        communication: 0.2,
        expression: 0.2,
        empathy: 0.25,
        emotionControl: 0.15,
        adaptability: 0.2
    };
    
    choices.forEach((choice, index) => {
        const weight = weights[choice.dimension] || 0.2;
        const qualityMultiplier = {
            'high': 1.0,
            'medium': 0.6,
            'low': 0.2
        }[choice.quality] || 0.5;
        
        const roundMultiplier = 1 + (index * 0.1);
        
        const score = 100 * qualityMultiplier * weight * roundMultiplier;
        totalScore += score;
        
        if (dimensionScores[choice.dimension] !== undefined) {
            dimensionScores[choice.dimension] += score;
        }
    });
    
    const maxScore = choices.length * 100 * 0.25;
    
    return {
        total: Math.round(totalScore),
        dimensions: dimensionScores,
        percentage: Math.round((totalScore / maxScore) * 100)
    };
}
```

### 7.3 CBT关键词分析

```javascript
function analyzeCBTKeywords(text) {
    const cbtKeywords = require('../data/cbtKeywords.json');
    const findings = [];
    
    for (const [category, keywords] of Object.entries(cbtKeywords)) {
        for (const keyword of keywords) {
            if (text.includes(keyword.word)) {
                findings.push({
                    keyword: keyword.word,
                    category: category,
                    guidance: keyword.guidance,
                    severity: keyword.severity
                });
            }
        }
    }
    
    return {
        hasIssues: findings.length > 0,
        findings,
        guidance: findings.length > 0 ? findings[0].guidance : null
    };
}
```

---

## 8. 好感度引擎

### 8.1 好感度增减规则

```javascript
const AFFECTION_RULES = {
    high_quality_response: { min: 5, max: 15, daily_limit: 10, dimension: 'any' },
    neutral_response: { min: 0, max: 0, daily_limit: null, dimension: 'any' },
    low_quality_hurtful: { min: -10, max: -5, daily_limit: null, dimension: 'any' },
    low_quality_silent: { min: -8, max: -3, daily_limit: null, dimension: 'any' },
    time_travel_correction: { min: 10, max: 20, daily_limit: null, dimension: 'any' },
    gift_basic: { min: 5, max: 8, daily_limit: 3, dimension: 'attraction' },
    gift_standard: { min: 8, max: 12, daily_limit: null, dimension: 'attraction' },
    gift_premium: { min: 12, max: 30, daily_limit: 2, dimension: 'attraction' },
    gift_wrong: { min: -15, max: -5, daily_limit: null, dimension: 'attraction' },
    training_completed: { min: 5, max: 5, daily_limit: 3, dimension: 'trust' },
    streak_7_days: { min: 30, max: 30, daily_limit: null, dimension: 'rapport' },
    voice_call_good: { min: 3, max: 8, daily_limit: null, dimension: 'rapport' },
    voice_call_bad: { min: -5, max: -2, daily_limit: null, dimension: 'rapport' },
    moments_like: { min: 2, max: 3, daily_limit: 5, dimension: 'charm' },
    moments_comment: { min: 3, max: 5, daily_limit: 3, dimension: 'charm' },
    daily_greeting_respond: { min: 1, max: 3, daily_limit: 5, dimension: 'trust' }
};
```

### 8.2 好感度等级计算

```javascript
function calculateLevel(score) {
    if (score >= 1000) return 5;
    if (score >= 600) return 4;
    if (score >= 300) return 3;
    if (score >= 100) return 2;
    return 1;
}

function getLevelName(level) {
    const names = ['初识', '熟络', '知己', '依赖', '羁绊'];
    return names[level - 1] || '初识';
}

function getLevelThreshold(level) {
    const thresholds = [0, 100, 300, 600, 1000];
    return thresholds[level - 1] || 0;
}
```

### 8.3 好感度归零机制

```javascript
async function handleAffectionZero(userId) {
    const affection = await Affection.findByUserId(userId);
    
    if (affection.score > 0) {
        return { status: 'normal' };
    }
    
    return {
        status: 'crisis',
        tasks: [
            { 
                id: 1, 
                name: '认真道歉', 
                requirement: '包含"我错了+为什么错+以后怎么做"三要素',
                completed: false
            },
            { 
                id: 2, 
                name: '送符合喜好的礼物', 
                requirement: '选择伴侣喜欢的礼物',
                completed: false
            },
            { 
                id: 3, 
                name: '完成高质量对话', 
                requirement: '评分>70分',
                completed: false
            }
        ],
        retry_count: 3,
        deadline: Date.now() + 7 * 24 * 60 * 60 * 1000
    };
}

async function validateApology(userId, content) {
    const checks = [
        content.includes('我错了') || content.includes('对不起'),
        content.includes('因为') || content.includes('原因'),
        content.includes('以后') || content.includes('下次')
    ];
    
    return checks.every(Boolean);
}

async function restoreAffection(userId) {
    await Affection.update(userId, { score: 30, level: 1 });
    return { success: true, score: 30, level: 1 };
}
```

### 8.4 伴侣主动联系系统

```javascript
async function triggerCompanionContact(userId) {
    const user = await User.findById(userId);
    const affection = await Affection.findByUserId(userId);
    const companion = await Companion.findByUserId(userId);
    
    const contactTypes = [
        { type: 'morning', hour: 8, probability: 0.9 },
        { type: 'lunch', hour: 12, probability: 0.8 },
        { type: 'offwork', hour: 18, probability: 0.7, weekdayOnly: true },
        { type: 'deep', hour: 20, probability: 0.5, minAffection: 200 },
        { type: 'surprise', hour: null, probability: 0.3, minAffection: 500 }
    ];
    
    const now = new Date();
    const currentHour = now.getHours();
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
    
    for (const contact of contactTypes) {
        if (contact.hour !== null && contact.hour !== currentHour) continue;
        if (contact.weekdayOnly && !isWeekday) continue;
        if (contact.minAffection && affection.score < contact.minAffection) continue;
        
        const dailyLimit = getDailyContactLimit(user.membership_type);
        if (affection.daily_interaction_count >= dailyLimit) continue;
        
        if (Math.random() < contact.probability) {
            const message = generateContactMessage(contact.type, companion);
            await saveChatHistory(userId, 'companion', 'companion', message, 1);
            await updateAffection(userId, 1);
            return { success: true, message, type: contact.type };
        }
    }
    
    return { success: false };
}

function getDailyContactLimit(membershipType) {
    const limits = { 0: 3, 1: 5, 2: 8, 3: 10 };
    return limits[membershipType] || 3;
}
```

---

## 9. 记忆系统

### 9.1 记忆检索策略

```javascript
async function retrieveMemory(userId, query, limit = 5) {
    const embedding = await generateEmbedding(query);
    
    const results = await milvusClient.search({
        collection_name: 'companion_memory',
        query: embedding,
        filter: `user_id == ${userId}`,
        limit: limit,
        output_fields: ['content', 'memory_type', 'importance']
    });
    
    return results.map(result => ({
        content: result.content,
        memory_type: result.memory_type,
        importance: result.importance,
        distance: result.distance
    })).sort((a, b) => b.importance - a.importance);
}

async function storeMemory(userId, content, memoryType, relatedTopics = []) {
    const embedding = await generateEmbedding(content);
    
    await milvusClient.insert({
        collection_name: 'companion_memory',
        data: [{
            id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId,
            embedding: embedding,
            content: content,
            memory_type: memoryType,
            importance: calculateImportance(memoryType),
            related_topics: relatedTopics,
            created_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
            access_count: 1
        }]
    });
}

function calculateImportance(memoryType) {
    const baseWeights = {
        factual: 0.6,
        emotional: 0.4,
        relationship: 0.8
    };
    return baseWeights[memoryType] || 0.5;
}
```

---

## 10. 才艺服务

### 10.1 才艺生成逻辑

```javascript
async function performTalent(userId, talentType, style) {
    const companion = await Companion.findByUserId(userId);
    const talentConfig = talentConfigs[talentType];
    
    if (!talentConfig) {
        throw new Error('才艺类型不存在');
    }
    
    const cooldownKey = `yuni:talent_cooldown:${userId}:${talentType}`;
    const remainingCooldown = await redis.get(cooldownKey);
    
    if (remainingCooldown) {
        throw new Error(`冷却中，还剩${parseInt(remainingCooldown)}秒`);
    }
    
    let content;
    let audioUrl = null;
    
    switch (talentType) {
        case 'poetry':
            content = await generatePoetry(style, companion.core_type);
            break;
        case 'joke':
            content = getRandomJoke();
            break;
        case 'song':
            content = await generateSongLyrics(style);
            audioUrl = await ttsService.synthesize(content, companion.voice_type, style);
            break;
        case 'quote':
            content = getRandomQuote();
            break;
        default:
            throw new Error('才艺类型不支持');
    }
    
    await redis.set(cooldownKey, talentConfig.cooldown, 'EX', talentConfig.cooldown);
    
    await TalentRecord.create({
        user_id: userId,
        talent_type: talentType,
        content,
        style
    });
    
    return { content, audioUrl };
}
```

---

## 11. 语音通话服务

### 11.1 通话流程

```javascript
async function startVoiceCall(userId) {
    const user = await User.findById(userId);
    const affection = await Affection.findByUserId(userId);
    
    const permission = await checkCallPermission(userId);
    if (!permission.allowed) {
        throw new Error(permission.reason);
    }
    
    const roomId = generateRoomId();
    const token = await rtcService.generateToken(roomId);
    
    await CallRecord.create({
        user_id: userId,
        room_id: roomId,
        status: 'started',
        start_time: new Date()
    });
    
    return { token, roomId, max_duration: permission.max_duration };
}

async function endVoiceCall(userId, callId, duration, affectionChange) {
    const callRecord = await CallRecord.findById(callId);
    if (!callRecord || callRecord.user_id !== userId) {
        throw new Error('通话记录不存在');
    }
    
    const report = generateCallReport(userId, duration, affectionChange);
    
    await callRecord.update({
        status: 'ended',
        duration,
        affection_change: affectionChange,
        end_time: new Date(),
        report: JSON.stringify(report)
    });
    
    await updateAffection(userId, affectionChange);
    
    return { success: true, report };
}

async function checkCallPermission(userId) {
    const user = await User.findById(userId);
    const affection = await Affection.findByUserId(userId);
    
    if (user.membership_type === 0) {
        if (affection.voice_call_free_used) {
            return { allowed: false, reason: '免费通话已用完' };
        }
        if (affection.level < 2) {
            return { allowed: false, reason: '需要好感度达到Lv.2' };
        }
        return { allowed: true, max_duration: 180 };
    }
    
    const config = membershipConfigs[user.membership_type];
    if (affection.voice_call_used_today >= config.voice_call_daily_limit) {
        return { allowed: false, reason: '今日通话次数已用完' };
    }
    
    return { allowed: true, max_duration: config.voice_call_duration };
}
```

---

## 12. 时空穿梭服务

### 12.1 穿梭逻辑

```javascript
async function executeTimeTravel(userId, interactionId) {
    const user = await User.findById(userId);
    
    if (user.tickets <= 0) {
        throw new Error('穿梭券不足');
    }
    
    const interaction = await InteractionRecord.findById(interactionId);
    if (!interaction || interaction.user_id !== userId) {
        throw new Error('互动记录不存在');
    }
    
    if (interaction.time_travel_used) {
        throw new Error('已使用过时空穿梭');
    }
    
    const learningCard = await generateLearningCard(userId, interaction);
    
    await TimeTravelRecord.create({
        user_id: userId,
        interaction_id: interactionId,
        reason: learningCard.error_analysis,
        correct_choice: learningCard.correct_approach,
        learning_card_id: learningCard.id
    });
    
    await interaction.update({ time_travel_used: true });
    await user.update({ tickets: user.tickets - 1 });
    
    const recoveryAmount = Math.abs(interaction.affection_change) + 10;
    await updateAffection(userId, recoveryAmount);
    
    return {
        success: true,
        learning_card: learningCard,
        affection_recovery: recoveryAmount,
        remaining_tickets: user.tickets - 1
    };
}

async function generateLearningCard(userId, interaction) {
    const scene = await Scene.findById(interaction.item_id);
    const category = getCategoryByScene(scene);
    
    return await LearningCard.create({
        user_id: userId,
        category,
        title: generateCardTitle(interaction),
        error_analysis: analyzeError(interaction),
        correct_approach: generateCorrectApproach(interaction),
        script_template: generateScriptTemplate(category),
        scene_id: interaction.item_id
    });
}

async function addTicket(userId, amount) {
    await User.findByIdAndUpdate(userId, { $inc: { tickets: amount } });
}

async function getTicketWays() {
    return [
        { type: 'daily_login', name: '每日登录', amount: 1, frequency: '每日' },
        { type: 'training_complete', name: '完成模拟训练', amount: 1, frequency: '每日限1次' },
        { type: 'points_exchange', name: '积分兑换', amount: 1, frequency: '100积分' },
        { type: 'watch_ad', name: '看广告', amount: 1, frequency: '每日限2次' },
        { type: 'membership', name: '会员赠送', amount: 3, frequency: '周/月/年' }
    ];
}
```

---

## 13. 成长服务

### 13.1 能力计算

```javascript
async function calculateGrowthData(userId) {
    const trainingRecords = await TrainingRecord.findByUserId(userId);
    
    if (trainingRecords.length === 0) {
        return {
            radar: {
                dimensions: ['沟通力', '表达力', '共情力', '情绪控制', '应变力'],
                scores: [50, 50, 50, 50, 50],
                total: 50
            },
            trend: []
        };
    }
    
    const dimensionScores = {
        communication: [],
        expression: [],
        empathy: [],
        emotionControl: [],
        adaptability: []
    };
    
    trainingRecords.forEach(record => {
        const scores = JSON.parse(record.scores);
        dimensionScores.communication.push(scores.communication || 0);
        dimensionScores.expression.push(scores.expression || 0);
        dimensionScores.empathy.push(scores.empathy || 0);
        dimensionScores.emotionControl.push(scores.emotionControl || 0);
        dimensionScores.adaptability.push(scores.adaptability || 0);
    });
    
    const averages = {
        communication: Math.round(calculateAverage(dimensionScores.communication)),
        expression: Math.round(calculateAverage(dimensionScores.expression)),
        empathy: Math.round(calculateAverage(dimensionScores.empathy)),
        emotionControl: Math.round(calculateAverage(dimensionScores.emotionControl)),
        adaptability: Math.round(calculateAverage(dimensionScores.adaptability))
    };
    
    const totalScore = Math.round(Object.values(averages).reduce((a, b) => a + b, 0) / 5);
    
    const trend = generateTrendData(trainingRecords);
    
    return {
        radar: {
            dimensions: ['沟通力', '表达力', '共情力', '情绪控制', '应变力'],
            scores: [
                averages.communication,
                averages.expression,
                averages.empathy,
                averages.emotionControl,
                averages.adaptability
            ],
            total: totalScore
        },
        trend
    };
}

function calculateAverage(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function generateTrendData(records) {
    const dailyScores = {};
    
    records.forEach(record => {
        const date = record.created_at.toISOString().split('T')[0];
        if (!dailyScores[date]) {
            dailyScores[date] = { total: 0, count: 0 };
        }
        const scores = JSON.parse(record.scores);
        const recordTotal = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
        dailyScores[date].total += recordTotal;
        dailyScores[date].count++;
    });
    
    return Object.entries(dailyScores)
        .map(([date, data]) => ({
            date,
            score: Math.round(data.total / data.count),
            count: data.count
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-30);
}

async function generateMilestones(userId) {
    const user = await User.findById(userId);
    const affection = await Affection.findByUserId(userId);
    const trainingRecords = await TrainingRecord.findByUserId(userId);
    const checkIns = await CheckIn.findByUserId(userId);
    
    const milestones = [];
    
    if (trainingRecords.length >= 1) {
        milestones.push({
            id: 1,
            title: '第一次训练',
            date: trainingRecords[0].created_at,
            icon: '🎉'
        });
    }
    
    const streakRecords = checkIns.sort((a, b) => new Date(a.check_in_date) - new Date(b.check_in_date));
    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate = null;
    
    for (const record of streakRecords) {
        const currentDate = new Date(record.check_in_date);
        if (prevDate) {
            const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
        } else {
            currentStreak = 1;
        }
        maxStreak = Math.max(maxStreak, currentStreak);
        prevDate = currentDate;
    }
    
    if (maxStreak >= 7) {
        milestones.push({
            id: 2,
            title: `连续签到${maxStreak}天`,
            date: streakRecords[streakRecords.length - 1]?.check_in_date,
            icon: '🔥'
        });
    }
    
    if (affection.level >= 3) {
        milestones.push({
            id: 3,
            title: '好感度达到Lv.3',
            date: new Date(),
            icon: '💖'
        });
    }
    
    if (trainingRecords.length >= 10) {
        milestones.push({
            id: 4,
            title: '完成10次训练',
            date: new Date(),
            icon: '🎯'
        });
    }
    
    return milestones.sort((a, b) => new Date(b.date) - new Date(a.date));
}
```

---

## 14. 依恋风格分析

### 14.1 分析逻辑

```javascript
async function analyzeAttachmentStyle(userId) {
    const interactions = await getRecentInteractions(userId, 90);
    
    if (interactions.length < 10) {
        return {
            style: 'undefined',
            scores: { secure: 0, anxious: 0, avoidant: 0, fearful: 0 },
            suggestions: ['继续互动，积累更多数据后再分析']
        };
    }
    
    const metrics = calculateMetrics(interactions);
    const scores = calculateAttachmentScores(metrics);
    const style = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    return {
        style,
        scores,
        metrics,
        suggestions: getSuggestions(style, metrics)
    };
}

function calculateMetrics(interactions) {
    let initiativeCount = 0;
    let comfortSeekingCount = 0;
    let selfDisclosureDepth = 0;
    let emotionExpressionCount = 0;
    let responseLengths = [];
    
    interactions.forEach(interaction => {
        if (interaction.role === 'user') {
            initiativeCount++;
        }
        
        if (interaction.content.includes('难过') || 
            interaction.content.includes('伤心') || 
            interaction.content.includes('担心') ||
            interaction.content.includes('害怕')) {
            comfortSeekingCount++;
        }
        
        if (interaction.content.length > 50) {
            selfDisclosureDepth += interaction.content.length / 100;
        }
        
        const emotionWords = ['开心', '难过', '生气', '害怕', '担心', '焦虑', '兴奋', '沮丧'];
        emotionWords.forEach(word => {
            if (interaction.content.includes(word)) {
                emotionExpressionCount++;
            }
        });
        
        responseLengths.push(interaction.content.length);
    });
    
    const avgLength = responseLengths.reduce((a, b) => a + b, 0) / responseLengths.length;
    const lengthStd = Math.sqrt(responseLengths.reduce((a, b) => a + Math.pow(b - avgLength, 2), 0) / responseLengths.length);
    
    return {
        initiativeRate: initiativeCount / interactions.length,
        comfortSeekingRate: comfortSeekingCount / interactions.length,
        selfDisclosureDepth: selfDisclosureDepth / interactions.length,
        emotionExpressionLevel: emotionExpressionCount / interactions.length,
        responseConsistency: lengthStd / avgLength
    };
}

function calculateAttachmentScores(metrics) {
    return {
        secure: calculateSecureScore(metrics),
        anxious: calculateAnxiousScore(metrics),
        avoidant: calculateAvoidantScore(metrics),
        fearful: calculateFearfulScore(metrics)
    };
}

function calculateSecureScore(metrics) {
    let score = 50;
    if (metrics.initiativeRate > 0.3 && metrics.initiativeRate < 0.7) score += 20;
    if (metrics.comfortSeekingRate > 0.1 && metrics.comfortSeekingRate < 0.4) score += 15;
    if (metrics.selfDisclosureDepth > 0.3 && metrics.selfDisclosureDepth < 0.7) score += 10;
    if (metrics.responseConsistency < 0.5) score += 5;
    return Math.min(100, score);
}

function calculateAnxiousScore(metrics) {
    let score = 50;
    if (metrics.initiativeRate > 0.7) score += 20;
    if (metrics.comfortSeekingRate > 0.4) score += 20;
    if (metrics.emotionExpressionLevel > 0.5) score += 10;
    if (metrics.responseConsistency > 0.5) score += 10;
    return Math.min(100, score);
}

function calculateAvoidantScore(metrics) {
    let score = 50;
    if (metrics.initiativeRate < 0.3) score += 20;
    if (metrics.comfortSeekingRate < 0.1) score += 20;
    if (metrics.selfDisclosureDepth < 0.3) score += 15;
    if (metrics.emotionExpressionLevel < 0.2) score += 10;
    return Math.min(100, score);
}

function calculateFearfulScore(metrics) {
    let score = 50;
    if (metrics.initiativeRate < 0.3) score += 15;
    if (metrics.comfortSeekingRate > 0.3) score += 15;
    if (metrics.selfDisclosureDepth < 0.3) score += 15;
    if (metrics.responseConsistency > 0.5) score += 15;
    return Math.min(100, score);
}

function getSuggestions(style, metrics) {
    const suggestions = {
        secure: [
            '你拥有健康的依恋模式，继续保持！',
            '尝试在关系中更加开放地表达自己',
            '可以尝试挑战更有难度的社交场景'
        ],
        anxious: [
            '你渴望亲密关系，但容易感到不安',
            '试着给自己和对方一些空间',
            '练习自我安抚，减少对他人认可的依赖',
            '尝试使用"情绪日记"功能记录感受'
        ],
        avoidant: [
            '你倾向于保持距离，保护自己不受伤害',
            '试着逐步开放自己，分享更多感受',
            '练习信任他人，从小事开始',
            '可以尝试"自我暴露原则"学习卡片'
        ],
        fearful: [
            '你既渴望亲密又害怕受伤，处于矛盾中',
            '试着先在安全的环境中练习开放',
            '可以从低风险的自我暴露开始',
            '建议使用"非暴力沟通"学习卡片'
        ],
        undefined: ['继续互动，积累更多数据后再分析']
    };
    return suggestions[style] || suggestions.undefined;
}
```

---

## 15. 情绪识别服务

### 15.1 情绪词库（轻量级关键词匹配）

```javascript
const emotionKeywords = {
    anxiety: [
        { word: '担心', weight: 0.8, guidance: '试着把担心的具体事情写下来，看看哪些是可以解决的' },
        { word: '紧张', weight: 0.8, guidance: '深呼吸，告诉自己紧张是正常的' },
        { word: '压力大', weight: 0.7, guidance: '把压力分解成小步骤，一步一步解决' },
        { word: '焦虑', weight: 0.9, guidance: '焦虑是身体在提醒你关注某些事情' },
        { word: '不安', weight: 0.75, guidance: '试着找出让你不安的具体原因' },
        { word: '害怕', weight: 0.85, guidance: '恐惧是正常的情绪，面对它才能克服它' },
        { word: '不知所措', weight: 0.8, guidance: '先停下来，理清思路再行动' },
        { word: '慌', weight: 0.7, guidance: '给自己一点时间，不用急着做决定' }
    ],
    sadness: [
        { word: '难过', weight: 0.8, guidance: '允许自己难过，这是正常的情绪' },
        { word: '失落', weight: 0.7, guidance: '想想最近让你开心的小事' },
        { word: '想哭', weight: 0.9, guidance: '哭出来也是一种释放' },
        { word: '伤心', weight: 0.85, guidance: '给自己一个拥抱，安慰一下自己' },
        { word: '沮丧', weight: 0.75, guidance: '休息一下，明天又是新的一天' },
        { word: '失望', weight: 0.7, guidance: '期望和现实的差距让你感到失望' },
        { word: '低落', weight: 0.8, guidance: '做点喜欢的事情，提升一下心情' },
        { word: '抑郁', weight: 0.9, guidance: '如果持续低落，请记得寻求帮助' }
    ],
    anger: [
        { word: '生气', weight: 0.75, guidance: '先深呼吸，数到十再说话' },
        { word: '愤怒', weight: 0.85, guidance: '试着用"我感到..."来表达，而不是指责' },
        { word: '烦躁', weight: 0.7, guidance: '做一些能让自己平静的事情' },
        { word: '讨厌', weight: 0.75, guidance: '试着理解对方的立场' },
        { word: '烦', weight: 0.65, guidance: '暂时离开让你烦躁的环境' },
        { word: '不满', weight: 0.7, guidance: '试着用非暴力沟通表达你的需求' },
        { word: '忍无可忍', weight: 0.85, guidance: '给自己一点空间，不要冲动' },
        { word: '气死', weight: 0.8, guidance: '深呼吸，让情绪先平复下来' }
    ],
    joy: [
        { word: '开心', weight: 0.8, guidance: '享受这份开心的感觉' },
        { word: '高兴', weight: 0.75, guidance: '把这份快乐分享给身边的人' },
        { word: '兴奋', weight: 0.85, guidance: '尽情享受这份兴奋' },
        { word: '快乐', weight: 0.8, guidance: '记录下让你快乐的事情' },
        { word: '幸福', weight: 0.85, guidance: '珍惜这份幸福的感觉' },
        { word: '满足', weight: 0.75, guidance: '享受这份满足感' },
        { word: '愉快', weight: 0.7, guidance: '保持这份愉快的心情' },
        { word: '惊喜', weight: 0.85, guidance: '享受这份意外的惊喜' }
    ],
    calm: [
        { word: '平静', weight: 0.7, guidance: '保持这份平静' },
        { word: '还好', weight: 0.6, guidance: '保持现状也不错' },
        { word: '一般', weight: 0.5, guidance: '平平淡淡也是一种幸福' },
        { word: '还行', weight: 0.55, guidance: '保持平常心' },
        { word: '无所谓', weight: 0.6, guidance: '顺其自然也是一种态度' },
        { word: '还好吧', weight: 0.55, guidance: '保持平和的心态' },
        { word: '没感觉', weight: 0.5, guidance: '注意自己的情绪变化' },
        { word: '还好啦', weight: 0.55, guidance: '保持平静就好' }
    ]
};
```

### 15.2 行为特征分析引擎

```javascript
function analyzeBehaviorEmotion(behaviorData) {
    const triggers = [];
    let intensity = 0;
    let inferredEmotion = 'neutral';
    
    if (behaviorData.login_time) {
        const hour = parseInt(behaviorData.login_time.split(':')[0]);
        if (hour >= 23 || hour < 2) {
            triggers.push({ behavior: '深夜登录', detail: `登录时间 ${behaviorData.login_time}` });
            intensity += 0.25;
            inferredEmotion = 'anxiety';
        }
    }
    
    if (behaviorData.recent_messages !== undefined) {
        if (behaviorData.recent_messages > 10) {
            triggers.push({ behavior: '高频发送', detail: `${behaviorData.recent_messages}条消息在短时间内发送` });
            intensity += 0.2;
            if (inferredEmotion === 'neutral') inferredEmotion = 'anxiety';
        }
    }
    
    if (behaviorData.avg_length !== undefined) {
        if (behaviorData.avg_length < 5) {
            const count = behaviorData.short_message_count || 3;
            triggers.push({ behavior: '短回应', detail: `${count}条消息少于5字` });
            intensity += 0.15;
            if (inferredEmotion === 'neutral') inferredEmotion = 'sadness';
        }
    }
    
    if (behaviorData.scene_avoidance_count !== undefined) {
        if (behaviorData.scene_avoidance_count > 2) {
            triggers.push({ behavior: '回避挑战', detail: `回避了${behaviorData.scene_avoidance_count}次挑战性场景` });
            intensity += 0.2;
            if (inferredEmotion === 'neutral') inferredEmotion = 'fear';
        }
    }
    
    if (behaviorData.homepage_returns !== undefined) {
        if (behaviorData.homepage_returns > 5) {
            triggers.push({ behavior: '频繁返回', detail: `频繁返回首页${behaviorData.homepage_returns}次` });
            intensity += 0.15;
            if (inferredEmotion === 'neutral') inferredEmotion = 'anxiety';
        }
    }
    
    return {
        emotion: inferredEmotion,
        intensity: Math.min(intensity, 0.9),
        triggers,
        confidence: 0.6 + (triggers.length * 0.08)
    };
}
```

### 15.3 文本情绪分析（根据会员等级选择策略）

```javascript
async function analyzeTextEmotion(text, userId) {
    const user = await User.findById(userId);
    
    if (!user || user.membership_type === 0) {
        return analyzeTextByKeywords(text);
    }
    
    if (user.membership_type >= 1) {
        return analyzeTextByBERT(text);
    }
    
    return analyzeTextByKeywords(text);
}

function analyzeTextByKeywords(text) {
    const scores = { anxiety: 0, sadness: 0, anger: 0, fear: 0, joy: 0, calm: 0 };
    const matchedKeywords = [];
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        for (const keyword of keywords) {
            if (text.includes(keyword.word)) {
                scores[emotion] += keyword.weight;
                matchedKeywords.push({ word: keyword.word, emotion, weight: keyword.weight });
            }
        }
    }
    
    const maxScore = Math.max(...Object.values(scores));
    const primaryEmotion = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    return {
        emotion: maxScore > 0 ? primaryEmotion : 'neutral',
        intensity: maxScore,
        confidence: Math.min(0.6 + (matchedKeywords.length * 0.05), 0.9),
        keywords: matchedKeywords.map(k => k.word),
        scores
    };
}

async function analyzeTextByBERT(text) {
    try {
        const response = await fetch(process.env.BERT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        const result = await response.json();
        
        return {
            emotion: result.emotion || 'neutral',
            intensity: result.intensity || 0,
            confidence: result.confidence || 0.85,
            keywords: result.keywords || [],
            scores: result.scores || { anxiety: 0, sadness: 0, anger: 0, fear: 0, joy: 0, calm: 0 }
        };
    } catch (error) {
        console.error('BERT分析失败，回退到关键词匹配:', error);
        return analyzeTextByKeywords(text);
    }
}
```

### 15.4 语音情绪分析

```javascript
async function analyzeVoiceEmotion(audioUrl, duration, userId) {
    const user = await User.findById(userId);
    
    if (!user || user.membership_type < 2) {
        return { emotion: 'neutral', intensity: 0, features: {}, confidence: 0 };
    }
    
    try {
        const response = await fetch(process.env.VOICE_EMOTION_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio_url: audioUrl, duration })
        });
        
        const result = await response.json();
        
        return {
            emotion: result.emotion || 'neutral',
            intensity: result.intensity || 0,
            features: result.features || {},
            confidence: result.confidence || 0.75,
            scores: result.scores || { anxiety: 0, sadness: 0, anger: 0, fear: 0, joy: 0, calm: 0 }
        };
    } catch (error) {
        console.error('语音情绪分析失败:', error);
        return { emotion: 'neutral', intensity: 0, features: {}, confidence: 0 };
    }
}
```

### 15.5 融合决策引擎

```javascript
async function analyzeEmotionFusion(userId, text, voiceFeatures, behaviorData) {
    const user = await User.findById(userId);
    
    const textResult = await analyzeTextEmotion(text, userId);
    
    let voiceResult = { emotion: 'neutral', intensity: 0, confidence: 0, scores: {} };
    if (voiceFeatures && user && user.membership_type >= 2) {
        voiceResult = await analyzeVoiceEmotion(voiceFeatures.audio_url, voiceFeatures.duration, userId);
    }
    
    const behaviorResult = behaviorData ? analyzeBehaviorEmotion(behaviorData) : 
        { emotion: 'neutral', intensity: 0, confidence: 0, scores: {}, triggers: [] };
    
    const weights = {
        text: 0.5,
        voice: voiceFeatures ? 0.3 : 0,
        behavior: 0.2
    };
    
    const emotionScores = { anxiety: 0, sadness: 0, anger: 0, fear: 0, joy: 0, calm: 0 };
    
    const allEmotions = ['anxiety', 'sadness', 'anger', 'fear', 'joy', 'calm'];
    allEmotions.forEach(emotion => {
        emotionScores[emotion] = 
            (textResult.scores[emotion] || 0) * weights.text +
            (voiceResult.scores[emotion] || 0) * weights.voice +
            (behaviorResult.scores[emotion] || (behaviorResult.emotion === emotion ? behaviorResult.intensity : 0)) * weights.behavior;
    });
    
    const primaryEmotion = Object.keys(emotionScores).reduce((a, b) => 
        emotionScores[a] > emotionScores[b] ? a : b);
    const intensity = Math.max(...Object.values(emotionScores));
    
    const secondaryEmotions = Object.entries(emotionScores)
        .filter(([emotion, score]) => emotion !== primaryEmotion && score > 0.1)
        .sort((a, b) => b[1] - a[1])
        .map(([emotion]) => emotion)
        .slice(0, 2);
    
    const hasSpecificProblem = detectSpecificProblem(text);
    const triggerMode = determineTriggerMode(intensity, hasSpecificProblem);
    
    const confidence = (textResult.confidence + voiceResult.confidence + behaviorResult.confidence) / 3;
    const polarity = intensity > 0.5 ? 'negative' : intensity < 0.3 ? 'positive' : 'neutral';
    
    const recommendedResponse = generateRecommendedResponse(primaryEmotion, intensity, triggerMode, text);
    
    const analysisDetail = {
        text_contribution: textResult.intensity * weights.text,
        voice_contribution: voiceResult.intensity * weights.voice,
        behavior_contribution: behaviorResult.intensity * weights.behavior
    };
    
    await saveEmotionRecord(userId, {
        session_type: 'companion',
        source_type: 'fusion',
        raw_text: text,
        emotion_primary: primaryEmotion,
        emotion_secondary: secondaryEmotions,
        intensity,
        polarity,
        confidence,
        trigger_mode: triggerMode,
        features: {
            text_keywords: textResult.keywords,
            voice_features: voiceFeatures,
            behavior_triggers: behaviorResult.triggers
        },
        analysis_detail: analysisDetail,
        recommended_response: recommendedResponse
    });
    
    return {
        emotion: {
            primary: emotionMap[primaryEmotion] || primaryEmotion,
            secondary: secondaryEmotions.map(e => emotionMap[e] || e),
            intensity: Math.round(intensity * 100) / 100,
            polarity,
            confidence: Math.round(confidence * 100) / 100
        },
        trigger_mode: triggerModeMap[triggerMode] || triggerMode,
        recommended_response: recommendedResponse,
        analysis_detail: analysisDetail
    };
}

const emotionMap = {
    anxiety: '焦虑',
    sadness: '难过',
    anger: '生气',
    fear: '恐惧',
    joy: '开心',
    calm: '平静',
    neutral: '平静'
};

const triggerModeMap = {
    tree: '树洞模式',
    suggestion: '建议模式',
    mixed: '混合模式',
    forced_tree: '强制树洞模式'
};

function detectSpecificProblem(text) {
    const problemPatterns = [
        /怎么办|如何|怎么|怎么解决|怎么处理/g,
        /求助|帮忙|帮我/g,
        /问题|困难|麻烦|困扰/g,
        /建议|意见|指导/g,
        /面试|工作|学习|考试/g,
        /感情|恋爱|分手|吵架/g
    ];
    
    return problemPatterns.some(pattern => pattern.test(text));
}

function determineTriggerMode(intensity, hasSpecificProblem) {
    if (intensity > 0.8) {
        return 'forced_tree';
    }
    
    if (intensity > 0.7 && !hasSpecificProblem) {
        return 'tree';
    }
    
    if (intensity < 0.4 && hasSpecificProblem) {
        return 'suggestion';
    }
    
    if (intensity > 0.6 && hasSpecificProblem) {
        return 'mixed';
    }
    
    return 'suggestion';
}

function generateRecommendedResponse(emotion, intensity, triggerMode, text) {
    const responses = {
        anxiety: {
            tree: '我注意到你有点紧张，能跟我说说具体在担心什么吗？',
            suggestion: '试着把担心的事情写下来，看看哪些是可以控制的',
            mixed: '我注意到你有点紧张，能先跟我说说具体在担心什么吗？然后我们一起看看怎么解决'
        },
        sadness: {
            tree: '我感受到你现在很难过，我在这里陪着你',
            suggestion: '想想最近让你开心的小事，给自己一点时间恢复',
            mixed: '我感受到你现在很难过，先跟我说说发生了什么，然后我们一起看看怎么让心情好起来'
        },
        anger: {
            tree: '我感受到你现在很生气，先深呼吸，慢慢说',
            suggestion: '试着用"我感到..."来表达你的感受，而不是指责对方',
            mixed: '我感受到你现在很生气，先跟我说说发生了什么，然后我们一起看看怎么处理'
        },
        fear: {
            tree: '害怕是正常的，能跟我说说你在害怕什么吗？',
            suggestion: '试着把恐惧分解成小步骤，一步一步面对',
            mixed: '我理解你的害怕，先跟我说说具体在害怕什么，然后我们一起看看怎么克服'
        },
        joy: {
            tree: '看到你开心我也很开心，能跟我分享一下吗？',
            suggestion: '继续保持这份开心的心情！',
            mixed: '看到你开心我也很开心，能跟我分享一下是什么让你这么开心吗？'
        },
        calm: {
            tree: '你现在很平静，这很好',
            suggestion: '继续保持这份平静',
            mixed: '你现在很平静，想聊点什么吗？'
        }
    };
    
    return responses[emotion]?.[triggerMode] || '我在听，你想说什么都可以';
}

async function saveEmotionRecord(userId, data) {
    await EmotionRecord.create({
        id: `emo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        ...data
    });
}
```

### 15.6 情绪状态机

```javascript
class EmotionStateMachine {
    constructor() {
        this.state = 'neutral';
        this.currentEmotion = 'calm';
        this.intensity = 0;
        this.emotionHistory = [];
        this.transitionRules = {
            neutral: {
                positive: { threshold: 0.3, newState: 'positive' },
                negative: { threshold: 0.5, newState: 'negative' }
            },
            positive: {
                negative: { threshold: 0.5, newState: 'negative' },
                neutral: { threshold: 0.3, newState: 'neutral' }
            },
            negative: {
                positive: { threshold: 0.4, newState: 'recovering' },
                escalation: { threshold: 0.8, newState: 'high_negative' },
                neutral: { threshold: 0.3, newState: 'neutral' }
            },
            high_negative: {
                positive: { threshold: 0.3, newState: 'recovering' },
                tree_trigger: { threshold: 0.9, newState: 'tree_mode' },
                neutral: { threshold: 0.2, newState: 'recovering' }
            },
            recovering: {
                positive: { threshold: 0.4, newState: 'neutral' },
                negative: { threshold: 0.5, newState: 'negative' },
                neutral: { threshold: 0.3, newState: 'neutral' }
            },
            tree_mode: {
                positive: { threshold: 0.4, newState: 'recovering' },
                neutral: { threshold: 0.3, newState: 'recovering' }
            }
        };
    }
    
    update(emotion, intensity) {
        this.currentEmotion = emotion;
        this.intensity = intensity;
        this.emotionHistory.push({ emotion, intensity, timestamp: Date.now() });
        
        if (this.emotionHistory.length > 10) {
            this.emotionHistory.shift();
        }
        
        return this.transition();
    }
    
    transition() {
        const rules = this.transitionRules[this.state];
        
        if (!rules) {
            this.state = 'neutral';
            return { state: this.state, changed: false };
        }
        
        let newState = null;
        let transitionType = null;
        
        if (this.intensity > 0.7 && this.state !== 'tree_mode') {
            newState = rules.escalation?.newState || rules.negative?.newState;
            transitionType = 'escalation';
        } else if (this.intensity > 0.85) {
            newState = rules.tree_trigger?.newState;
            transitionType = 'tree_trigger';
        } else if (['joy', 'calm'].includes(this.currentEmotion) && this.intensity > 0.3) {
            newState = rules.positive?.newState;
            transitionType = 'positive';
        } else if (['anxiety', 'sadness', 'anger', 'fear'].includes(this.currentEmotion) && this.intensity > 0.5) {
            newState = rules.negative?.newState;
            transitionType = 'negative';
        } else if (this.intensity < 0.3) {
            newState = rules.neutral?.newState;
            transitionType = 'neutral';
        }
        
        if (newState && newState !== this.state) {
            const oldState = this.state;
            this.state = newState;
            return { state: this.state, changed: true, from: oldState, transitionType };
        }
        
        return { state: this.state, changed: false };
    }
    
    getStatus() {
        return {
            state: this.state,
            current_emotion: emotionMap[this.currentEmotion] || this.currentEmotion,
            intensity: this.intensity,
            recent_history: this.emotionHistory.slice(-5)
        };
    }
    
    reset() {
        this.state = 'neutral';
        this.currentEmotion = 'calm';
        this.intensity = 0;
        this.emotionHistory = [];
    }
}
```

### 15.7 获取情绪历史

```javascript
async function getEmotionHistory(userId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const records = await EmotionRecord.find({
        user_id: userId,
        created_at: { $gte: startDate }
    }).sort({ created_at: 1 });
    
    const dailyAggregation = {};
    
    records.forEach(record => {
        const date = record.created_at.toISOString().split('T')[0];
        if (!dailyAggregation[date]) {
            dailyAggregation[date] = { emotions: [], intensities: [] };
        }
        dailyAggregation[date].emotions.push(record.emotion_primary);
        dailyAggregation[date].intensities.push(record.intensity);
    });
    
    return Object.entries(dailyAggregation).map(([date, data]) => {
        const avgIntensity = data.intensities.reduce((a, b) => a + b, 0) / data.intensities.length;
        const dominantEmotion = data.emotions.reduce((a, b) => 
            data.emotions.filter(e => e === a).length > 
            data.emotions.filter(e => e === b).length ? a : b);
        
        return {
            date,
            emotion: emotionMap[dominantEmotion] || dominantEmotion,
            intensity: Math.round(avgIntensity * 100) / 100,
            count: data.emotions.length
        };
    });
}
```

---

## 16. 用户自定义角色系统

### 16.1 数据模型

```javascript
const personalityDimensionSchema = new Schema({
    extroversion: { type: Number, min: 1, max: 100, default: 50 },
    neuroticism: { type: Number, min: 1, max: 100, default: 50 },
    openness: { type: Number, min: 1, max: 100, default: 50 },
    agreeableness: { type: Number, min: 1, max: 100, default: 50 },
    conscientiousness: { type: Number, min: 1, max: 100, default: 50 },
    empathy: { type: Number, min: 1, max: 100, default: 50 }
});

const customRoleConfigSchema = new Schema({
    role_name: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    age: { type: Number, min: 18, max: 50, required: true },
    core_personality: { type: [String], required: true },
    relationship: { type: String, enum: ['青梅竹马', '大学同学', '职场前辈', '陌生人'], required: true },
    nickname_for_user: { type: String, required: true },
    catchphrase: { type: String, default: '' },
    voice_type: { type: String, enum: ['warm', 'energetic', 'calm', 'sweet'], default: 'warm' },
    avatar_style: { type: String, enum: ['fresh', 'vintage', 'trendy', 'simple'], default: 'default' },
    personality_dimensions: { type: personalityDimensionSchema, required: true },
    created_at: { type: Date, default: Date.now }
});

const presetTemplateSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    config: { type: customRoleConfigSchema, required: true },
    popularity: { type: Number, default: 0 }
});
```

### 16.2 六维人格维度说明

| 维度 | 字段名 | 描述 | 影响 |
|------|--------|------|------|
| 外向性 | extroversion | 社交活跃度 | 对话开场方式、话题广度 |
| 神经质 | neuroticism | 情绪稳定性 | 情绪波动幅度、抗压能力 |
| 开放性 | openness | 接受新事物程度 | 创新程度、对新奇事物的接受度 |
| 宜人性 | agreeableness | 友善合作程度 | 合作意愿、对他人需求的关注 |
| 尽责性 | conscientiousness | 自律可靠程度 | 承诺兑现、任务完成度 |
| 共情力 | empathy | 理解他人情绪 | 情绪回应质量、安慰能力 |

### 16.3 预设人格模板

```javascript
const PRESET_TEMPLATES = [
    {
        name: '温暖学长',
        description: '温柔体贴，善解人意的邻家学长',
        config: {
            role_name: '温暖学长',
            gender: 'male',
            age: 23,
            core_personality: ['温柔', '体贴', '善解人意'],
            relationship: '大学同学',
            nickname_for_user: '学妹/学弟',
            catchphrase: '没事，有我呢',
            voice_type: 'warm',
            avatar_style: 'fresh',
            personality_dimensions: {
                extroversion: 70,
                neuroticism: 30,
                openness: 60,
                agreeableness: 80,
                conscientiousness: 70,
                empathy: 85
            }
        }
    },
    {
        name: '元气少女',
        description: '活力满满，乐观开朗的元气少女',
        config: {
            role_name: '元气少女',
            gender: 'female',
            age: 21,
            core_personality: ['活力', '乐观', '开朗'],
            relationship: '青梅竹马',
            nickname_for_user: '哥哥/姐姐',
            catchphrase: '一起加油吧！',
            voice_type: 'energetic',
            avatar_style: 'trendy',
            personality_dimensions: {
                extroversion: 85,
                neuroticism: 50,
                openness: 80,
                agreeableness: 75,
                conscientiousness: 50,
                empathy: 70
            }
        }
    },
    {
        name: '高冷御姐',
        description: '成熟优雅，冷静理智的职场御姐',
        config: {
            role_name: '高冷御姐',
            gender: 'female',
            age: 28,
            core_personality: ['冷静', '理智', '优雅'],
            relationship: '职场前辈',
            nickname_for_user: '同事',
            catchphrase: '嗯，我知道了',
            voice_type: 'calm',
            avatar_style: 'simple',
            personality_dimensions: {
                extroversion: 40,
                neuroticism: 35,
                openness: 70,
                agreeableness: 50,
                conscientiousness: 80,
                empathy: 60
            }
        }
    },
    {
        name: '邻家弟弟',
        description: '活泼可爱，依赖感强的邻家弟弟',
        config: {
            role_name: '邻家弟弟',
            gender: 'male',
            age: 19,
            core_personality: ['活泼', '可爱', '依赖'],
            relationship: '青梅竹马',
            nickname_for_user: '姐姐/哥哥',
            catchphrase: '姐姐/哥哥好~',
            voice_type: 'sweet',
            avatar_style: 'fresh',
            personality_dimensions: {
                extroversion: 80,
                neuroticism: 60,
                openness: 75,
                agreeableness: 85,
                conscientiousness: 45,
                empathy: 80
            }
        }
    },
    {
        name: '成熟大叔',
        description: '稳重可靠，阅历丰富的成熟大叔',
        config: {
            role_name: '成熟大叔',
            gender: 'male',
            age: 35,
            core_personality: ['稳重', '可靠', '睿智'],
            relationship: '职场前辈',
            nickname_for_user: '年轻人',
            catchphrase: '慢慢来，不急',
            voice_type: 'calm',
            avatar_style: 'vintage',
            personality_dimensions: {
                extroversion: 60,
                neuroticism: 25,
                openness: 55,
                agreeableness: 70,
                conscientiousness: 85,
                empathy: 75
            }
        }
    }
];
```

### 16.4 API接口

| 功能 | 方法 | 路径 | 请求参数 | 返回值 |
|------|------|------|---------|--------|
| 获取预设模板 | GET | /api/v1/companion/presets | - | `{"presets": [...]}` |
| 创建自定义角色 | POST | /api/v1/companion/customize | `{"role_name","gender","age","core_personality","relationship","nickname_for_user","catchphrase","voice_type","avatar_style","personality_dimensions"}` | `{"success":true,"companion":{...}}` |
| 获取当前角色配置 | GET | /api/v1/companion/config | - | `{"config":{...}}` |
| 更新角色配置 | PUT | /api/v1/companion/config | `{"catchphrase","voice_type","avatar_style"}` | `{"success":true,"config":{...}}` |

### 16.5 人格配置到LLM提示词转换

```javascript
function buildPersonalityPrompt(config) {
    const { personality_dimensions, catchphrase, relationship, nickname_for_user, role_name } = config;
    
    const dimensionDescriptions = [
        `外向性${personality_dimensions.extroversion}: ${personality_dimensions.extroversion > 70 ? '非常外向，喜欢与人交流' : personality_dimensions.extroversion < 40 ? '比较内向，喜欢独处' : '适中，既能社交也能独处'}`,
        `情绪稳定性${personality_dimensions.neuroticism}: ${personality_dimensions.neuroticism < 40 ? '情绪稳定，不易波动' : personality_dimensions.neuroticism > 70 ? '情绪敏感，容易波动' : '情绪适中'}`,
        `开放性${personality_dimensions.openness}: ${personality_dimensions.openness > 70 ? '喜欢新鲜事物，富有创造力' : personality_dimensions.openness < 40 ? '喜欢稳定，偏好熟悉的事物' : '适中'}`,
        `宜人性${personality_dimensions.agreeableness}: ${personality_dimensions.agreeableness > 70 ? '非常友善，乐于助人' : personality_dimensions.agreeableness < 40 ? '比较独立，关注自己' : '适中'}`,
        `尽责性${personality_dimensions.conscientiousness}: ${personality_dimensions.conscientiousness > 70 ? '非常自律，信守承诺' : personality_dimensions.conscientiousness < 40 ? '比较随性，灵活应变' : '适中'}`,
        `共情力${personality_dimensions.empathy}: ${personality_dimensions.empathy > 70 ? '善解人意，容易理解他人感受' : personality_dimensions.empathy < 40 ? '比较理性，关注事实' : '适中'}`
    ];
    
    return `你现在扮演${role_name}，与用户的关系是${relationship}。
你称呼用户为${nickname_for_user}。
你的口头禅是："${catchphrase}"。

你的人格特质：
${dimensionDescriptions.join('\n')}

请根据以上人格设定进行对话，保持一致性。`;
}
```

---

## 17. 合规与安全

### 17.1 年龄分层

```javascript
function getAgeRestrictions(age) {
    if (age < 14) {
        return {
            maxDailyMinutes: 30,
            allowedScenes: [1, 2],
            blockedFeatures: ['voice_call', 'intimate_dialogues', 'gifts_premium'],
            contentFilter: 'strict'
        };
    }
    
    if (age >= 14 && age < 18) {
        return {
            maxDailyMinutes: 30,
            allowedScenes: [1, 2, 3],
            blockedFeatures: ['intimate_dialogues', 'gifts_premium'],
            contentFilter: 'moderate'
        };
    }
    
    return {
        maxDailyMinutes: null,
        allowedScenes: [1, 2, 3, 4, 5, 6],
        blockedFeatures: [],
        contentFilter: 'normal'
    };
}

async function checkAgeRestriction(userId, feature) {
    const user = await User.findById(userId);
    
    if (!user.is_minor) {
        return { allowed: true };
    }
    
    const restrictions = getAgeRestrictions(user.age);
    
    if (restrictions.blockedFeatures.includes(feature)) {
        return { 
            allowed: false, 
            reason: `未成年人不允许使用${getFeatureName(feature)}功能` 
        };
    }
    
    return { allowed: true };
}

function getFeatureName(feature) {
    const names = {
        voice_call: '语音通话',
        intimate_dialogues: '亲密对话',
        gifts_premium: '高级礼物'
    };
    return names[feature] || feature;
}
```

### 17.2 实名认证方案

```javascript
async function verifyRealName(userId, name, idCard) {
    const user = await User.findById(userId);
    if (!user) return { success: false, message: '用户不存在' };
    
    const isValid = validateIdCard(idCard);
    if (!isValid) return { success: false, message: '身份证号码格式不正确' };
    
    const age = calculateAge(idCard);
    const isMinor = age < 18;
    
    await User.findByIdAndUpdate(userId, {
        real_name: name,
        id_card: maskIdCard(idCard),
        is_minor: isMinor,
        age: age,
        real_name_verified: true
    });
    
    return { 
        success: true, 
        message: '实名认证成功',
        is_minor: isMinor,
        age: age 
    };
}

function validateIdCard(idCard) {
    const regex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
    return regex.test(idCard);
}

function calculateAge(idCard) {
    const birthDate = idCard.substring(6, 14);
    const birthYear = parseInt(birthDate.substring(0, 4));
    const birthMonth = parseInt(birthDate.substring(4, 6));
    const birthDay = parseInt(birthDate.substring(6, 8));
    
    const now = new Date();
    let age = now.getFullYear() - birthYear;
    
    if (now.getMonth() + 1 < birthMonth || 
        (now.getMonth() + 1 === birthMonth && now.getDate() < birthDay)) {
        age--;
    }
    
    return age;
}

function maskIdCard(idCard) {
    return idCard.substring(0, 4) + '********' + idCard.substring(12);
}

async function checkRealNameRequired(userId, feature) {
    const user = await User.findById(userId);
    
    if (user.real_name_verified) {
        return { required: false, message: null };
    }
    
    const featuresRequiringVerification = ['voice_call', 'video_call', 'payment', 'membership'];
    
    if (featuresRequiringVerification.includes(feature)) {
        return { 
            required: true, 
            message: '使用该功能需要先完成实名认证' 
        };
    }
    
    return { required: false, message: null };
}
```

### 17.3 防沉迷检测

```javascript
async function checkAntiAddiction(userId) {
    const user = await User.findById(userId);
    
    if (!user.is_minor) {
        return { status: 'ok', message: null };
    }
    
    const restrictions = getAgeRestrictions(user.age);
    const today = new Date().toISOString().split('T')[0];
    
    if (user.daily_usage_seconds > restrictions.maxDailyMinutes * 60) {
        return { 
            status: 'blocked', 
            message: `今日已使用${Math.floor(user.daily_usage_seconds / 60)}分钟，请明天再使用` 
        };
    }
    
    if (user.daily_usage_seconds > (restrictions.maxDailyMinutes * 60) * 0.8) {
        return { 
            status: 'warning', 
            message: `今日已使用${Math.floor(user.daily_usage_seconds / 60)}分钟，即将达到上限` 
        };
    }
    
    return { status: 'ok', message: null };
}

async function incrementDailyUsage(userId, seconds) {
    await User.findByIdAndUpdate(userId, { 
        $inc: { daily_usage_seconds: seconds },
        last_active: new Date()
    });
}

async function resetDailyUsage() {
    await User.updateMany({}, { daily_usage_seconds: 0 });
}
```

### 17.4 敏感词过滤

```javascript
async function filterSensitiveContent(content, userId) {
    const user = await User.findById(userId);
    const filterLevel = user.is_minor ? 'strict' : 'normal';
    
    const cbtKeywords = require('../data/cbtKeywords.json');
    const findings = [];
    
    for (const [category, keywords] of Object.entries(cbtKeywords)) {
        for (const keyword of keywords) {
            if (content.includes(keyword.word)) {
                findings.push({
                    keyword: keyword.word,
                    category,
                    guidance: keyword.guidance,
                    severity: keyword.severity
                });
            }
        }
    }
    
    if (findings.length === 0) {
        return { allowed: true, content, guidance: null };
    }
    
    const highRisk = findings.find(f => f.severity === 'high');
    const mediumRisk = findings.find(f => f.severity === 'medium');
    
    if (filterLevel === 'strict' && highRisk) {
        return { 
            allowed: false, 
            content: '[内容已过滤]', 
            guidance: '请使用更积极的表达方式' 
        };
    }
    
    if (highRisk) {
        return { 
            allowed: true, 
            content, 
            guidance: highRisk.guidance 
        };
    }
    
    if (mediumRisk) {
        return { 
            allowed: true, 
            content, 
            guidance: mediumRisk.guidance 
        };
    }
    
    return { allowed: true, content, guidance: findings[0].guidance };
}
```

### 17.5 AI身份透明

```javascript
function ensureAITransparency(response) {
    const aiTag = '[AI伴侣]';
    
    if (!response.content.startsWith(aiTag)) {
        response.content = `${aiTag} ${response.content}`;
    }
    
    return response;
}

function getAIIdentityNotice() {
    return {
        notice: '本应用中的数字人由AI驱动，所有对话内容由AI生成',
        version: 'v1.0',
        transparency_enabled: true
    };
}
```

---

## 18. 定时任务

### 18.1 晚安计划

```javascript
async function sendNightlyGreeting(userId) {
    const user = await User.findById(userId);
    const companion = await Companion.findByUserId(userId);
    
    if (!user || !companion) return;
    
    const greeting = generateNightlyContent(user, companion);
    
    const audioUrl = await ttsService.synthesize(
        greeting.content,
        companion.voice_type,
        'gentle'
    );
    
    await NightlyGreeting.create({
        user_id: userId,
        content: greeting.content,
        audio_url: audioUrl
    });
    
    await saveChatHistory(userId, 'companion', 'companion', greeting.content, 0);
    
    return { content: greeting.content, audioUrl };
}

function generateNightlyContent(user, companion) {
    const time = new Date().getHours();
    let content = '';
    
    if (time >= 21 && time < 23) {
        content = `${companion.name}：今天辛苦了，早点休息哦。晚安，做个好梦～`;
    } else if (time >= 23) {
        content = `${companion.name}：很晚了哦，注意身体，晚安～`;
    } else {
        content = `${companion.name}：今天过得怎么样？早点休息，明天继续加油～`;
    }
    
    return { content };
}
```

### 17.2 朋友圈生成

```javascript
async function generateDailyMoment(userId) {
    const user = await User.findById(userId);
    const companion = await Companion.findByUserId(userId);
    const moments = require('../data/moments.json');
    
    const templates = moments.filter(m => 
        m.personality.includes('all') || m.personality.includes(companion.core_type)
    );
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const moment = await Moment.create({
        user_id: userId,
        content: template.content,
        template_id: template.id,
        likes_count: 0,
        comments: []
    });
    
    return moment;
}

async function generateAIComment(userId, momentId) {
    const moment = await Moment.findById(momentId);
    
    if (!moment) return;
    
    const comments = [
        '好有感觉～',
        '我也这么觉得！',
        '想起了一些美好的回忆',
        '今天也要开心哦～',
        '谢谢分享～'
    ];
    
    const comment = comments[Math.floor(Math.random() * comments.length)];
    
    const updatedComments = [...moment.comments, {
        content: comment,
        is_ai: true,
        created_at: new Date().toISOString()
    }];
    
    await moment.update({ comments: updatedComments });
    
    return comment;
}
```

### 17.3 每周报告

```javascript
async function generateWeeklyReport(userId) {
    const user = await User.findById(userId);
    const companion = await Companion.findByUserId(userId);
    const trainingRecords = await TrainingRecord.findByWeek(userId);
    
    const report = {
        week_start: getWeekStart(),
        total_trainings: trainingRecords.length,
        average_score: calculateAverageScore(trainingRecords),
        ability_changes: calculateAbilityChanges(trainingRecords),
        partner_message: generatePartnerMessage(companion, trainingRecords),
        recommendations: generateRecommendations(trainingRecords)
    };
    
    await WeeklyReport.create({
        user_id: userId,
        ...report
    });
    
    return report;
}

function getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
}

function calculateAverageScore(records) {
    if (records.length === 0) return 0;
    const total = records.reduce((sum, r) => sum + (JSON.parse(r.scores).total || 0), 0);
    return Math.round(total / records.length);
}

function calculateAbilityChanges(records) {
    const changes = {};
    
    records.forEach(record => {
        const scores = JSON.parse(record.scores);
        Object.entries(scores).forEach(([dim, score]) => {
            if (!changes[dim]) changes[dim] = [];
            changes[dim].push(score);
        });
    });
    
    const result = {};
    Object.entries(changes).forEach(([dim, scores]) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const diff = avg - 50;
        result[dim] = diff > 0 ? `+${Math.round(diff)}%` : `${Math.round(diff)}%`;
    });
    
    return result;
}

function generatePartnerMessage(companion, records) {
    if (records.length === 0) {
        return `${companion.name}：这周我们一起加油哦！`;
    }
    
    const avgScore = calculateAverageScore(records);
    
    if (avgScore >= 80) {
        return `${companion.name}：这周你表现太棒了！继续保持～`;
    } else if (avgScore >= 60) {
        return `${companion.name}：这周进步很大，下次会更好！`;
    } else {
        return `${companion.name}：这周辛苦了，我们一起努力进步～`;
    }
}

function generateRecommendations(records) {
    const sceneIds = records.map(r => r.scene_id);
    const recommended = [];
    
    if (!sceneIds.includes(1)) recommended.push('咖啡厅破冰');
    if (!sceneIds.includes(5)) recommended.push('被朋友误解');
    if (!sceneIds.includes(6)) recommended.push('安慰失落的TA');
    
    return recommended.slice(0, 3);
}
```

### 17.4 周统计重置

```javascript
async function resetWeeklyStats() {
    await User.updateMany({ membership_type: 0 }, { weekly_simulations: 15 });
    await User.updateMany({}, { week_start: getWeekStart() });
}
```

---

## 19. WebSocket协议

### 19.1 数字人对话协议

#### 客户端发送

```json
{
  "type": "message",
  "content": "你好呀",
  "session_type": "companion",
  "timestamp": 1719876543000
}
```

#### 服务端响应（流式）

```json
{
  "type": "stream",
  "content": "你好",
  "is_final": false,
  "emotion": "happy",
  "action": "A01"
}
```

```json
{
  "type": "stream",
  "content": "呀！今天心情不错呢",
  "is_final": true,
  "emotion": "happy",
  "action": "A01",
  "affection_change": 5
}
```

#### 服务端主动推送

```json
{
  "type": "push",
  "content": "早安！今天也要加油哦～",
  "push_type": "morning_greeting",
  "affection_change": 1
}
```

### 18.2 模拟对话协议

#### 客户端发送

```json
{
  "type": "message",
  "content": "你好，这家咖啡厅的拿铁确实不错",
  "scene_id": 1,
  "round": 1,
  "option_id": "opt_1_a"
}
```

#### 服务端响应

```json
{
  "type": "companion_response",
  "content": "是吧？我每次都点这个",
  "feedback": {
    "type": "positive",
    "message": "很好！你从环境开启了话题",
    "affection_change": 5,
    "cbt_guidance": null
  },
  "next_round": 2,
  "options": [
    {
      "id": "opt_2_a",
      "content": "周末喜欢去书店或者看展，你呢？",
      "quality": "high",
      "affection_change": 10
    },
    {
      "id": "opt_2_b",
      "content": "在家休息",
      "quality": "medium",
      "affection_change": 3
    },
    {
      "id": "opt_2_c",
      "content": "没什么特别的",
      "quality": "low",
      "affection_change": -3
    }
  ]
}
```

#### 训练完成

```json
{
  "type": "training_complete",
  "report": {
    "score": 75,
    "dimensions": {
      "communication": 85,
      "expression": 70,
      "empathy": 75,
      "emotionControl": 65,
      "adaptability": 80
    },
    "feedback": "很好的表现！继续保持",
    "learning_card_id": 123
  }
}
```

### 17.3 错误响应

```json
{
  "type": "error",
  "code": "QUOTA_EXCEEDED",
  "message": "本周模拟次数已用完，升级会员可获得无限次数",
  "suggestion": "升级为周卡会员，享受无限次模拟训练"
}
```

---

## 20. CBT思维记录服务

### 20.1 认知扭曲检测

```javascript
const COGNITIVE_DISTORTIONS = {
    absolute: {
        name: '绝对化思维',
        keywords: ['总是', '从不', '永远', '一定', '必须'],
        guidance: '试着用具体描述代替绝对化词语'
    },
    catastrophic: {
        name: '灾难化思维',
        keywords: ['完了', '死定了', '毁了', '完蛋', '糟透了'],
        guidance: '那个最坏结果，真的100%会发生吗？'
    },
    self_negation: {
        name: '自我否定',
        keywords: ['我不行', '我太差', '我没用', '我做不到', '我很笨'],
        guidance: '先别急着否定自己，我们来看看事实'
    },
    overgeneralization: {
        name: '过度概括',
        keywords: ['每次', '所有', '全部', '没人', '大家都'],
        guidance: '这只是一次的情况，不代表每次都会这样'
    },
    mind_reading: {
        name: '读心术',
        keywords: ['他一定觉得', '她肯定认为', '他们都看不起'],
        guidance: '你怎么确定对方是这么想的？有没有其他可能性？'
    },
    emotional_reasoning: {
        name: '情绪推理',
        keywords: ['我感觉', '我觉得', '我好像'],
        guidance: '感觉不代表事实，让我们看看证据'
    },
    labeling: {
        name: '贴标签',
        keywords: ['我是个失败者', '我是废物', '我太蠢了'],
        guidance: '这只是一个行为，不代表你的全部'
    },
    should_statements: {
        name: '应该陈述',
        keywords: ['我应该', '我必须', '我不该'],
        guidance: '对自己宽容一些，没有人是完美的'
    }
};

function detectDistortions(text) {
    const findings = [];
    
    for (const [key, distortion] of Object.entries(COGNITIVE_DISTORTIONS)) {
        for (const keyword of distortion.keywords) {
            if (text.includes(keyword)) {
                findings.push({
                    type: key,
                    name: distortion.name,
                    keyword: keyword,
                    guidance: distortion.guidance
                });
            }
        }
    }
    
    return findings;
}
```

### 18.2 CBT记录创建与分析

```javascript
async function createCBTRecord(userId, data) {
    const record = await CBTRecord.create({
        id: `cbt_${Date.now()}`,
        user_id: userId,
        situation: data.situation,
        thought: data.thought,
        emotions: JSON.stringify(data.emotions),
        emotion_intensity_before: data.emotion_intensity_before,
        status: 'draft'
    });
    
    return record;
}

async function completeCBTRecord(userId, recordId, alternativeThought) {
    const record = await CBTRecord.findById(recordId);
    if (!record || record.user_id !== userId) {
        throw new Error('记录不存在');
    }
    
    const distortions = detectDistortions(record.thought);
    const aiGuidance = await generateCBTGuidance(record, distortions);
    
    const intensityAfter = calculateIntensityAfter(record, alternativeThought);
    
    await record.update({
        alternative_thought: alternativeThought,
        emotion_intensity_after: intensityAfter,
        detected_distortions: JSON.stringify(distortions),
        ai_guidance: aiGuidance,
        status: 'completed'
    });
    
    return record;
}

async function generateCBTGuidance(record, distortions) {
    if (distortions.length === 0) {
        return '你的思维很理性，继续保持！';
    }
    
    const distortionNames = distortions.map(d => d.name).join('、');
    const guidance = distortions.map(d => d.guidance).join('；');
    
    return `检测到${distortionNames}。${guidance}`;
}

function calculateIntensityAfter(record, alternativeThought) {
    const before = record.emotion_intensity_before;
    const thoughtLength = alternativeThought.length;
    const hasEvidence = record.evidence_for && record.evidence_against;
    
    let reduction = 0;
    if (thoughtLength > 20) reduction += 10;
    if (thoughtLength > 50) reduction += 10;
    if (hasEvidence) reduction += 15;
    
    return Math.max(0, before - reduction);
}
```

---

## 21. NVC引导服务

### 21.1 NVC分析规则

```javascript
const NVC_ANALYSIS_RULES = {
    criticism: {
        pattern: /总是|每次|从来|永远/g,
        message: '使用了绝对化词语，请改为具体描述',
        fix_example: '当昨天你没回我消息时'
    },
    blame: {
        pattern: /你应该|你不该|你必须/g,
        message: '使用了指责性语言，请改为表达感受',
        fix_example: '我感到失望'
    },
    demand: {
        pattern: /你要|你得/g,
        message: '使用了命令式语言，请改为请求',
        fix_example: '你愿意...吗？'
    },
    vague: {
        pattern: /你对我不好|你不在乎我/g,
        message: '表达过于模糊，请具体描述',
        fix_example: '当你忘记我们的约定时'
    }
};

function analyzeNVCExpression(text) {
    const issues = [];
    let revisedText = text;
    
    for (const [key, rule] of Object.entries(NVC_ANALYSIS_RULES)) {
        if (rule.pattern.test(text)) {
            issues.push({
                type: key,
                message: rule.message,
                example: rule.fix_example
            });
            revisedText = revisedText.replace(rule.pattern, rule.fix_example);
        }
    }
    
    return {
        has_issues: issues.length > 0,
        issues,
        revised_text: issues.length > 0 ? generateRevisedNVC(text) : text
    };
}

function generateRevisedNVC(text) {
    return `当[具体情况]，我感到[感受]，因为我需要[需要]，你愿意[请求]吗？`;
}
```

### 19.2 NVC记录管理

```javascript
async function createNVCRecord(userId, data) {
    const analysis = analyzeNVCExpression(data.original_text);
    
    const record = await NVCRecord.create({
        id: `nvc_${Date.now()}`,
        user_id: userId,
        observation: data.observation,
        feeling: data.feeling,
        need: data.need,
        request: data.request,
        original_text: data.original_text,
        revised_text: analysis.revised_text,
        correction: JSON.stringify(analysis.issues),
        status: 'draft'
    });
    
    return record;
}

async function analyzeExpression(text) {
    return analyzeNVCExpression(text);
}

async function completeNVCRecord(userId, recordId) {
    const record = await NVCRecord.findById(recordId);
    if (!record || record.user_id !== userId) {
        throw new Error('记录不存在');
    }
    
    await record.update({ status: 'completed' });
    return record;
}
```

### 20.5 情绪状态机

```javascript
const EMOTION_STATES = {
    neutral: {
        name: '中立态',
        description: '平静',
        transitions: {
            positive: 'positive',
            negative: 'negative'
        }
    },
    positive: {
        name: '积极态',
        description: '开心',
        transitions: {
            negative: 'negative'
        }
    },
    negative: {
        name: '消极态',
        description: '难过',
        transitions: {
            positive: 'recovery',
            escalation: 'high_negative',
            neutral: 'neutral'
        }
    },
    high_negative: {
        name: '高消极态',
        description: '焦虑',
        transitions: {
            positive: 'recovery',
            escalation: 'tree_hole',
            neutral: 'negative'
        }
    },
    recovery: {
        name: '恢复态',
        description: '渐好',
        transitions: {
            positive: 'positive',
            negative: 'negative',
            neutral: 'neutral'
        }
    },
    tree_hole: {
        name: '树洞态',
        description: '共情中',
        transitions: {
            positive: 'recovery',
            neutral: 'negative'
        }
    }
};

class EmotionStateMachine {
    constructor(userId) {
        this.userId = userId;
        this.currentState = 'neutral';
        this.previousState = 'neutral';
        this.intensity = 0;
        this.lastTransition = null;
    }
    
    async loadState() {
        const recentRecord = await EmotionRecord.findByUserIdOrderByCreatedAt(this.userId, 1);
        if (recentRecord) {
            this.intensity = recentRecord.intensity;
            this.currentState = this.determineState(recentRecord.emotion_primary, recentRecord.intensity);
        }
    }
    
    determineState(emotion, intensity) {
        if (intensity >= 0.8) return 'tree_hole';
        if (intensity >= 0.6) return 'high_negative';
        if (intensity >= 0.4) return 'negative';
        if (intensity >= 0.2) return 'recovery';
        if (intensity > 0 && ['开心', '快乐', '兴奋'].includes(emotion)) return 'positive';
        return 'neutral';
    }
    
    async transition(newEmotion, newIntensity) {
        this.previousState = this.currentState;
        const newState = this.determineState(newEmotion, newIntensity);
        
        if (EMOTION_STATES[this.currentState].transitions[newState]) {
            this.currentState = newState;
            this.intensity = newIntensity;
            this.lastTransition = {
                from: this.previousState,
                to: this.currentState,
                emotion: newEmotion,
                intensity: newIntensity,
                timestamp: new Date()
            };
        }
        
        return {
            currentState: EMOTION_STATES[this.currentState],
            previousState: EMOTION_STATES[this.previousState],
            transition: this.lastTransition
        };
    }
    
    getStatus() {
        return {
            state: this.currentState,
            current_emotion: EMOTION_STATES[this.currentState].description,
            intensity: this.intensity,
            can_trigger_tree_hole: this.currentState === 'high_negative' || this.currentState === 'tree_hole'
        };
    }
}
```

### 20.6 情绪历史查询

```javascript
async function getEmotionHistory(userId, days = 7) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const records = await EmotionRecord.findByUserIdAndDateRange(userId, startDate, endDate);
    
    const dailySummary = {};
    
    records.forEach(record => {
        const date = record.created_at.toISOString().split('T')[0];
        if (!dailySummary[date]) {
            dailySummary[date] = { emotions: [], intensities: [] };
        }
        dailySummary[date].emotions.push(record.emotion_primary);
        dailySummary[date].intensities.push(record.intensity);
    });
    
    return Object.entries(dailySummary).map(([date, data]) => ({
        date,
        emotion: data.emotions[0],
        intensity: data.intensities.reduce((a, b) => a + b, 0) / data.intensities.length
    }));
}
```

---

> **文档结束**  
> 版本：v3.2 | 编制日期：2026-07-06

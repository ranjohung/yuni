# 后端数据库设计

> 版本：v3.2  
> 适用对象：后端开发团队  
> 技术栈：MySQL 8.0 + Redis 7.0 + Milvus

---

## 1. 核心数据表（19张）

### 1.1 用户表 (users)

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

### 1.2 伴侣配置表 (companion_config)

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

### 1.3 亲密度表 (affection)

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

### 1.4 社交场景表 (social_scenes)

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
    INDEX idx_difficulty (difficulty)
);
```

### 1.5 用户场景进度表 (user_scene_progress)

```sql
CREATE TABLE user_scene_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    scene_id BIGINT NOT NULL COMMENT '场景ID',
    status TINYINT DEFAULT 0 COMMENT '0:未开始 1:进行中 2:已完成',
    attempts INT DEFAULT 0 COMMENT '尝试次数',
    best_score INT DEFAULT 0 COMMENT '最佳评分',
    last_completed_at DATETIME COMMENT '最后完成时间',
    unlocked_at DATETIME COMMENT '解锁时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_scene (user_id, scene_id),
    INDEX idx_status (status)
);
```

### 1.6 对话会话表 (chat_sessions)

```sql
CREATE TABLE chat_sessions (
    id VARCHAR(36) PRIMARY KEY COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    session_type VARCHAR(20) COMMENT '日常/模拟/树洞/建议',
    context_summary TEXT COMMENT '上下文摘要',
    emotion_state VARCHAR(20) COMMENT '情绪状态',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否活跃',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME COMMENT '结束时间',
    INDEX idx_user_id (user_id),
    INDEX idx_session_type (session_type)
);
```

### 1.7 对话消息表 (chat_messages)

```sql
CREATE TABLE chat_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(36) NOT NULL COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role VARCHAR(10) NOT NULL COMMENT 'user/assistant/system',
    content TEXT NOT NULL COMMENT '消息内容',
    emotion_tags JSON COMMENT '情绪标签',
    response_quality TINYINT COMMENT '1-5 回应质量',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

### 1.8 情绪记录表 (emotion_records)

```sql
CREATE TABLE emotion_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    emotion_type VARCHAR(20) NOT NULL COMMENT '情绪类型',
    emotion_score INT COMMENT '情绪分值',
    context TEXT COMMENT '情绪上下文',
    source VARCHAR(20) COMMENT '来源:对话/日记/训练',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_emotion_type (emotion_type),
    INDEX idx_created_at (created_at)
);
```

### 1.9 CBT思维记录表 (cbt_records)

```sql
CREATE TABLE cbt_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    situation TEXT COMMENT '情境描述',
    automatic_thought TEXT COMMENT '自动思维',
    emotion VARCHAR(20) COMMENT '情绪',
    evidence_for TEXT COMMENT '支持证据',
    evidence_against TEXT COMMENT '反对证据',
    alternative_thought TEXT COMMENT '替代思维',
    cognitive_distortions JSON COMMENT '认知扭曲类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);
```

### 1.10 NVC沟通记录表 (nvc_records)

```sql
CREATE TABLE nvc_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    observation TEXT COMMENT '观察',
    feeling VARCHAR(20) COMMENT '感受',
    need VARCHAR(50) COMMENT '需要',
    request TEXT COMMENT '请求',
    scene_id BIGINT COMMENT '关联场景ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);
```

### 1.11 朋友圈动态表 (moments)

```sql
CREATE TABLE moments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    content TEXT COMMENT '动态内容',
    image_urls JSON COMMENT '图片URL列表',
    likes_count INT DEFAULT 0 COMMENT '点赞数',
    comments_count INT DEFAULT 0 COMMENT '评论数',
    is_ai_generated BOOLEAN DEFAULT FALSE COMMENT '是否AI生成',
    template_id INT COMMENT '模板ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

### 1.12 朋友圈点赞表 (moment_likes)

```sql
CREATE TABLE moment_likes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    moment_id BIGINT NOT NULL COMMENT '动态ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_moment_user (moment_id, user_id),
    INDEX idx_moment_id (moment_id)
);
```

### 1.13 学习卡片表 (learning_cards)

```sql
CREATE TABLE learning_cards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    card_type VARCHAR(20) COMMENT '卡片类型',
    title VARCHAR(100) COMMENT '卡片标题',
    content TEXT COMMENT '卡片内容',
    mastery_level INT DEFAULT 0 COMMENT '掌握程度 0-100',
    acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_card_type (card_type)
);
```

### 1.14 情绪日记表 (emotion_diary)

```sql
CREATE TABLE emotion_diary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    content TEXT COMMENT '日记内容',
    emotion VARCHAR(20) COMMENT '情绪',
    emotion_score INT COMMENT '情绪分值',
    insights TEXT COMMENT 'AI分析洞察',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

### 1.15 每周报告表 (weekly_reports)

```sql
CREATE TABLE weekly_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    week_start DATE NOT NULL COMMENT '周起始日',
    week_end DATE NOT NULL COMMENT '周结束日',
    abilities JSON COMMENT '能力变化数据',
    training_stats JSON COMMENT '训练统计',
    suggestions JSON COMMENT '改进建议',
    achievements JSON COMMENT '成就列表',
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_week (user_id, week_start),
    INDEX idx_user_id (user_id)
);
```

### 1.16 会员订单表 (membership_orders)

```sql
CREATE TABLE membership_orders (
    id VARCHAR(36) PRIMARY KEY COMMENT '订单ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    membership_type TINYINT NOT NULL COMMENT '会员类型',
    price DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    status TINYINT DEFAULT 0 COMMENT '0:待支付 1:已支付 2:已取消',
    transaction_id VARCHAR(100) COMMENT '支付交易ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME COMMENT '支付时间',
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);
```

### 1.17 礼物记录表 (gift_records)

```sql
CREATE TABLE gift_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    gift_type VARCHAR(20) COMMENT '礼物类型',
    gift_name VARCHAR(50) COMMENT '礼物名称',
    affection_gain INT COMMENT '好感度增加量',
    points_cost INT COMMENT '消耗积分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);
```

### 1.18 晚安计划记录表 (nightly_records)

```sql
CREATE TABLE nightly_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    greeting TEXT COMMENT '晚安问候内容',
    story_id INT COMMENT '故事ID',
    music_type VARCHAR(20) COMMENT '音乐类型',
    duration INT COMMENT '收听时长(秒)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

### 1.19 时空穿梭记录表 (timetravel_records)

```sql
CREATE TABLE timetravel_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    scene_id BIGINT NOT NULL COMMENT '场景ID',
    tickets_used INT DEFAULT 1 COMMENT '消耗穿梭券数量',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_scene_id (scene_id)
);
```

---

## 2. Redis缓存设计

### 2.1 缓存键设计

| 缓存键 | 类型 | 过期时间 | 说明 |
|--------|------|---------|------|
| user:{userId}:info | Hash | 5分钟 | 用户基本信息 |
| user:{userId}:membership | String | 1小时 | 会员状态 |
| user:{userId}:affection | Hash | 1分钟 | 好感度数据 |
| scene:{sceneId}:detail | String | 1小时 | 场景详情 |
| chat:{sessionId}:context | String | 30分钟 | 对话上下文 |
| daily:usage:{userId} | String | 24小时 | 今日使用时长 |
| rate:limit:{ip} | String | 15分钟 | 速率限制计数 |

### 2.2 缓存策略

```javascript
async function getUserFromCache(userId) {
  const cacheKey = `user:${userId}:info`;
  const cached = await redis.hGetAll(cacheKey);
  
  if (cached && Object.keys(cached).length > 0) {
    return JSON.parse(cached.data);
  }
  
  const user = await User.findById(userId);
  await redis.hSet(cacheKey, { data: JSON.stringify(user) });
  await redis.expire(cacheKey, 300);
  
  return user;
}
```

---

## 3. Milvus向量数据库设计

### 3.1 集合设计

| 集合名称 | 向量维度 | 用途 |
|---------|---------|------|
| user_memories | 768 | 用户长期记忆 |
| scene_knowledge | 768 | 场景知识库 |
| emotion_patterns | 768 | 情绪模式 |

### 3.2 记忆检索

```javascript
async function searchMemories(userId, query, topK = 5) {
  const queryVector = await generateEmbedding(query);
  
  const results = await milvus.search({
    collectionName: 'user_memories',
    queryVectors: [queryVector],
    filter: `user_id == "${userId}"`,
    topK: topK,
    params: { nprobe: 10 },
  });
  
  return results.map(r => ({
    content: r.entity.content,
    relevance: r.score,
    timestamp: r.entity.timestamp,
  }));
}
```
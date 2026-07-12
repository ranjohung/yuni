# 后端核心引擎

> 版本：v3.2  
> 适用对象：后端开发团队  
> 技术栈：Node.js + Express + DeepSeek + Ollama

---

## 1. LLM混合路由引擎

### 1.1 路由策略

| 用户等级 | 主LLM | 备用LLM | 上下文长度 | 调用频率限制 |
|---------|-------|---------|-----------|-------------|
| 体验版 | DeepSeek Lite | Ollama Qwen2.5:7B | 4k | 10次/分钟 |
| 免费版 | DeepSeek Lite | Ollama Qwen2.5:7B | 4k | 20次/分钟 |
| 基础会员 | DeepSeek Chat | Ollama Qwen2.5:14B | 8k | 50次/分钟 |
| 标准会员 | DeepSeek Chat | Ollama Qwen2.5:14B | 8k | 100次/分钟 |
| 尊享会员 | DeepSeek Pro | Ollama Qwen2.5:32B | 16k | 200次/分钟 |

### 1.2 路由实现

```javascript
class LLMProxy {
  constructor() {
    this.clients = {
      deepseekLite: new DeepSeekClient('lite'),
      deepseekChat: new DeepSeekClient('chat'),
      deepseekPro: new DeepSeekClient('pro'),
      ollama: new OllamaClient(),
    };
  }

  async request(userId, messages, options = {}) {
    const user = await this.getUserLevel(userId);
    const config = this.getConfig(user.membership_type);

    try {
      const response = await this.clients[config.primary].request(messages, {
        maxTokens: config.contextLength,
        temperature: options.temperature || 0.7,
      });
      return response;
    } catch (error) {
      console.warn(`Primary LLM failed, falling back to ${config.fallback}`);
      return this.clients[config.fallback].request(messages, {
        maxTokens: config.contextLength,
        temperature: options.temperature || 0.7,
      });
    }
  }

  getUserLevel(userId) {
    return User.findById(userId).select('membership_type');
  }

  getConfig(level) {
    const configs = {
      0: { primary: 'deepseekLite', fallback: 'ollama', contextLength: 4096 },
      1: { primary: 'deepseekChat', fallback: 'ollama', contextLength: 8192 },
      2: { primary: 'deepseekChat', fallback: 'ollama', contextLength: 8192 },
      3: { primary: 'deepseekPro', fallback: 'ollama', contextLength: 16384 },
    };
    return configs[level] || configs[0];
  }
}
```

### 1.3 成本控制

```javascript
async function checkDailyQuota(userId) {
  const today = new Date().toISOString().split('T')[0];
  const key = `llm:quota:${userId}:${today}`;
  
  const count = await redis.get(key);
  if (count && parseInt(count) >= 100) {
    return { allowed: false, message: '今日LLM调用次数已达上限' };
  }
  
  await redis.incr(key);
  await redis.expire(key, 86400);
  
  return { allowed: true };
}
```

---

## 2. 数字人引擎

### 2.1 分级渲染策略

| 会员等级 | 渲染类型 | 实现方式 | 动作数量 |
|---------|---------|---------|---------|
| 免费版 | 2D数字人 | Spine 2D | 8个 |
| 基础会员 | 2.5D Live2D | Live2D SDK | 12个 |
| 标准会员 | 3D数字人 | Three.js | 25个 |
| 尊享会员 | 3D+真人风格 | Three.js + 自定义材质 | 25个+自定义 |

### 2.2 动作触发逻辑

```javascript
class DigitalHumanEngine {
  constructor() {
    this.animations = {
      idle: { name: 'idle', duration: 3000, loop: true },
      smile: { name: 'smile', duration: 1500, loop: false },
      wave: { name: 'wave', duration: 2000, loop: false },
      think: { name: 'think', duration: 2500, loop: true },
      happy: { name: 'happy', duration: 2000, loop: false },
      shy: { name: 'shy', duration: 1800, loop: false },
    };
  }

  getAnimation(triggerType, affectionLevel) {
    const triggers = {
      greeting: 'wave',
      compliment: 'happy',
      intimate: 'shy',
      thinking: 'think',
      default: 'idle',
    };

    if (affectionLevel >= 80 && triggerType === 'compliment') {
      return this.animations.happy;
    }

    if (affectionLevel >= 60 && triggerType === 'intimate') {
      return this.animations.shy;
    }

    return this.animations[triggers[triggerType]] || this.animations.idle;
  }

  generateExpression(text) {
    const keywords = {
      happy: ['开心', '高兴', '快乐', '幸福'],
      sad: ['难过', '伤心', '失落', '沮丧'],
      angry: ['生气', '愤怒', '不满', '讨厌'],
      surprised: ['惊讶', '惊喜', '没想到'],
    };

    for (const [emotion, words] of Object.entries(keywords)) {
      if (words.some(word => text.includes(word))) {
        return emotion;
      }
    }
    return 'neutral';
  }
}
```

---

## 3. 模拟引擎

### 3.1 对话评估维度

| 维度 | 权重 | 评估内容 |
|------|------|---------|
| 话题开启自然度 | 20% | 是否从环境/兴趣切入 |
| 回应长度 | 15% | 回应是否过于简短 |
| 自信程度 | 20% | 是否使用肯定句式 |
| 信息完整性 | 15% | 是否表达完整信息 |
| 开放性 | 10% | 是否提问引导对方 |
| 情绪控制 | 20% | 是否情绪稳定 |

### 3.2 评估实现

```javascript
class SimulationEngine {
  async evaluateResponse(userId, sceneId, userResponse, aiResponse) {
    const scene = await SocialScene.findById(sceneId);
    const dimensions = scene.evaluation_dimensions;
    
    let score = 0;
    
    if (userResponse.length >= 10) {
      score += dimensions['回应长度'] * 0.15;
    }
    
    if (userResponse.includes('吗') || userResponse.includes('呢')) {
      score += dimensions['开放性'] * 0.10;
    }
    
    if (!['很', '非常', '太'].some(w => userResponse.includes(w))) {
      score += dimensions['情绪控制'] * 0.20;
    }
    
    score = Math.min(score, 100);
    
    await UserSceneProgress.findOneAndUpdate(
      { user_id: userId, scene_id: sceneId },
      { $inc: { attempts: 1 }, best_score: Math.max(score, this.getBestScore(userId, sceneId)) }
    );
    
    return { score, dimensions };
  }
}
```

---

## 4. 好感度引擎

### 4.1 好感度等级

| 等级 | 名称 | 分值范围 | 解锁功能 |
|------|------|---------|---------|
| 1 | 初识 | 0-100 | 基础对话 |
| 2 | 朋友 | 101-300 | 语音通话、送礼 |
| 3 | 好友 | 301-600 | 朋友圈、时空穿梭 |
| 4 | 密友 | 601-1000 | 高级场景、自定义角色 |
| 5 | 灵魂伴侣 | 1000+ | 全部功能 |

### 4.2 好感度增减规则

```javascript
class AffectionEngine {
  async calculateChange(userId, actionType, metadata) {
    const affection = await Affection.findById(userId);
    let change = 0;

    const rules = {
      daily_login: () => 5,
      chat_message: () => 1,
      voice_call: () => 5 * metadata.durationMinutes,
      gift: () => metadata.giftValue,
      scene_completion: () => 10 * metadata.score / 100,
      like_moment: () => 2,
      comment_moment: () => 3,
      cbt_record: () => 3,
      nvc_record: () => 3,
      emotion_diary: () => 2,
    };

    change = rules[actionType]?.() || 0;

    if (actionType === 'chat_message' && affection.daily_interaction_count >= 20) {
      change = Math.floor(change * 0.5);
    }

    const newScore = Math.min(affection.score + change, 2000);
    const newLevel = this.calculateLevel(newScore);

    await Affection.findByIdAndUpdate(userId, {
      score: newScore,
      level: newLevel,
      daily_interaction_count: actionType === 'chat_message' ? affection.daily_interaction_count + 1 : affection.daily_interaction_count,
    });

    return { change, newScore, newLevel };
  }

  calculateLevel(score) {
    if (score >= 1000) return 5;
    if (score >= 600) return 4;
    if (score >= 300) return 4;
    if (score >= 100) return 2;
    return 1;
  }
}
```

---

## 5. 记忆系统

### 5.1 记忆分类

| 类型 | 存储方式 | 过期时间 | 用途 |
|------|---------|---------|------|
| 短期记忆 | Redis | 1小时 | 当前对话上下文 |
| 中期记忆 | MySQL | 30天 | 用户偏好、近期互动 |
| 长期记忆 | Milvus | 永久 | 重要事件、情感关联 |

### 5.2 记忆检索与注入

```javascript
class MemoryEngine {
  async retrieveMemories(userId, query) {
    const shortTerm = await this.getShortTermMemory(userId);
    const longTerm = await this.searchLongTermMemory(userId, query);
    
    return [...shortTerm, ...longTerm].slice(0, 10);
  }

  async getShortTermMemory(userId) {
    const key = `chat:${userId}:recent`;
    return redis.lrange(key, 0, 10);
  }

  async searchLongTermMemory(userId, query) {
    const results = await milvus.search({
      collectionName: 'user_memories',
      queryVectors: [await this.generateEmbedding(query)],
      filter: `user_id == "${userId}"`,
      topK: 5,
    });
    return results.map(r => r.entity.content);
  }

  async addMemory(userId, content, type = 'long') {
    if (type === 'short') {
      const key = `chat:${userId}:recent`;
      await redis.lpush(key, content);
      await redis.ltrim(key, 0, 19);
    } else {
      const vector = await this.generateEmbedding(content);
      await milvus.insert({
        collectionName: 'user_memories',
        entities: [{
          content,
          user_id: userId,
          vector,
          timestamp: new Date().toISOString(),
        }],
      });
    }
  }
}
```

---

## 6. 情绪识别引擎

### 6.1 多模态分析

| 模态 | 分析方法 | 数据来源 |
|------|---------|---------|
| 文本 | LLM情感分析 | 用户输入文本 |
| 语音 | 声纹+音调分析 | 语音通话 |
| 行为 | 操作频率+时长分析 | 用户行为日志 |

### 6.2 情绪状态机

```javascript
class EmotionEngine {
  async analyze(userId, input, source) {
    const textEmotion = await this.analyzeText(input);
    const behaviorEmotion = await this.analyzeBehavior(userId);
    
    const finalEmotion = this.fuseEmotions([textEmotion, behaviorEmotion]);
    
    await EmotionRecord.create({
      user_id: userId,
      emotion_type: finalEmotion.type,
      emotion_score: finalEmotion.score,
      context: input.slice(0, 100),
      source: source,
    });
    
    return finalEmotion;
  }

  async analyzeText(text) {
    const response = await llm.request([{
      role: 'system',
      content: '分析以下文本的情绪，返回JSON格式：{type, score}',
    }, {
      role: 'user',
      content: text,
    }]);
    return JSON.parse(response.content);
  }

  async analyzeBehavior(userId) {
    const recentActivity = await this.getRecentActivity(userId);
    const frequency = recentActivity.length;
    const avgDuration = recentActivity.reduce((sum, a) => sum + a.duration, 0) / frequency;
    
    if (frequency > 10 && avgDuration > 5) {
      return { type: 'engaged', score: 80 };
    }
    return { type: 'neutral', score: 50 };
  }

  fuseEmotions(emotions) {
    const weighted = emotions.map(e => ({
      ...e,
      weight: e.source === 'text' ? 0.6 : 0.4,
    }));
    
    const score = weighted.reduce((sum, e) => sum + e.score * e.weight, 0);
    const type = weighted.sort((a, b) => b.score - a.score)[0].type;
    
    return { type, score: Math.round(score) };
  }
}
```

---

## 7. 融合决策引擎

### 7.1 决策规则

| 情绪状态 | 触发模式 | 响应策略 |
|---------|---------|---------|
| 低落/悲伤 | 树洞模式 | 共情倾听，不主动给建议 |
| 焦虑/愤怒 | 建议模式 | 引导CBT/NVC，提供解决方案 |
| 平静/愉悦 | 混合模式 | 日常对话 + 适时建议 |

### 7.2 决策实现

```javascript
class DecisionEngine {
  async decide(userId, emotion) {
    const user = await User.findById(userId);
    const affection = await Affection.findById(userId);
    
    let mode = 'mixed';
    let responseStrategy = 'default';

    if (['低落', '悲伤', '绝望'].includes(emotion.type)) {
      mode = 'treehole';
      responseStrategy = 'empathy';
    } else if (['焦虑', '愤怒', '紧张'].includes(emotion.type)) {
      mode = 'suggestion';
      responseStrategy = 'cbt_guide';
    }

    if (affection.level >= 3) {
      responseStrategy += '_personalized';
    }

    return { mode, strategy: responseStrategy };
  }
}
```
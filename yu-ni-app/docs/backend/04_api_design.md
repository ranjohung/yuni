# 后端API接口设计

> 版本：v3.2  
> 适用对象：后端开发团队、前端开发团队  
> 技术栈：Node.js + Express

---

## 1. 用户认证接口

### 1.1 注册

**POST** `/api/v1/auth/register`

请求体：
```json
{
  "phone": "13800138000",
  "code": "123456",
  "password": "password123"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "phone": "13800138000",
      "nickname": "用户13800138000",
      "membership_type": 0
    }
  }
}
```

### 1.2 登录

**POST** `/api/v1/auth/login`

请求体：
```json
{
  "phone": "13800138000",
  "password": "password123"
}
```

响应：同上

### 1.3 发送验证码

**POST** `/api/v1/auth/sms/send`

请求体：
```json
{
  "phone": "13800138000"
}
```

响应：
```json
{
  "success": true,
  "message": "验证码已发送"
}
```

### 1.4 实名认证

**POST** `/api/v1/auth/realname`

请求体：
```json
{
  "name": "张三",
  "id_card": "110101199001011234"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "is_minor": false,
    "age": 34
  }
}
```

---

## 2. 伴侣管理接口

### 2.1 创建伴侣

**POST** `/api/v1/partner/create`

请求体：
```json
{
  "core_type": "追寻者",
  "name": "小语",
  "relationship_origin": "大学同学",
  "voice_type": "warm",
  "extroversion": 7,
  "intuition": 8,
  "feeling": 9,
  "judging": 6
}
```

响应：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "小语",
    "core_type": "追寻者"
  }
}
```

### 2.2 获取伴侣信息

**GET** `/api/v1/partner`

响应：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "小语",
    "core_type": "追寻者",
    "voice_type": "warm",
    "avatar_config": {...},
    "affection": {
      "level": 2,
      "score": 150
    }
  }
}
```

### 2.3 自定义角色

**POST** `/api/v1/partner/custom`

请求体：
```json
{
  "role_name": "温暖学长",
  "gender": "male",
  "age": 23,
  "core_personality": ["温柔", "体贴"],
  "relationship": "大学同学",
  "nickname_for_user": "学妹",
  "catchphrase": "没事，有我呢",
  "voice_type": "warm",
  "avatar_style": "fresh",
  "personality_dimensions": {
    "extroversion": 70,
    "neuroticism": 30,
    "openness": 60,
    "agreeableness": 80,
    "conscientiousness": 70,
    "empathy": 85
  }
}
```

响应：
```json
{
  "success": true,
  "data": {
    "id": 2,
    "role_name": "温暖学长"
  }
}
```

---

## 3. 对话服务接口

### 3.1 开始对话

**POST** `/api/v1/chat/start`

请求体：
```json
{
  "session_type": "daily"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "session_id": "abc123",
    "partner_greeting": "你好呀，今天心情怎么样？"
  }
}
```

### 3.2 发送消息

**POST** `/api/v1/chat/message`

请求体：
```json
{
  "session_id": "abc123",
  "content": "今天工作很累"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "id": 123,
    "role": "assistant",
    "content": "听起来你今天确实辛苦了，需要聊一聊吗？",
    "emotion_tags": ["empathy", "support"],
    "response_time": 2.5
  }
}
```

### 3.3 对话历史

**GET** `/api/v1/chat/history?session_id=abc123&limit=20`

响应：
```json
{
  "success": true,
  "data": [
    {
      "id": 120,
      "role": "user",
      "content": "你好",
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": 121,
      "role": "assistant",
      "content": "你好呀，今天心情怎么样？",
      "created_at": "2024-01-15T10:00:02Z"
    }
  ]
}
```

---

## 4. 模拟训练接口

### 4.1 场景列表

**GET** `/api/v1/scene/list`

响应：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "scene_name": "咖啡厅破冰",
      "stage": 1,
      "difficulty": 1,
      "estimated_time": 8,
      "unlock_affection": 0
    }
  ]
}
```

### 4.2 开始训练

**POST** `/api/v1/scene/start`

请求体：
```json
{
  "scene_id": 1
}
```

响应：
```json
{
  "success": true,
  "data": {
    "session_id": "scene_abc123",
    "scene_info": {
      "name": "咖啡厅破冰",
      "background": "你在咖啡厅遇到一个陌生人..."
    },
    "first_message": "你好，请问这里有人吗？"
  }
}
```

### 4.3 训练报告

**GET** `/api/v1/scene/report?session_id=scene_abc123`

响应：
```json
{
  "success": true,
  "data": {
    "score": 85,
    "dimensions": {
      "话题开启自然度": 90,
      "回应长度": 80,
      "自信程度": 85
    },
    "suggestions": ["继续保持", "可以尝试更多开放式提问"],
    "learning_card": {
      "id": 5,
      "title": "破冰技巧"
    }
  }
}
```

---

## 5. 成长系统接口

### 5.1 学习卡片

**GET** `/api/v1/growth/cards`

响应：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "非暴力沟通技巧",
      "card_type": "nvc",
      "mastery_level": 75
    }
  ]
}
```

### 5.2 情绪日记

**POST** `/api/v1/growth/diary`

请求体：
```json
{
  "content": "今天和朋友聚会很开心",
  "emotion": "happy",
  "emotion_score": 85
}
```

响应：
```json
{
  "success": true,
  "data": {
    "id": 12,
    "insights": "今天的情绪波动主要来自社交互动..."
  }
}
```

### 5.3 每周报告

**GET** `/api/v1/growth/weekly`

响应：
```json
{
  "success": true,
  "data": {
    "week_start": "2024-01-08",
    "week_end": "2024-01-14",
    "abilities": {
      "自信度": {"previous": 60, "current": 75, "change": 15},
      "表达力": {"previous": 55, "current": 63, "change": 8}
    },
    "training_stats": {
      "total_practices": 8,
      "avg_score": 85
    },
    "suggestions": ["建议多练习自我介绍场景"],
    "achievements": ["连续7天练习"]
  }
}
```

---

## 6. 好感度接口

### 6.1 获取好感度

**GET** `/api/v1/affection`

响应：
```json
{
  "success": true,
  "data": {
    "level": 2,
    "score": 150,
    "next_level_score": 300,
    "daily_interaction_count": 5
  }
}
```

### 6.2 送礼物

**POST** `/api/v1/affection/gift`

请求体：
```json
{
  "gift_type": "flower",
  "gift_name": "🌸 鲜花"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "affection_change": 10,
    "new_score": 160,
    "points_cost": 10
  }
}
```

---

## 7. 晚安计划接口

### 7.1 获取晚安问候

**GET** `/api/v1/nightly/greeting`

响应：
```json
{
  "success": true,
  "data": {
    "content": "今天辛苦了，早点休息哦。晚安，做个好梦～",
    "voice_url": "https://oss.example.com/nightly/123.wav",
    "story_id": 5
  }
}
```

### 7.2 获取晚安故事

**GET** `/api/v1/nightly/story?id=5`

响应：
```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "星星的故事",
    "content": "很久很久以前，天上有一颗小星星...",
    "duration": 180
  }
}
```

---

## 8. 情绪识别接口

### 8.1 情绪分析

**POST** `/api/v1/emotion/analyze`

请求体：
```json
{
  "content": "今天工作压力好大，感觉好累",
  "source": "chat"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "emotion_type": "anxious",
    "emotion_score": 75,
    "suggested_mode": "suggestion"
  }
}
```

### 8.2 情绪历史

**GET** `/api/v1/emotion/history?days=7`

响应：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "emotion_type": "happy",
      "emotion_score": 80,
      "created_at": "2024-01-15T20:00:00Z"
    }
  ]
}
```

---

## 9. CBT/NVC接口

### 9.1 CBT记录

**POST** `/api/v1/cbt/record`

请求体：
```json
{
  "situation": "同事没有回复我的消息",
  "automatic_thought": "他肯定不想理我",
  "emotion": "sad",
  "evidence_for": "他已经2小时没回复了",
  "evidence_against": "他平时都会回复的",
  "alternative_thought": "他可能在忙，晚点会回复的"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "cognitive_distortions": ["personalization"]
  }
}
```

### 9.2 NVC引导

**POST** `/api/v1/nvc/guide`

请求体：
```json
{
  "observation": "你今天没有回我消息",
  "feeling": "disappointed",
  "need": "connection",
  "request": "你能每天回我一次消息吗？"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "feedback": "你的NVC表达很清晰，请求也很具体"
  }
}
```

---

## 10. 朋友圈接口

### 10.1 获取朋友圈

**GET** `/api/v1/moments?limit=20`

响应：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "今天路过一家花店...",
      "image_urls": [],
      "likes_count": 5,
      "comments_count": 2,
      "is_ai_generated": true,
      "created_at": "2024-01-15T18:00:00Z"
    }
  ]
}
```

### 10.2 点赞

**POST** `/api/v1/moments/like`

请求体：
```json
{
  "moment_id": 1
}
```

响应：
```json
{
  "success": true,
  "data": {
    "likes_count": 6
  }
}
```

### 10.3 评论

**POST** `/api/v1/moments/comment`

请求体：
```json
{
  "moment_id": 1,
  "content": "好有意境～"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "comments_count": 3
  }
}
```

---

## 11. 会员接口

### 11.1 获取会员状态

**GET** `/api/v1/membership`

响应：
```json
{
  "success": true,
  "data": {
    "type": 1,
    "type_name": "基础会员",
    "expire_at": "2024-02-15T00:00:00Z",
    "features": ["voice_call", "daily_story"]
  }
}
```

### 11.2 购买会员

**POST** `/api/v1/membership/buy`

请求体：
```json
{
  "membership_type": 2,
  "duration": "month"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "order_id": "order_abc123",
    "price": 29.90,
    "expire_at": "2024-02-15T00:00:00Z"
  }
}
```

---

## 12. 时空穿梭接口

### 12.1 获取穿梭券

**GET** `/api/v1/timetravel/tickets`

响应：
```json
{
  "success": true,
  "data": {
    "tickets": 5,
    "history": [
      {
        "scene_id": 1,
        "created_at": "2024-01-14T10:00:00Z"
      }
    ]
  }
}
```

### 12.2 使用穿梭券

**POST** `/api/v1/timetravel/use`

请求体：
```json
{
  "scene_id": 1
}
```

响应：
```json
{
  "success": true,
  "data": {
    "remaining_tickets": 4,
    "session_id": "timetravel_abc123"
  }
}
```
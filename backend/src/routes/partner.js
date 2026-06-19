/**
 * 伴侣服务路由
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取预设角色列表
const PRESET_PARTNERS = [
  {
    id: 1, name: '沈清欢', coreType: 'pursuer',
    description: '温柔的建筑设计师，会记得你说的每一句小事',
    age: 25, occupation: '建筑设计师',
    tags: ['温柔', '文艺', '细腻']
  },
  {
    id: 2, name: '陆北辰', coreType: 'guardian',
    description: '沉稳的急诊医生，有他在什么都不用怕',
    age: 28, occupation: '急诊医生',
    tags: ['沉稳', '可靠', '温暖']
  },
  {
    id: 3, name: '顾星河', coreType: 'wanderer',
    description: '洒脱的自由摄影师，他的世界充满惊喜和自由',
    age: 24, occupation: '自由摄影师',
    tags: ['洒脱', '幽默', '爱冒险']
  },
  {
    id: 4, name: '苏念', coreType: 'healer',
    description: '温柔的心理咨询师，她总能接住你的所有情绪',
    age: 26, occupation: '心理咨询师',
    tags: ['温柔', '共情', '善解人意']
  }
];

// 获取预设角色列表
router.get('/presets', (req, res) => {
  res.json(PRESET_PARTNERS);
});

// 创建伴侣
router.post('/create', async (req, res, next) => {
  try {
    const { 
      name, coreType, personalityTraits,
      relationshipType, nicknameForUser,
      backgroundStory, voiceStyle, presetId
    } = req.body;
    
    if (!name || !coreType) {
      return res.status(400).json({ error: '伴侣名称和核心类型不能为空', code: 'PARAM_MISSING' });
    }
    
    // 检查伴侣数量限制
    const count = await db.queryOne(
      'SELECT COUNT(*) as cnt FROM partners WHERE user_id = ? AND status != ?',
      [req.userId, 'ended']
    );
    
    if (count.cnt >= 5) {
      return res.status(400).json({ error: '伴侣数量已达上限（最多5个）', code: 'PARTNER_LIMIT' });
    }
    
    const result = await db.execute(
      `INSERT INTO partners 
       (user_id, name, core_type, personality_traits, relationship_type, nickname_for_user, background_story, voice_style, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId, name, coreType,
        JSON.stringify(personalityTraits || {}),
        relationshipType || '', nicknameForUser || '',
        backgroundStory || '', voiceStyle || '',
        count.cnt === 0 // 第一个创建的设为默认
      ]
    );
    
    res.status(201).json({
      message: '伴侣创建成功',
      partnerId: result.insertId
    });
  } catch (err) {
    next(err);
  }
});

// 获取伴侣列表
router.get('/', async (req, res, next) => {
  try {
    const partners = await db.query(
      `SELECT id, name, core_type, relationship_type, affinity_score, affinity_level, status, is_default, created_at
       FROM partners WHERE user_id = ? AND status != 'ended'
       ORDER BY is_default DESC, created_at DESC`,
      [req.userId]
    );
    
    res.json(partners.map(p => ({
      ...p,
      affinityLevel: p.affinity_level,
      affinityScore: p.affinity_score,
      coreType: p.core_type
    })));
  } catch (err) {
    next(err);
  }
});

// 获取伴侣详情
router.get('/:id', async (req, res, next) => {
  try {
    const partner = await db.queryOne(
      `SELECT * FROM partners WHERE id = ? AND user_id = ?`,
      [req.params.id, req.userId]
    );
    
    if (!partner) {
      return res.status(404).json({ error: '伴侣不存在', code: 'PARTNER_NOT_FOUND' });
    }
    
    // 获取最近记忆
    const memories = await db.query(
      'SELECT content, memory_type, created_at FROM memories WHERE partner_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.params.id]
    );
    
    // 获取最新对话
    const lastChat = await db.queryOne(
      'SELECT content, created_at FROM chat_history WHERE partner_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.params.id]
    );
    
    res.json({
      ...partner,
      personalityTraits: typeof partner.personality_traits === 'string'
        ? JSON.parse(partner.personality_traits)
        : partner.personality_traits,
      memories,
      lastChat: lastChat ? lastChat.content : null,
      lastChatTime: lastChat ? lastChat.created_at : null
    });
  } catch (err) {
    next(err);
  }
});

// 更新伴侣
router.put('/:id', async (req, res, next) => {
  try {
    const { name, personalityTraits, relationshipType, nicknameForUser, backgroundStory, voiceStyle } = req.body;
    const updates = [];
    const params = [];
    
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (personalityTraits !== undefined) { updates.push('personality_traits = ?'); params.push(JSON.stringify(personalityTraits)); }
    if (relationshipType !== undefined) { updates.push('relationship_type = ?'); params.push(relationshipType); }
    if (nicknameForUser !== undefined) { updates.push('nickname_for_user = ?'); params.push(nicknameForUser); }
    if (backgroundStory !== undefined) { updates.push('background_story = ?'); params.push(backgroundStory); }
    if (voiceStyle !== undefined) { updates.push('voice_style = ?'); params.push(voiceStyle); }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段', code: 'NO_UPDATE' });
    }
    
    params.push(req.params.id, req.userId);
    await db.execute(
      `UPDATE partners SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );
    
    res.json({ message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// 删除伴侣（软删除）
router.delete('/:id', async (req, res, next) => {
  try {
    await db.execute(
      "UPDATE partners SET status = 'ended' WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );
    
    res.json({ message: '伴侣已删除' });
  } catch (err) {
    next(err);
  }
});

// 切换默认伴侣
router.post('/:id/default', async (req, res, next) => {
  try {
    // 先将所有设为非默认
    await db.execute('UPDATE partners SET is_default = FALSE WHERE user_id = ?', [req.userId]);
    // 设置指定伴侣为默认
    await db.execute('UPDATE partners SET is_default = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    
    res.json({ message: '默认伴侣已切换' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

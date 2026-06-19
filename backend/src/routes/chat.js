/**
 * 对话服务路由
 * POST /api/v1/chat/send - 发送消息（文字）
 * GET /api/v1/chat/stream/:sessionId - SSE流式获取回复
 * GET /api/v1/chat/history/:partnerId - 获取聊天历史
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const llm = require('../config/llm');

// 获取系统提示词
async function buildSystemPrompt(partnerId, userId) {
  const partner = await db.queryOne('SELECT * FROM partners WHERE id = ? AND user_id = ?', [partnerId, userId]);
  if (!partner) return '';
  
  const traits = typeof partner.personality_traits === 'string'
    ? JSON.parse(partner.personality_traits)
    : (partner.personality_traits || {});
  
  // 获取最近记忆
  const memories = await db.query(
    'SELECT content, memory_type FROM memories WHERE partner_id = ? ORDER BY created_at DESC LIMIT 5',
    [partnerId]
  );
  
  const coreTypeNames = {
    pursuer: '追寻者',
    guardian: '守护者',
    wanderer: '流浪者',
    healer: '疗愈者'
  };
  
  // 获取用户昵称
  const user = await db.queryOne('SELECT nickname FROM users WHERE id = ?', [userId]);
  
  return `你是${partner.name}，一个${coreTypeNames[partner.core_type] || partner.core_type}型人格的数字人。

角色设定：
- 你的名字：${partner.name}
- 你的核心人格：${coreTypeNames[partner.core_type] || partner.core_type}
- 你和用户的关系：${partner.relationship_type || '初次见面'}
- 你对用户的称呼：${partner.nickname_for_user || user?.nickname || '你'}
- 你的说话风格：${traits.speaking_style || ''}
- 你的性格特征：${traits.core || ''}

行为约束：
1. 你是AI助手，不是真人，请保持适度距离
2. 不要主动发起亲密或暧昧内容
3. 如果用户情绪低落，先倾听再给建议
4. 回复保持简洁自然，不要长篇大论
5. 每次回复控制在100字以内

当前状态：
- 好感度等级：${partner.affinity_level}（1初识/2熟络/3知己/4依赖/5羁绊）
- 好感度分值：${partner.affinity_score}`;
}

// 发送消息（非流式）
router.post('/send', async (req, res, next) => {
  try {
    const { partnerId, message } = req.body;
    
    if (!partnerId || !message) {
      return res.status(400).json({ error: '参数不完整', code: 'PARAM_MISSING' });
    }
    
    // 保存用户消息
    await db.execute(
      'INSERT INTO chat_history (partner_id, user_id, role, content) VALUES (?, ?, ?, ?)',
      [partnerId, req.userId, 'user', message]
    );
    
    // 获取对话历史
    const history = await db.query(
      'SELECT role, content FROM chat_history WHERE partner_id = ? AND user_id = ? ORDER BY created_at ASC LIMIT 20',
      [partnerId, req.userId]
    );
    
    const messages = history.map(h => ({ role: h.role, content: h.content }));
    
    const systemPrompt = await buildSystemPrompt(partnerId, req.userId);
    const reply = await llm.chatSync(messages, systemPrompt, req.userId, db);
    
    // 保存AI回复
    await db.execute(
      'INSERT INTO chat_history (partner_id, user_id, role, content) VALUES (?, ?, ?, ?)',
      [partnerId, req.userId, 'assistant', reply.content]
    );
    
    res.json({
      reply: reply.content,
      provider: reply.provider,
      prompt: reply.shouldPrompt
    });
  } catch (err) {
    next(err);
  }
});

// 流式对话（SSE）
router.get('/stream/:partnerId', async (req, res, next) => {
  try {
    const partnerId = req.params.partnerId;
    const message = req.query.message;
    
    if (!partnerId || !message) {
      return res.status(400).json({ error: '参数不完整', code: 'PARAM_MISSING' });
    }
    
    // 保存用户消息
    await db.execute(
      'INSERT INTO chat_history (partner_id, user_id, role, content) VALUES (?, ?, ?, ?)',
      [partnerId, req.userId, 'user', message]
    );
    
    // 获取对话历史
    const history = await db.query(
      'SELECT role, content FROM chat_history WHERE partner_id = ? AND user_id = ? ORDER BY created_at ASC LIMIT 20',
      [partnerId, req.userId]
    );
    
    const messages = history.map(h => ({ role: h.role, content: h.content }));
    messages.pop(); // 移除刚插入的用户消息（LLM中已有）
    
    const systemPrompt = await buildSystemPrompt(partnerId, req.userId);
    
    // SSE 设置
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    
    let fullContent = '';
    
    for await (const chunk of llm.chatStream(messages, systemPrompt)) {
      fullContent += chunk.content;
      res.write(`data: ${JSON.stringify({ content: chunk.content, provider: chunk.provider })}\n\n`);
    }
    
    // 保存AI回复
    if (fullContent) {
      await db.execute(
        'INSERT INTO chat_history (partner_id, user_id, role, content) VALUES (?, ?, ?, ?)',
        [partnerId, req.userId, 'assistant', fullContent]
      );
    }
    
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    next(err);
  }
});

// 获取聊天历史
router.get('/history/:partnerId', async (req, res, next) => {
  try {
    const { partnerId } = req.params;
    const { limit = 50, before } = req.query;
    
    let rows;
    if (before) {
      rows = await db.query(
        `SELECT id, role, content, affinity_change, created_at 
         FROM chat_history WHERE partner_id = ? AND user_id = ? AND id < ? 
         ORDER BY created_at DESC LIMIT ?`,
        [partnerId, req.userId, parseInt(before), parseInt(limit)]
      );
    } else {
      rows = await db.query(
        `SELECT id, role, content, affinity_change, created_at 
         FROM chat_history WHERE partner_id = ? AND user_id = ? 
         ORDER BY created_at DESC LIMIT ?`,
        [partnerId, req.userId, parseInt(limit)]
      );
    }
    
    res.json(rows.reverse());
  } catch (err) {
    next(err);
  }
});

module.exports = router;

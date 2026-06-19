/**
 * 才艺服务路由
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取随机才艺
router.get('/random', async (req, res, next) => {
  try {
    const { type } = req.query;
    
    let talent;
    if (type) {
      talent = await db.queryOne(
        'SELECT * FROM talents WHERE talent_type = ? ORDER BY RAND() LIMIT 1',
        [type]
      );
    } else {
      talent = await db.queryOne(
        'SELECT * FROM talents ORDER BY RAND() LIMIT 1'
      );
    }
    
    if (talent) {
      await db.execute('UPDATE talents SET usage_count = usage_count + 1 WHERE id = ?', [talent.id]);
      return res.json(talent);
    }
    
    // 没有预设才艺时，返回LLM生成的兜底内容
    res.json({
      id: 0,
      talentType: type || 'story',
      content: type === 'joke'
        ? '为什么程序员总分不清万圣节和圣诞节？因为 Oct 31 == Dec 25！'
        : type === 'poem'
          ? '你是我在人群中看到的，最温柔的那束光。'
          : '从前有一只小猫，它总是害怕和别人说话。直到有一天，它遇到了一只会说话的鱼...',
      isLlmGenerated: true
    });
  } catch (err) {
    next(err);
  }
});

// 按类型获取才艺
router.get('/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const { limit = 10 } = req.query;
    
    const talents = await db.query(
      'SELECT * FROM talents WHERE talent_type = ? ORDER BY usage_count DESC LIMIT ?',
      [type, parseInt(limit)]
    );
    
    res.json(talents);
  } catch (err) {
    next(err);
  }
});

// AI即时生成才艺
router.post('/llm-generate', async (req, res, next) => {
  try {
    const { type, theme, personalityTag } = req.body;
    
    // 记录生成
    const result = await db.execute(
      'INSERT INTO talents (talent_type, content, personality_tag, is_llm_generated) VALUES (?, ?, ?, TRUE)',
      [type || 'story', `[AI生成] ${theme || '温暖的'}${type === 'joke' ? '笑话' : type === 'poem' ? '诗' : '故事'}`, personalityTag || '']
    );
    
    res.status(201).json({
      id: result.insertId,
      talentType: type || 'story',
      content: 'AI即时生成的才艺内容',
      isLlmGenerated: true
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

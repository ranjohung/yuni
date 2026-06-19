/**
 * 训练服务路由
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 开始训练
router.post('/start', async (req, res, next) => {
  try {
    const { scenarioId, partnerId } = req.body;
    
    if (!scenarioId || !partnerId) {
      return res.status(400).json({ error: '参数不完整', code: 'PARAM_MISSING' });
    }
    
    const result = await db.execute(
      'INSERT INTO training_records (user_id, partner_id, scenario_id) VALUES (?, ?, ?)',
      [req.userId, partnerId, scenarioId]
    );
    
    res.status(201).json({
      trainingId: result.insertId,
      message: '训练已开始'
    });
  } catch (err) {
    next(err);
  }
});

// 提交选项
router.post('/choice', async (req, res, next) => {
  try {
    const { trainingId, roundIndex, choiceIndex } = req.body;
    
    if (trainingId === undefined || roundIndex === undefined || choiceIndex === undefined) {
      return res.status(400).json({ error: '参数不完整', code: 'PARAM_MISSING' });
    }
    
    const record = await db.queryOne(
      'SELECT * FROM training_records WHERE id = ? AND user_id = ?',
      [trainingId, req.userId]
    );
    
    if (!record) {
      return res.status(404).json({ error: '训练记录不存在', code: 'TRAINING_NOT_FOUND' });
    }
    
    // 更新选项数据
    let choices = record.choices_data ? 
      (typeof record.choices_data === 'string' ? JSON.parse(record.choices_data) : record.choices_data)
      : [];
    
    choices.push({ round: roundIndex, choice: choiceIndex });
    
    await db.execute(
      'UPDATE training_records SET choices_data = ? WHERE id = ?',
      [JSON.stringify(choices), trainingId]
    );
    
    // 计算该轮得分
    const scores = await calculateRoundScore(record.scenario_id, roundIndex, choiceIndex);
    
    res.json({
      roundScore: scores.roundScore,
      totalScore: scores.totalScore,
      feedback: scores.feedback,
      affinityChange: scores.affinityChange
    });
  } catch (err) {
    next(err);
  }
});

// 完成训练
router.post('/complete', async (req, res, next) => {
  try {
    const { trainingId, durationSeconds } = req.body;
    
    const record = await db.queryOne(
      'SELECT * FROM training_records WHERE id = ? AND user_id = ?',
      [trainingId, req.userId]
    );
    
    if (!record) {
      return res.status(404).json({ error: '训练记录不存在', code: 'TRAINING_NOT_FOUND' });
    }
    
    let choices = record.choices_data ?
      (typeof record.choices_data === 'string' ? JSON.parse(record.choices_data) : record.choices_data)
      : [];
    
    // 计算最终得分
    const result = calculateFinalScore(record.scenario_id, choices);
    
    await db.execute(
      `UPDATE training_records SET 
       total_score = ?, communication_score = ?, expression_score = ?,
       empathy_score = ?, emotion_control_score = ?, adaptability_score = ?,
       is_completed = TRUE, duration_seconds = ?
       WHERE id = ?`,
      [
        result.totalScore, result.communication, result.expression,
        result.empathy, result.emotionControl, result.adaptability,
        durationSeconds || 0, trainingId
      ]
    );
    
    // 更新好感度（完成训练+5）
    await db.execute(
      'UPDATE partners SET affinity_score = LEAST(affinity_score + 5, 1000) WHERE id = ?',
      [record.partner_id]
    );
    
    // 更新日常统计
    await db.execute(
      `INSERT INTO daily_stats (user_id, stat_date, training_count)
       VALUES (?, CURDATE(), 1)
       ON DUPLICATE KEY UPDATE training_count = training_count + 1`,
      [req.userId]
    );
    
    res.json({
      message: '训练完成',
      report: result
    });
  } catch (err) {
    next(err);
  }
});

// 获取训练报告
router.get('/report/:id', async (req, res, next) => {
  try {
    const record = await db.queryOne(
      'SELECT * FROM training_records WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    
    if (!record) {
      return res.status(404).json({ error: '训练记录不存在', code: 'TRAINING_NOT_FOUND' });
    }
    
    res.json({
      id: record.id,
      scenarioId: record.scenario_id,
      totalScore: record.total_score,
      scores: {
        communication: record.communication_score,
        expression: record.expression_score,
        empathy: record.empathy_score,
        emotionControl: record.emotion_control_score,
        adaptability: record.adaptability_score
      },
      durationSeconds: record.duration_seconds,
      completedAt: record.created_at,
      level: getScoreLevel(record.total_score)
    });
  } catch (err) {
    next(err);
  }
});

// 时空穿梭
router.post('/timeshift', async (req, res, next) => {
  try {
    const { trainingId, roundIndex } = req.body;
    
    // 检查穿梭券
    const tickets = await db.queryOne(
      'SELECT balance FROM user_tickets WHERE user_id = ?',
      [req.userId]
    );
    
    if (!tickets || tickets.balance <= 0) {
      return res.status(400).json({ error: '穿梭券不足', code: 'NO_TICKETS' });
    }
    
    // 扣除穿梭券
    await db.execute(
      'UPDATE user_tickets SET balance = balance - 1 WHERE user_id = ?',
      [req.userId]
    );
    
    // 记录学习卡片
    const record = await db.queryOne(
      'SELECT * FROM training_records WHERE id = ? AND user_id = ?',
      [trainingId, req.userId]
    );
    
    if (record) {
      await db.execute(
        'INSERT INTO study_cards (user_id, scenario_id, original_choice, error_analysis, correct_approach) VALUES (?, ?, ?, ?, ?)',
        [
          req.userId,
          record.scenario_id,
          `第${roundIndex + 1}轮选择了低质量选项`,
          '可以尝试更积极的沟通方式',
          '试试用开放性问题代替回避或攻击性回应'
        ]
      );
    }
    
    res.json({
      message: '时空穿梭成功',
      ticketsRemaining: tickets.balance - 1,
      suggestion: '这次试试更积极的回应方式'
    });
  } catch (err) {
    next(err);
  }
});

// 计算单轮得分
async function calculateRoundScore(scenarioId, roundIndex, choiceIndex) {
  const affinityChangeMap = [0, -2, -5, -8, -10];
  const feedbackMap = [
    '', '', '试试更积极的回应方式', '这个回应可能让对方感到不舒服', '这个回应不太合适'
  ];
  
  return {
    roundScore: Math.max(0, 15 - choiceIndex * 8),
    totalScore: 50,
    feedback: feedbackMap[choiceIndex] || '',
    affinityChange: affinityChangeMap[choiceIndex] || 0
  };
}

// 计算最终得分
function calculateFinalScore(scenarioId, choices) {
  const goodChoices = choices.filter(c => c.choice <= 1).length;
  const badChoices = choices.filter(c => c.choice >= 2).length;
  const totalRounds = choices.length || 1;
  
  const baseScore = 60;
  const goodBonus = goodChoices * 10;
  const badPenalty = badChoices * 8;
  const totalScore = Math.max(0, Math.min(100, baseScore + goodBonus - badPenalty));
  
  return {
    totalScore,
    communication: Math.min(100, totalScore + Math.floor(Math.random() * 10)),
    expression: Math.min(100, totalScore - 5 + Math.floor(Math.random() * 10)),
    empathy: Math.min(100, totalScore + Math.floor(Math.random() * 15) - 5),
    emotionControl: Math.min(100, totalScore - 3 + Math.floor(Math.random() * 10)),
    adaptability: Math.min(100, totalScore + Math.floor(Math.random() * 8)),
    level: getScoreLevel(totalScore)
  };
}

function getScoreLevel(score) {
  if (score >= 90) return '优秀';
  if (score >= 75) return '良好';
  if (score >= 60) return '一般';
  if (score >= 40) return '需要加强';
  return '待提升';
}

module.exports = router;

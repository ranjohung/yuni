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

// 场景评分配置
const scenarioConfigs = {
  1: { // 咖啡厅破冰
    name: '咖啡厅破冰',
    weights: { communication: 0.3, expression: 0.2, empathy: 0.2, emotionControl: 0.15, adaptability: 0.15 }
  },
  2: { // 兴趣社群自我介绍
    name: '兴趣社群自我介绍',
    weights: { communication: 0.2, expression: 0.4, empathy: 0.15, emotionControl: 0.15, adaptability: 0.1 }
  },
  3: { // 模拟面试
    name: '模拟面试',
    weights: { communication: 0.25, expression: 0.35, empathy: 0.1, emotionControl: 0.2, adaptability: 0.1 }
  },
  4: { // 向上汇报被质疑
    name: '向上汇报被质疑',
    weights: { communication: 0.2, expression: 0.25, empathy: 0.15, emotionControl: 0.3, adaptability: 0.1 }
  },
  5: { // 被朋友误解
    name: '被朋友误解',
    weights: { communication: 0.25, expression: 0.15, empathy: 0.4, emotionControl: 0.1, adaptability: 0.1 }
  },
  6: { // 安慰失落的TA
    name: '安慰失落的TA',
    weights: { communication: 0.2, expression: 0.15, empathy: 0.5, emotionControl: 0.1, adaptability: 0.05 }
  }
};

// 选项质量配置
const choiceQuality = [
  { score: 15, feedback: '', affinityChange: 5 },
  { score: 12, feedback: '不错的回应！', affinityChange: 3 },
  { score: 8, feedback: '可以试试更积极的回应方式', affinityChange: -2 },
  { score: 4, feedback: '这个回应可能让对方感到不舒服', affinityChange: -5 },
  { score: 0, feedback: '这个回应不太合适，试试换一种方式', affinityChange: -10 }
];

// 计算单轮得分
async function calculateRoundScore(scenarioId, roundIndex, choiceIndex) {
  const config = choiceQuality[choiceIndex] || choiceQuality[choiceQuality.length - 1];
  
  return {
    roundScore: config.score,
    totalScore: 50,
    feedback: config.feedback,
    affinityChange: config.affinityChange
  };
}

// 计算最终得分
function calculateFinalScore(scenarioId, choices) {
  const config = scenarioConfigs[scenarioId] || {
    weights: { communication: 0.2, expression: 0.2, empathy: 0.2, emotionControl: 0.2, adaptability: 0.2 }
  };
  
  // 计算基础得分（基于选项质量）
  let totalScore = 0;
  let communicationScore = 0;
  let expressionScore = 0;
  let empathyScore = 0;
  let emotionControlScore = 0;
  let adaptabilityScore = 0;
  
  for (const choice of choices) {
    const quality = choiceQuality[choice.choice] || choiceQuality[choiceQuality.length - 1];
    const roundScore = quality.score;
    totalScore += roundScore;
    
    // 根据场景权重分配分数
    communicationScore += roundScore * config.weights.communication;
    expressionScore += roundScore * config.weights.expression;
    empathyScore += roundScore * config.weights.empathy;
    emotionControlScore += roundScore * config.weights.emotionControl;
    adaptabilityScore += roundScore * config.weights.adaptability;
  }
  
  const maxPossibleScore = choices.length * 15;
  const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) : 0;
  totalScore = Math.round(percentage * 100);
  
  // 应用权重后的维度得分
  communicationScore = Math.round((communicationScore / (choices.length * 15 * config.weights.communication || 1)) * 100);
  expressionScore = Math.round((expressionScore / (choices.length * 15 * config.weights.expression || 1)) * 100);
  empathyScore = Math.round((empathyScore / (choices.length * 15 * config.weights.empathy || 1)) * 100);
  emotionControlScore = Math.round((emotionControlScore / (choices.length * 15 * config.weights.emotionControl || 1)) * 100);
  adaptabilityScore = Math.round((adaptabilityScore / (choices.length * 15 * config.weights.adaptability || 1)) * 100);
  
  // 添加少量随机波动（±5分）增加真实感
  const addVariance = (score) => Math.min(100, Math.max(0, score + (Math.floor(Math.random() * 11) - 5)));
  
  return {
    totalScore: Math.min(100, Math.max(0, totalScore)),
    communication: addVariance(communicationScore),
    expression: addVariance(expressionScore),
    empathy: addVariance(empathyScore),
    emotionControl: addVariance(emotionControlScore),
    adaptability: addVariance(adaptabilityScore),
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

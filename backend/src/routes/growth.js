/**
 * 成长服务路由
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取能力雷达图
router.get('/radar', async (req, res, next) => {
  try {
    const records = await db.query(
      `SELECT AVG(communication_score) as communication,
              AVG(expression_score) as expression,
              AVG(empathy_score) as empathy,
              AVG(emotion_control_score) as emotion_control,
              AVG(adaptability_score) as adaptability,
              COUNT(*) as total_trainings
       FROM training_records WHERE user_id = ? AND is_completed = TRUE`,
      [req.userId]
    );
    
    const r = records[0] || {};
    res.json({
      communication: Math.round(r.communication || 30),
      expression: Math.round(r.expression || 30),
      empathy: Math.round(r.empathy || 30),
      emotionControl: Math.round(r.emotion_control || 30),
      adaptability: Math.round(r.adaptability || 30),
      totalTrainings: r.total_trainings || 0,
      // 综合得分
      overall: Math.round(
        ((r.communication || 30) * 0.25 +
         (r.expression || 30) * 0.2 +
         (r.empathy || 30) * 0.2 +
         (r.emotion_control || 30) * 0.2 +
         (r.adaptability || 30) * 0.15)
      )
    });
  } catch (err) {
    next(err);
  }
});

// 获取进步曲线
router.get('/trend/:days', async (req, res, next) => {
  try {
    const days = parseInt(req.params.days) || 7;
    
    const records = await db.query(
      `SELECT DATE(created_at) as date, AVG(total_score) as avg_score
       FROM training_records 
       WHERE user_id = ? AND is_completed = TRUE AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [req.userId, days]
    );
    
    res.json(records);
  } catch (err) {
    next(err);
  }
});

// 获取里程碑
router.get('/milestones', async (req, res, next) => {
  try {
    const milestones = [];
    
    // 第一次训练
    const firstTraining = await db.queryOne(
      'SELECT created_at FROM training_records WHERE user_id = ? AND is_completed = TRUE ORDER BY created_at ASC LIMIT 1',
      [req.userId]
    );
    if (firstTraining) {
      milestones.push({ type: 'first_training', label: '完成第一次场景训练', date: firstTraining.created_at });
    }
    
    // 连续训练
    const streak = await db.queryOne(
      "SELECT COUNT(DISTINCT DATE(created_at)) as days FROM training_records WHERE user_id = ? AND is_completed = TRUE AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)",
      [req.userId]
    );
    if (streak && streak.days >= 7) {
      milestones.push({ type: 'streak_7', label: '连续7天完成训练', date: new Date().toISOString() });
    }
    
    // 总训练次数
    const totalTrainings = await db.queryOne(
      'SELECT COUNT(*) as cnt FROM training_records WHERE user_id = ? AND is_completed = TRUE',
      [req.userId]
    );
    if (totalTrainings && totalTrainings.cnt >= 10) {
      milestones.push({ type: 'total_10', label: '累计完成10次训练', date: new Date().toISOString() });
    }
    if (totalTrainings && totalTrainings.cnt >= 50) {
      milestones.push({ type: 'total_50', label: '累计完成50次训练', date: new Date().toISOString() });
    }
    
    // 场景全通
    const allScenarios = await db.query(
      'SELECT COUNT(DISTINCT scenario_id) as cnt FROM training_records WHERE user_id = ? AND is_completed = TRUE',
      [req.userId]
    );
    if (allScenarios && allScenarios[0].cnt >= 6) {
      milestones.push({ type: 'all_scenarios', label: '完成全部6个场景', date: new Date().toISOString() });
    }
    
    res.json(milestones);
  } catch (err) {
    next(err);
  }
});

// 获取依恋风格分析（月卡+）
router.get('/attachment-report', async (req, res, next) => {
  try {
    const user = await db.queryOne('SELECT membership_level FROM users WHERE id = ?', [req.userId]);
    
    if (!user || user.membership_level < 2) {
      return res.status(403).json({ error: '需要月卡及以上会员', code: 'MEMBERSHIP_REQUIRED' });
    }
    
    const records = await db.query(
      'SELECT choices_data FROM training_records WHERE user_id = ? AND is_completed = TRUE ORDER BY created_at DESC LIMIT 30',
      [req.userId]
    );
    
    let avoidanceCount = 0;
    let aggressiveCount = 0;
    let totalChoices = 0;
    
    records.forEach(r => {
      if (r.choices_data) {
        const choices = typeof r.choices_data === 'string' ? JSON.parse(r.choices_data) : r.choices_data;
        choices.forEach(c => {
          totalChoices++;
          if (c.choice === 2) avoidanceCount++;
          if (c.choice === 3) aggressiveCount++;
        });
      }
    });
    
    const avoidanceRate = totalChoices > 0 ? avoidanceCount / totalChoices : 0;
    const aggressiveRate = totalChoices > 0 ? aggressiveCount / totalChoices : 0;
    
    let attachmentType = '安全型';
    let description = '你在社交中表现自然，能够平衡自己的需求和对方的感受。';
    
    if (avoidanceRate > 0.3) {
      attachmentType = '回避型';
      description = '你在社交中倾向于回避冲突和深入交流，建议从小步挑战开始尝试更开放的沟通。';
    } else if (aggressiveRate > 0.2) {
      attachmentType = '焦虑型';
      description = '你在社交中有时会表现出较强的防御性，建议练习先倾听再回应的沟通方式。';
    } else if (avoidanceRate > 0.15 && aggressiveRate > 0.1) {
      attachmentType = '混乱型';
      description = '你的社交模式存在波动，有时回避有时对抗，建议先建立稳定的沟通习惯。';
    }
    
    res.json({
      attachmentType,
      description,
      metrics: {
        totalChoices,
        avoidanceRate: Math.round(avoidanceRate * 100),
        aggressiveRate: Math.round(aggressiveRate * 100)
      },
      suggestions: [
        '尝试用具体描述代替绝对化词语',
        '先听对方说完再表达自己的观点',
        '每天给自己一个小目标：主动发起一次对话'
      ]
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

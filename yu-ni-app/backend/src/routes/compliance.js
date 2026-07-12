/**
 * 合规服务路由
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取用户的年龄分层
router.get('/age-tier', async (req, res, next) => {
  try {
    const user = await db.queryOne('SELECT birth_date, real_name_verified FROM users WHERE id = ?', [req.userId]);
    
    let tier = 'unknown';
    let restrictions = {};
    
    if (user?.birth_date) {
      const birthDate = new Date(user.birth_date);
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (age < 14) {
        tier = 'under_14';
        restrictions = {
          maxDailyMinutes: 30,
          allowedScenarios: 3,
          intimateFeatures: false,
          voiceCall: false,
          affinityLevelLimit: 2
        };
      } else if (age < 18) {
        tier = '14_to_18';
        restrictions = {
          maxDailyMinutes: 30,
          allowedScenarios: 6,
          intimateFeatures: false,
          voiceCall: true,
          voiceCallDailyLimit: 1,
          voiceCallDurationLimit: 3,
          affinityLevelLimit: 3
        };
      } else {
        tier = 'adult';
        restrictions = {
          maxDailyMinutes: 120,
          allowedScenarios: 6,
          intimateFeatures: true,
          voiceCall: true
        };
      }
    }
    
    res.json({
      tier,
      verified: user?.real_name_verified || false,
      restrictions,
      disclaimer: '我是AI助手，我的一切回答由AI生成，不代表真实人类的情感和观点。'
    });
  } catch (err) {
    next(err);
  }
});

// 获取当日使用统计
router.get('/daily-usage', async (req, res, next) => {
  try {
    const stats = await db.queryOne(
      `SELECT usage_minutes, training_count, chat_count 
       FROM daily_stats WHERE user_id = ? AND stat_date = CURDATE()`,
      [req.userId]
    );
    
    const user = await db.queryOne('SELECT birth_date FROM users WHERE id = ?', [req.userId]);
    
    let maxMinutes = 120;
    if (user?.birth_date) {
      const age = Math.floor((Date.now() - new Date(user.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) maxMinutes = 30;
    }
    
    res.json({
      usageMinutes: stats?.usage_minutes || 0,
      maxMinutes,
      trainingCount: stats?.training_count || 0,
      chatCount: stats?.chat_count || 0,
      shouldRemind: (stats?.usage_minutes || 0) >= maxMinutes
    });
  } catch (err) {
    next(err);
  }
});

// 记录使用时长
router.post('/log-usage', async (req, res, next) => {
  try {
    const { minutes } = req.body;
    
    await db.execute(
      `INSERT INTO daily_stats (user_id, stat_date, usage_minutes)
       VALUES (?, CURDATE(), ?)
       ON DUPLICATE KEY UPDATE usage_minutes = usage_minutes + ?`,
      [req.userId, minutes || 1, minutes || 1]
    );
    
    res.json({ message: '记录成功' });
  } catch (err) {
    next(err);
  }
});

// 获取数据删除确认
router.get('/delete-confirmation', (req, res) => {
  res.json({
    message: '确认删除所有数据？此操作不可恢复。',
    dataToDelete: [
      '个人资料（昵称、头像）',
      '实名认证信息',
      '所有伴侣角色',
      '所有对话记录',
      '所有训练记录',
      '所有学习卡片',
      '会员状态',
      '穿梭券余额'
    ]
  });
});

module.exports = router;

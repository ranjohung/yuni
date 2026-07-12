/**
 * 签到系统路由
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 每日签到
router.post('/daily', async (req, res, next) => {
  try {
    const userId = req.userId;

    // 检查今日是否已签到
    const existing = await db.queryOne(
      'SELECT * FROM check_ins WHERE user_id = ? AND check_date = CURDATE()',
      [userId]
    );

    if (existing) {
      return res.status(400).json({
        error: '今日已签到',
        code: 'ALREADY_CHECKED_IN',
        streakDays: existing.streak_count,
      });
    }

    // 获取连续签到天数
    const prevDayResult = await db.queryOne(
      `SELECT streak_count FROM check_ins 
       WHERE user_id = ? AND check_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`,
      [userId]
    );
    
    let streakCount = 1;
    if (prevDayResult) {
      streakCount = prevDayResult.streak_count + 1;
    }

    // 插入签到记录
    await db.execute(
      'INSERT INTO check_ins (user_id, check_date, streak_count) VALUES (?, CURDATE(), ?)',
      [userId, streakCount]
    );

    // 签到奖励
    let rewardMessage = '签到成功！';
    let ticketsEarned = 0;

    if (streakCount >= 7) {
      // 连续7天签到奖励穿梭券
      ticketsEarned = 3;
      rewardMessage = `🎉 连续签到${streakCount}天！获得${ticketsEarned}张穿梭券奖励！`;
      
      await db.execute(
        'UPDATE user_tickets SET balance = balance + ? WHERE user_id = ?',
        [ticketsEarned, userId]
      );
    } else if (streakCount % 3 === 0) {
      ticketsEarned = 1;
      rewardMessage = `👍 连续签到${streakCount}天！获得${ticketsEarned}张穿梭券！`;
      
      await db.execute(
        'UPDATE user_tickets SET balance = balance + ? WHERE user_id = ?',
        [ticketsEarned, userId]
      );
    }

    // 获取当前穿梭券余额
    const tickets = await db.queryOne(
      'SELECT balance FROM user_tickets WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      streakDays: streakCount,
      ticketsEarned,
      ticketsBalance: tickets?.balance || 0,
      message: rewardMessage,
    });
  } catch (err) {
    next(err);
  }
});

// 获取签到历史
router.get('/history', async (req, res, next) => {
  try {
    const userId = req.userId;

    const history = await db.query(
      `SELECT check_date, streak_count FROM check_ins 
       WHERE user_id = ? AND check_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       ORDER BY check_date DESC`,
      [userId]
    );

    res.json({
      history: history.map(h => ({
        date: h.check_date,
        streakCount: h.streak_count,
      })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
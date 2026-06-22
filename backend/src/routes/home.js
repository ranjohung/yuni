/**
 * 首页相关路由
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取首页dashboard数据
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.userId;

    // 获取连续签到天数
    const streakResult = await db.queryOne(
      `SELECT COUNT(*) as streak FROM check_ins 
       WHERE user_id = ? AND check_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       ORDER BY check_date DESC`,
      [userId]
    );
    const streakDays = streakResult?.streak || 0;

    // 今日是否已训练
    const todayTraining = await db.queryOne(
      `SELECT COUNT(*) as count FROM training_records 
       WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
      [userId]
    );
    const todayTrained = (todayTraining?.count || 0) > 0;

    // 本周训练次数
    const weeklyResult = await db.queryOne(
      `SELECT COUNT(*) as count FROM training_records 
       WHERE user_id = ? AND YEARWEEK(created_at) = YEARWEEK(CURDATE())`,
      [userId]
    );
    const weeklyProgress = weeklyResult?.count || 0;

    // 推荐场景（优先未完成的低难度场景）
    const scenarios = await db.query(
      `SELECT s.id, s.title, s.difficulty, s.duration_minutes, s.skill,
              COALESCE(tr.best_score, 0) as best_score,
              COALESCE(tr.completed_count, 0) > 0 as completed
       FROM scenarios s
       LEFT JOIN (
         SELECT scenario_id, MAX(total_score) as best_score, COUNT(*) as completed_count
         FROM training_records 
         WHERE user_id = ? AND is_completed = TRUE
         GROUP BY scenario_id
       ) tr ON s.id = tr.scenario_id
       ORDER BY s.difficulty, tr.completed_count ASC NULLS FIRST`,
      [userId]
    );

    let recommendedScenario = null;
    if (scenarios.length > 0) {
      // 优先推荐未完成的低难度场景
      const incomplete = scenarios.filter(s => !s.completed && s.difficulty <= 2);
      recommendedScenario = incomplete.length > 0 ? incomplete[0] : scenarios[0];
    }

    res.json({
      streakDays,
      todayTrained,
      weeklyProgress,
      recommendedScenario: recommendedScenario ? {
        id: recommendedScenario.id,
        title: recommendedScenario.title,
        difficulty: recommendedScenario.difficulty,
        durationMinutes: recommendedScenario.duration_minutes,
        skill: recommendedScenario.skill,
      } : null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
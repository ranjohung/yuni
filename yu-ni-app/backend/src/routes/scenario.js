/**
 * 场景服务路由
 * GET /api/v1/scenarios - 获取场景列表
 * GET /api/v1/scenarios/:id - 获取场景详情
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { scenarios, getScenarioById } = require('../scenarios/index');

// 获取场景列表
router.get('/', async (req, res, next) => {
  try {
    // 获取用户已完成训练
    const completed = await db.query(
      'SELECT scenario_id, MAX(total_score) as best_score FROM training_records WHERE user_id = ? AND is_completed = TRUE GROUP BY scenario_id',
      [req.userId]
    );
    
    const completedMap = {};
    completed.forEach(c => { completedMap[c.scenario_id] = c.best_score; });
    
    // 获取用户年龄限制
    const user = await db.queryOne('SELECT birth_date FROM users WHERE id = ?', [req.userId]);
    let userAge = 18;
    if (user?.birth_date) {
      const age = Math.floor((Date.now() - new Date(user.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      userAge = age;
    }
    
    const result = scenarios.map(s => {
      const bestScore = completedMap[s.id] || 0;
      // 根据年龄限制场景
      const locked = (userAge < 14 && s.stage > 1);
      
      return {
        ...s,
        bestScore,
        completed: bestScore > 0,
        progress: bestScore > 0 ? Math.min(bestScore / 100, 1) : 0,
        locked
      };
    });
    
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 获取场景详情
router.get('/:id', async (req, res, next) => {
  try {
    const scenario = getScenarioById(parseInt(req.params.id));
    if (!scenario) {
      return res.status(404).json({ error: '场景不存在', code: 'SCENARIO_NOT_FOUND' });
    }
    
    res.json(scenario);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

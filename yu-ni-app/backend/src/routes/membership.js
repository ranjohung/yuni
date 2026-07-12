/**
 * 会员服务路由
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取会员状态
router.get('/status', async (req, res, next) => {
  try {
    const user = await db.queryOne(
      'SELECT membership_level, membership_expire FROM users WHERE id = ?',
      [req.userId]
    );
    
    const levels = [
      { level: 0, name: '体验版', price: 0, features: ['基础聊天', '2D立绘', '每日1次训练', '每日1张穿梭券'] },
      { level: 1, name: '基础会员（周卡）', price: 6, features: ['NVC/CBT学习模块', '5次主动联系/天', '语音3次/天', '3张穿梭券/周'] },
      { level: 2, name: '标准会员（月卡）', price: 25, features: ['2.5D/3D数字人', '上传形象', '无限训练', '10张穿梭券/月', '完整依恋报告'] },
      { level: 3, name: '尊享会员（年卡）', price: 198, features: ['3D真人风格形象', '无限语音通话', '30张穿梭券/年', '全部专属剧情'] }
    ];
    
    const isExpired = user?.membership_expire && new Date(user.membership_expire) < new Date();
    const currentLevel = user?.membership_level || 0;
    
    res.json({
      currentLevel,
      currentLevelName: levels[currentLevel]?.name || '体验版',
      expireDate: user?.membership_expire,
      isExpired: !!isExpired,
      levels
    });
  } catch (err) {
    next(err);
  }
});

// 购买会员
router.post('/purchase', async (req, res, next) => {
  try {
    const { level } = req.body;
    
    if (level < 1 || level > 3) {
      return res.status(400).json({ error: '无效的会员等级', code: 'INVALID_LEVEL' });
    }
    
    const prices = { 1: 6, 2: 25, 3: 198 };
    const durations = { 1: 7, 2: 30, 3: 365 };
    
    const user = await db.queryOne('SELECT membership_level, membership_expire FROM users WHERE id = ?', [req.userId]);
    
    let expireDate;
    if (user?.membership_expire && new Date(user.membership_expire) > new Date()) {
      // 续费：在原有到期日上延长
      expireDate = new Date(user.membership_expire);
      expireDate.setDate(expireDate.getDate() + durations[level]);
    } else {
      expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + durations[level]);
    }
    
    // 如果购买更高等级，升级等级
    const newLevel = Math.max(user?.membership_level || 0, level);
    
    await db.execute(
      'UPDATE users SET membership_level = ?, membership_expire = ? WHERE id = ?',
      [newLevel, expireDate.toISOString().slice(0, 19).replace('T', ' '), req.userId]
    );
    
    res.json({
      message: '购买成功',
      level: newLevel,
      expireDate: expireDate.toISOString(),
      amount: prices[level]
    });
  } catch (err) {
    next(err);
  }
});

// 续费
router.post('/renew', async (req, res, next) => {
  try {
    const { level } = req.body;
    
    const durations = { 1: 7, 2: 30, 3: 365 };
    
    const user = await db.queryOne('SELECT membership_expire FROM users WHERE id = ?', [req.userId]);
    
    let expireDate;
    if (user?.membership_expire && new Date(user.membership_expire) > new Date()) {
      expireDate = new Date(user.membership_expire);
      expireDate.setDate(expireDate.getDate() + (durations[level] || 30));
    } else {
      expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + (durations[level] || 30));
    }
    
    await db.execute(
      'UPDATE users SET membership_expire = ? WHERE id = ?',
      [expireDate.toISOString().slice(0, 19).replace('T', ' '), req.userId]
    );
    
    res.json({ message: '续费成功', expireDate: expireDate.toISOString() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

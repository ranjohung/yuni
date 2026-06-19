/**
 * 用户服务路由
 * POST /api/v1/user/register - 注册
 * POST /api/v1/user/login - 登录
 * GET /api/v1/user/profile - 获取个人信息
 * PUT /api/v1/user/profile - 更新个人信息
 * DELETE /api/v1/user/data - 删除所有数据
 * POST /api/v1/user/verify-realname - 实名认证
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const { generateToken } = require('../middleware/auth');

// 注册
router.post('/register', async (req, res, next) => {
  try {
    const { phone, nickname } = req.body;
    if (!phone) {
      return res.status(400).json({ error: '手机号不能为空', code: 'PARAM_MISSING' });
    }
    
    // 检查手机号是否已注册
    const existing = await db.queryOne('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing) {
      return res.status(409).json({ error: '该手机号已注册', code: 'PHONE_EXISTS' });
    }
    
    const result = await db.execute(
      'INSERT INTO users (phone, nickname) VALUES (?, ?)',
      [phone, nickname || `用户${phone.slice(-4)}`]
    );
    
    // 初始化穿梭券
    await db.execute(
      'INSERT INTO user_tickets (user_id, balance) VALUES (?, 3)',
      [result.insertId]
    );
    
    const token = generateToken(result.insertId);
    
    res.status(201).json({
      message: '注册成功',
      userId: result.insertId,
      token
    });
  } catch (err) {
    next(err);
  }
});

// 登录
router.post('/login', async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: '手机号不能为空', code: 'PARAM_MISSING' });
    }
    
    const user = await db.queryOne('SELECT id, nickname, membership_level FROM users WHERE phone = ?', [phone]);
    if (!user) {
      return res.status(404).json({ error: '用户不存在', code: 'USER_NOT_FOUND' });
    }
    
    const token = generateToken(user.id);
    
    res.json({
      message: '登录成功',
      userId: user.id,
      nickname: user.nickname,
      membershipLevel: user.membership_level,
      token
    });
  } catch (err) {
    next(err);
  }
});

// 获取个人信息
router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await db.queryOne(
      'SELECT id, phone, nickname, avatar_url, real_name_verified, membership_level, membership_expire, created_at FROM users WHERE id = ?',
      [req.userId]
    );
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在', code: 'USER_NOT_FOUND' });
    }
    
    // 获取穿梭券数量
    const tickets = await db.queryOne('SELECT balance FROM user_tickets WHERE user_id = ?', [req.userId]);
    
    res.json({
      ...user,
      ticketsBalance: tickets?.balance || 0
    });
  } catch (err) {
    next(err);
  }
});

// 更新个人信息
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { nickname, avatar_url } = req.body;
    const updates = [];
    const params = [];
    
    if (nickname !== undefined) {
      updates.push('nickname = ?');
      params.push(nickname);
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      params.push(avatar_url);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段', code: 'NO_UPDATE' });
    }
    
    params.push(req.userId);
    await db.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    
    res.json({ message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// 实名认证
router.post('/verify-realname', auth, async (req, res, next) => {
  try {
    const { realName, idCard } = req.body;
    if (!realName || !idCard) {
      return res.status(400).json({ error: '姓名和身份证号不能为空', code: 'PARAM_MISSING' });
    }
    
    // 身份证号简单校验（长度18位）
    if (idCard.length !== 18) {
      return res.status(400).json({ error: '身份证号格式不正确', code: 'IDCARD_INVALID' });
    }
    
    // 提取出生日期
    const birthDate = `${idCard.slice(6, 10)}-${idCard.slice(10, 12)}-${idCard.slice(12, 14)}`;
    
    require('crypto').createHash('sha256').update(idCard).digest('hex');
    
    await db.execute(
      'UPDATE users SET real_name = ?, id_card_hash = ?, birth_date = ?, real_name_verified = TRUE WHERE id = ?',
      [realName, idCard.slice(0, 6) + '********' + idCard.slice(-4), birthDate, req.userId]
    );
    
    res.json({
      message: '实名认证成功',
      birthDate,
      ageVerified: true
    });
  } catch (err) {
    next(err);
  }
});

// 删除所有数据
router.delete('/data', auth, async (req, res, next) => {
  try {
    // 级联删除所有关联数据
    await db.execute('DELETE FROM chat_history WHERE user_id = ?', [req.userId]);
    await db.execute('DELETE FROM study_cards WHERE user_id = ?', [req.userId]);
    await db.execute('DELETE FROM training_records WHERE user_id = ?', [req.userId]);
    await db.execute('DELETE FROM daily_stats WHERE user_id = ?', [req.userId]);
    await db.execute('DELETE FROM user_tickets WHERE user_id = ?', [req.userId]);
    await db.execute('DELETE FROM memories WHERE partner_id IN (SELECT id FROM partners WHERE user_id = ?)', [req.userId]);
    await db.execute('DELETE FROM partners WHERE user_id = ?', [req.userId]);
    await db.execute('DELETE FROM users WHERE id = ?', [req.userId]);
    
    res.json({ message: '所有数据已彻底删除' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

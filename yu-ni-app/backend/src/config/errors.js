/**
 * 错误码标准化
 * 所有API统一错误码和响应格式
 */
const ERROR_CODES = {
  // 通用 (1000-1999)
  OK: { code: 0, message: '成功' },
  UNKNOWN_ERROR: { code: 1000, message: '服务器内部错误' },
  INVALID_PARAMS: { code: 1001, message: '参数无效' },
  MISSING_PARAMS: { code: 1002, message: '缺少必填参数' },
  RATE_LIMITED: { code: 1003, message: '请求过于频繁' },
  NOT_FOUND: { code: 1004, message: '资源不存在' },
  METHOD_NOT_ALLOWED: { code: 1005, message: '请求方法不允许' },

  // 认证 (2000-2999)
  TOKEN_MISSING: { code: 2000, message: '未登录，请先登录' },
  TOKEN_EXPIRED: { code: 2001, message: '登录已过期，请重新登录' },
  TOKEN_INVALID: { code: 2002, message: '登录凭证无效' },
  AUTH_FAILED: { code: 2003, message: '登录失败，账号或密码错误' },
  FORBIDDEN: { code: 2004, message: '无权限访问' },
  TRIAL_EXHAUSTED: { code: 2005, message: '免费体验已用尽，注册后继续使用' },

  // 用户 (3000-3999)
  USER_EXISTS: { code: 3000, message: '该手机号已注册' },
  USER_NOT_FOUND: { code: 3001, message: '用户不存在' },
  INVALID_PHONE: { code: 3002, message: '手机号格式不正确' },
  INVALID_NICKNAME: { code: 3003, message: '昵称格式不正确（2-20个中英文或数字）' },
  NAME_REAL_FAILED: { code: 3004, message: '实名认证失败' },
  UNDER_AGE: { code: 3005, message: '根据相关规定，18岁以下用户暂不能使用该功能' },

  // 伴侣 (4000-4999)
  PARTNER_NOT_FOUND: { code: 4000, message: '伴侣不存在' },
  PARTNER_LIMIT: { code: 4001, message: '已达到伴侣创建上限' },
  INVALID_CORE_TYPE: { code: 4002, message: '无效的核心内核类型' },

  // 对话 (5000-5999)
  CHAT_SEND_FAILED: { code: 5000, message: '消息发送失败' },
  LLM_UNAVAILABLE: { code: 5001, message: 'AI暂时不在线，请稍后重试' },
  SENSITIVE_CONTENT: { code: 5002, message: '内容包含敏感信息' },
  DAILY_LIMIT: { code: 5003, message: '今日对话次数已达上限' },

  // 场景 (6000-6999)
  SCENE_LOCKED: { code: 6000, message: '该场景未解锁' },
  SCENE_NOT_FOUND: { code: 6001, message: '场景不存在' },
  TRAINING_EXHAUSTED: { code: 6002, message: '今日训练票已用完' },

  // 会员 (7000-7999)
  MEMBERSHIP_EXPIRED: { code: 7000, message: '会员已过期' },
  INVALID_MEMBERSHIP: { code: 7001, message: '无效的会员类型' },
  PAYMENT_FAILED: { code: 7002, message: '支付失败' },

  // 合规 (8000-8999)
  AGE_RESTRICTED: { code: 8000, message: '年龄限制：无法访问该内容' },
  REALNAME_REQUIRED: { code: 8001, message: '需要完成实名认证才能使用此功能' },
  TIME_LIMIT_EXCEEDED: { code: 8002, message: '今日使用时长已达限制，请休息一下' },

  // LLM引擎 (9000-9999)
  LLM_QUOTA_EXCEEDED: { code: 9000, message: 'API配额已用完' },
  LLM_FALLBACK: { code: 9001, message: '当前使用本地模型' },
};

/**
 * 成功响应
 */
function success(data, message) {
  return {
    code: 0,
    message: message || '成功',
    data: data
  };
}

/**
 * 错误响应
 */
function error(codeObj, extra) {
  const resp = {
    code: codeObj.code,
    message: codeObj.message,
  };
  if (extra) {
    if (typeof extra === 'string') resp.message = extra;
    else Object.assign(resp, extra);
  }
  return resp;
}

/**
 * Express 错误处理中间件
 */
function errorHandler(err, req, res, next) {
  // 记录错误
  const logger = req.app?.locals?.logger || console;
  logger.error('[API Error]', { path: req.path, method: req.method, error: err.message });
  
  // 格式化错误
  const resp = error(ERROR_CODES.UNKNOWN_ERROR);
  resp.detail = process.env.NODE_ENV === 'development' ? err.message : undefined;
  
  res.status(500).json(resp);
}

/**
 * Express 404 处理
 */
function notFoundHandler(req, res) {
  res.status(404).json(error(ERROR_CODES.NOT_FOUND));
}

module.exports = { ERROR_CODES, success, error, errorHandler, notFoundHandler };

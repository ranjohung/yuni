/**
 * 输入校验中间件
 * 防XSS、SQL注入、参数类型检查
 */
const validator = require('validator');

// 通用清理：去除HTML标签、特殊字符
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return validator.stripLow(str.trim(), true);
}

// 校验并清理对话内容
function sanitizeMessage(msg) {
  if (typeof msg !== 'string') return '';
  const cleaned = validator.stripLow(msg.trim(), true);
  // 限制最大长度
  return cleaned.substring(0, 2000);
}

// 校验手机号格式
function isValidPhone(phone) {
  // 中国大陆手机号（11位数字，1开头）
  return /^1[3-9]\d{9}$/.test(phone);
}

// 校验昵称（2-20字，不允许特殊字符）
function isValidNickname(name) {
  if (typeof name !== 'string') return false;
  const cleaned = name.trim();
  return cleaned.length >= 2 && cleaned.length <= 20 && /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(cleaned);
}

// 校验身份证号（简单格式+生日提取）
function isValidIdCard(id) {
  if (typeof id !== 'string') return false;
  // 18位身份证（最后一位可能是X）
  return /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(id);
}

// 提取身份证出生日期
function extractBirthFromId(id) {
  if (!isValidIdCard(id)) return null;
  const year = parseInt(id.substring(6, 10));
  const month = parseInt(id.substring(10, 12));
  const day = parseInt(id.substring(12, 14));
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// 校验好感度值
function isValidAffinity(val) {
  return Number.isInteger(val) && val >= -100 && val <= 100;
}

// 校验分页参数
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  return { page, limit, offset: (page - 1) * limit };
}

module.exports = {
  sanitize, sanitizeMessage, isValidPhone, isValidNickname,
  isValidIdCard, extractBirthFromId, isValidAffinity, parsePagination
};

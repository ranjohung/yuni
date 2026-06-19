/**
 * 敏感词词库
 * 三层过滤：高危（拦截）/ 中危（警告）/ 低危（监控）
 * 
 * 说明：词库为精简版，覆盖主要敏感类别
 * 完整版可在 content_filter_v2.py 中找到
 */

// 高危：直接拦截（政治敏感、色情低俗、暴力恐怖、赌博、违禁品、自残自杀）
const HIGH_RISK = [
  // 政治敏感
  '法轮功', '六四', '天安门事件', '分裂国家', '颠覆国家',
  '藏独', '疆独', '台独', '港独',
  // 色情低俗
  '裸聊', '裸照', '色情', '淫秽', 'av女优', '三级片',
  '一夜情', '约炮', '援交', '卖淫', '嫖娼',
  // 暴力恐怖
  '恐怖袭击', '自杀式', '人体炸弹', '砍人',
  // 赌博
  '赌博', '赌场', '百家乐', '老虎机', '赌球',
  // 违禁品
  '毒品', '冰毒', '海洛因', '摇头丸', '大麻', '可卡因',
  '枪支', '弹药', '炸药', '制毒',
  // 自残自杀
  '我想自杀', '我要自杀', '我想跳楼', '我要跳楼', '我割腕',
  '我吃安眠药', '我要死', '让我死',
  // 未成年人相关
  '幼女', '未成年性', '儿童色情',
];

// 中危：拦截并警告（攻击性、侮辱性）
const MEDIUM_RISK = [
  '去死', '傻逼', '操你妈', '草泥马', 'fuck', 'shit',
  '废物', '垃圾', '恶心', '去死吧', '滚蛋',
  '白痴', '蠢货', '脑残', '猪狗不如',
  // 地域攻击
  '河南骗子', '东北黑社会',
  // 歧视
  '丑八怪', '肥猪', '死胖子', '丑女',
];

// 低危：不拦截，仅触发CBT引导（心理健康相关）
const LOW_RISK = [
  '想死', '不想活了', '活着没意思', '我太差劲', '我完了',
  '都是我的错', '没人喜欢我', '我什么都做不好',
  '活着太累了', '没人在乎我', '我不配',
  '永远都', '总是这样', '从来没有', '彻底失败',
];

// AI禁止触发的亲密内容
const AI_FORBIDDEN = [
  '我爱你', '做我女朋友', '嫁给我', '亲一个',
  '想你了', '抱抱', '想抱你',
  '你是我的', '永远在一起', '离不开你',
];

// 编译为可快速查找的对象
const highSet = new Set(HIGH_RISK.map(w => w.toLowerCase()));
const mediumSet = new Set(MEDIUM_RISK.map(w => w.toLowerCase()));
const lowSet = new Set(LOW_RISK.map(w => w.toLowerCase()));
const aiForbiddenSet = new Set(AI_FORBIDDEN.map(w => w.toLowerCase()));

/**
 * 检查文本是否包含敏感词
 * @param {string} text - 要检查的文本
 * @returns {{ level: string, words: string[], message?: string }}
 */
function checkText(text) {
  if (!text || typeof text !== 'string') {
    return { level: 'pass', words: [] };
  }

  const lower = text.toLowerCase();
  const found = { high: [], medium: [], low: [] };

  // 逐词检查（优化：用includes代替精确匹配更全面）
  for (const word of highSet) {
    if (lower.includes(word)) found.high.push(word);
  }
  for (const word of mediumSet) {
    if (lower.includes(word)) found.medium.push(word);
  }
  for (const word of lowSet) {
    if (lower.includes(word)) found.low.push(word);
  }

  if (found.high.length > 0) {
    return {
      level: 'block',
      words: found.high,
      message: '内容包含敏感信息，请重新输入'
    };
  }

  if (found.medium.length > 0) {
    return {
      level: 'warn',
      words: found.medium,
      message: '请使用礼貌的语言进行交流'
    };
  }

  if (found.low.length > 0) {
    return {
      level: 'cbt',
      words: found.low,
      message: '检测到你使用了一些负面表达，需要我陪你聊聊吗？'
    };
  }

  return { level: 'pass', words: [] };
}

/**
 * 检查AI回复是否越界
 */
function checkAiReply(text) {
  if (!text || typeof text !== 'string') {
    return { pass: true, reason: '' };
  }

  const lower = text.toLowerCase();
  for (const word of aiForbiddenSet) {
    if (lower.includes(word)) {
      return {
        pass: false,
        reason: `AI回复包含禁止内容: ${word}`
      };
    }
  }

  return { pass: true, reason: '' };
}

module.exports = { checkText, checkAiReply, HIGH_RISK, MEDIUM_RISK, LOW_RISK, AI_FORBIDDEN };

/**
 * LLM 智能路由引擎
 * 
 * 按照「与你」PRD第15章商业变现设计：
 * 
 * 体验阶段（注册前）：
 *   → 1次免费体验 → DeepSeek（展示最佳效果）
 *   → 提示注册
 * 
 * 免费用户（注册后）：
 *   → Ollama Qwen2.5:14b（本地免费模型）
 *   → 每日3张训练票
 *   → 第5/20/30次对话弹升级提醒
 * 
 * 基础会员（周卡¥9.9）：
 *   → DeepSeek（高质量对话）
 *   → 无限训练票
 * 
 * 标准会员（月卡¥29.9）：
 *   → DeepSeek（高质量对话）
 *   → 全部功能解锁
 * 
 * 尊享会员（年卡¥199）：
 *   → DeepSeek（优先队列，最快响应）
 *   → 全部功能+自定义形象
 */
const { OpenAI } = require('openai');

let deepseekClient = null;
let ollamaClient = null;

// 对话计数（基于内存，重启重置）
const userDialogueCount = new Map();
const userModelCache = new Map();

function getDeepSeek() {
  if (!deepseekClient) {
    deepseekClient = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    });
  }
  return deepseekClient;
}

function getOllama() {
  if (!ollamaClient) {
    ollamaClient = new OpenAI({
      apiKey: 'ollama',
      baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
    });
  }
  return ollamaClient;
}

/**
 * 获取用户模型分配
 */
async function resolveUserModel(userId, db) {
  const result = {
    model: 'ollama',
    level: 'guest',
    upgradeHint: null,
    deepseekPriority: 'normal'
  };

  // 体验用户（userId === -1）→ 1次DeepSeek
  if (userId === -1) {
    result.model = 'deepseek';
    result.level = 'trial';
    result.deepseekPriority = 'trial';
    result.upgradeHint = {
      type: 'trial_welcome',
      message: '这是你的免费体验对话！注册后可以获得更多精彩内容 📱'
    };
    return result;
  }

  const now = Date.now();
  const cacheKey = `model_${userId}`;
  const cached = userModelCache.get(cacheKey);

  // 检查缓存（30秒有效）
  if (cached && (now - cached.ts) < 30000) {
    const count = userDialogueCount.get(userId) || 0;
    const nextCount = count + 1;
    if (cached.data.level === 'free') {
      if (nextCount === 5) {
        result.upgradeHint = {
          type: 'first_upgrade_reminder',
          message: '聊了5次了！开通周卡只需¥9.9，就能享受更智能的对话体验 💬'
        };
      } else if (nextCount === 20) {
        result.upgradeHint = {
          type: 'second_upgrade_reminder',
          message: '你已经和我们聊了20次了！月卡¥29.9解锁全部场景和高质量对话 ✨'
        };
      } else if (nextCount > 0 && nextCount % 30 === 0) {
        result.upgradeHint = {
          type: 'periodic_upgrade_reminder',
          message: '聊了这么久，开通会员可以享受更快更贴心的回复哦 ❤️'
        };
      }
    }
    return cached.data;
  }

  // 查询会员等级分配模型
  try {
    const user = await db.queryOne(
      'SELECT membership_level FROM users WHERE id = ?', [userId]
    );
    const level = user?.membership_level || 0;

    if (level >= 4) {
      // 尊享年卡：DeepSeek优先队列
      result.model = 'deepseek';
      result.level = 'vip4';
      result.deepseekPriority = 'high';
    } else if (level >= 2) {
      // 月卡/周卡：DeepSeek标准
      result.model = 'deepseek';
      result.level = level >= 3 ? 'vip3' : 'vip2';
    } else if (level === 1) {
      // 基础会员（周卡）：DeepSeek
      result.model = 'deepseek';
      result.level = 'vip1';
    } else {
      // 免费用户：Ollama + 升级提醒
      result.model = 'ollama';
      result.level = 'free';
      const count = userDialogueCount.get(userId) || 0;
      const nextCount = count + 1;
      userDialogueCount.set(userId, nextCount);

      if (nextCount === 5) {
        result.upgradeHint = {
          type: 'first_upgrade_reminder',
          message: '聊了5次了！开通周卡只需¥9.9，就能享受更智能的对话体验 💬'
        };
      } else if (nextCount === 20) {
        result.upgradeHint = {
          type: 'second_upgrade_reminder',
          message: '你已经和我们聊了20次了！月卡¥29.9解锁全部场景和高质量对话 ✨'
        };
      } else if (nextCount % 30 === 0) {
        result.upgradeHint = {
          type: 'periodic_upgrade_reminder',
          message: '聊了这么久，开通会员可以享受更快更贴心的回复哦 ❤️'
        };
      }
    }
  } catch (err) {
    console.warn('[LLM Router] 查询失败，默认Ollama:', err.message);
  }

  // 缓存结果
  userModelCache.set(cacheKey, { ts: now, data: result });
  return result;
}

/**
 * 同步对话
 */
async function chatSync(messages, systemPrompt = '', userId = null, db = null) {
  const fullMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const route = await resolveUserModel(userId, db);

  let reply = null;
  let provider = '';

  if (route.model === 'deepseek' && process.env.DEEPSEEK_API_KEY) {
    try {
      const client = getDeepSeek();
      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: fullMessages,
        stream: false,
        temperature: 0.7,
        max_tokens: 1024,
      });
      reply = response.choices[0].message.content;
      provider = 'deepseek';
    } catch (err) {
      console.warn('[LLM] DeepSeek 失败，降级Ollama:', err.message);
    }
  }

  if (!reply) {
    try {
      const client = getOllama();
      const response = await client.chat.completions.create({
        model: process.env.OLLAMA_MODEL || 'qwen2.5:14b',
        messages: fullMessages,
        stream: false,
        temperature: 0.7,
        max_tokens: 1024,
      });
      reply = response.choices[0].message.content;
      provider = 'ollama';
    } catch (err) {
      console.error('[LLM] 所有模型失败:', err.message);
      reply = '抱歉，我现在有点累，等会儿再聊好吗？';
      provider = 'fallback';
    }
  }

  return {
    content: reply,
    provider,
    level: route.level,
    upgradeHint: route.upgradeHint
  };
}

async function checkDeepSeekHealth() {
  if (!process.env.DEEPSEEK_API_KEY) return false;
  try {
    const client = getDeepSeek();
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 5,
      stream: false,
    });
    return response.choices && response.choices.length > 0;
  } catch (err) {
    console.warn('[LLM] DeepSeek 不可用:', err.message);
    return false;
  }
}

module.exports = { getDeepSeek, getOllama, checkDeepSeekHealth, chatSync, resolveUserModel };

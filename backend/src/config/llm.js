/**
 * LLM 智能路由引擎
 * 
 * 路由策略（按优先级）：
 *   1. 会员用户 → DeepSeek-Chat（高质量）
 *   2. 首次体验用户（前5次对话） → DeepSeek-Chat（展示能力）
 *   3. 普通用户 → Ollama Qwen2.5:14b（免费）
 *   4. 所有模型不可用 → 固定兜底回复
 * 
 * 升级提醒策略：
 *   - 普通用户每10次对话后弹一次「试试更流畅的对话」
 *   - Ollama响应慢时弹「开通会员加速」
 *   - 首次体验用完DeepSeek次数后弹「继续免费畅聊」
 */
const { OpenAI } = require('openai');

let deepseekClient = null;
let ollamaClient = null;

// 追踪各用户对话次数（内存计数，重启重置）
const userChatCounts = new Map();
const userMembershipCache = new Map();

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
 * 智能选择模型
 * @param {number} userId
 * @param {object} db - 数据库查询方法
 * @returns {{ model: string, shouldPrompt: object|null }}
 */
async function selectModel(userId, db) {
  const result = { model: 'deepseek', shouldPrompt: null };

  try {
    // 1. 查会员状态（缓存1分钟减轻DB压力）
    const cached = userMembershipCache.get(userId);
    let isMember = false;
    let firstTime = false;
    let chatCount = userChatCounts.get(userId) || 0;

    if (cached && Date.now() - cached.time < 60000) {
      isMember = cached.isMember;
      firstTime = cached.firstTime;
    } else if (db) {
      const user = await db.queryOne(
        'SELECT membership_level FROM users WHERE id = ?', [userId]
      );
      isMember = (user?.membership_level || 0) > 0;
      // 首次体验：总对话次数小于5
      firstTime = !isMember && chatCount < 5;
      
      userMembershipCache.set(userId, { isMember, firstTime, time: Date.now() });
    }

    // 计数+1（当前对话）
    const currentCount = chatCount + 1;
    userChatCounts.set(userId, currentCount);

    // 2. 路由决策
    if (isMember) {
      // 会员 → DeepSeek，无需提醒
      result.model = 'deepseek';
    } else if (currentCount <= 5) {
      // 首次体验用户前5次 → DeepSeek
      result.model = 'deepseek';
      // 第4次时提醒：还有1次体验机会
      if (currentCount === 4) {
        result.shouldPrompt = {
          type: 'first_trial_ending',
          message: '你已经体验了4次高质量的对话，还有1次免费体验机会哦！之后可以选择继续免费畅聊或开通会员享受更流畅的体验。'
        };
      }
    } else {
      // 普通用户 → Ollama
      result.model = 'ollama';
      
      // 每10次对话提醒升级
      if (currentCount > 0 && currentCount % 10 === 0) {
        result.shouldPrompt = {
          type: 'upgrade_suggestion',
          message: '聊了这么久，开通会员可以使用更智能的对话引擎，回复更快更贴心 ❤️'
        };
      }
      
      // 首次从DeepSeek降级到Ollama时提醒
      if (currentCount === 6) {
        result.shouldPrompt = {
          type: 'trial_ended',
          message: '免费体验次数已用完，现在是用本地AI在陪你聊天哦。开通会员可以恢复高质量对话体验！'
        };
      }
    }
  } catch (err) {
    console.warn('[LLM Router] 查询失败，默认Ollama:', err.message);
    result.model = 'ollama';
  }

  return result;
}

/**
 * 同步对话（非流式）
 */
async function chatSync(messages, systemPrompt = '', userId = null, db = null) {
  const fullMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  // 智能选模型（内部已处理计数）
  const route = await selectModel(userId, db);
  let reply;
  let provider;
  let usage = null;

  const shouldPrompt = route.shouldPrompt;

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
      usage = response.usage;
    } catch (err) {
      console.warn('[LLM] DeepSeek 生成失败，降级到本地:', err.message);
      route.model = 'ollama';
    }
  }

  if (route.model === 'ollama' || !reply) {
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
      console.error('[LLM] 所有模型都失败:', err.message);
      reply = '抱歉，我现在有点累，等会儿再聊好吗？';
      provider = 'fallback';
    }
  }

  return { content: reply, provider, usage, shouldPrompt };
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

module.exports = { getDeepSeek, getOllama, checkDeepSeekHealth, chatSync, selectModel };

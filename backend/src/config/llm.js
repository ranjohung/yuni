/**
 * LLM 配置
 * 主力：DeepSeek-Chat
 * 兜底：本地 Ollama Qwen2.5:14B
 */
const { OpenAI } = require('openai');

let deepseekClient = null;
let ollamaClient = null;

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
      apiKey: 'ollama', // Ollama 不验证 API Key
      baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
    });
  }
  return ollamaClient;
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

async function * chatStream(messages, systemPrompt = '', model = 'deepseek-chat') {
  const fullMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  // 优先使用 DeepSeek
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const client = getDeepSeek();
      const stream = await client.chat.completions.create({
        model,
        messages: fullMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1024,
      });
      
      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content || '';
        if (content) yield { content, provider: 'deepseek' };
      }
      return;
    } catch (err) {
      console.warn('[LLM] DeepSeek 流式生成失败，降级到本地:', err.message);
    }
  }

  // 降级到本地 Ollama
  try {
    const client = getOllama();
    const stream = await client.chat.completions.create({
      model: process.env.OLLAMA_MODEL || 'qwen2.5:14b',
      messages: fullMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      if (content) yield { content, provider: 'ollama' };
    }
  } catch (err) {
    console.error('[LLM] 本地模型也失败:', err.message);
    yield { content: '抱歉，我现在有点累，等会儿再聊好吗？', provider: 'fallback' };
  }
}

async function chatSync(messages, systemPrompt = '') {
  const fullMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const client = getDeepSeek();
      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: fullMessages,
        stream: false,
        temperature: 0.7,
        max_tokens: 1024,
      });
      return {
        content: response.choices[0].message.content,
        provider: 'deepseek',
        usage: response.usage
      };
    } catch (err) {
      console.warn('[LLM] DeepSeek 生成失败，降级:', err.message);
    }
  }

  try {
    const client = getOllama();
    const response = await client.chat.completions.create({
      model: process.env.OLLAMA_MODEL || 'qwen2.5:14b',
      messages: fullMessages,
      stream: false,
      temperature: 0.7,
      max_tokens: 1024,
    });
    return {
      content: response.choices[0].message.content,
      provider: 'ollama',
    };
  } catch (err) {
    console.error('[LLM] 所有模型都失败:', err.message);
    return { content: '抱歉，我现在有点累，等会儿再聊好吗？', provider: 'fallback' };
  }
}

module.exports = { getDeepSeek, getOllama, checkDeepSeekHealth, chatStream, chatSync };

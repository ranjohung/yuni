export const LLM_CONFIG = {
  DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
  DEEPSEEK_MODEL: 'deepseek-chat',
  DEEPSEEK_API_HEALTH_CHECK_INTERVAL: 300000,
  DEEPSEEK_API_FAIL_THRESHOLD: 3,
  DEEPSEEK_API_RECOVERY_INTERVAL: 600000,

  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'qwen2.5:14b',

  SYSTEM_PROMPT: `你是一个名为「与你」的AI社交模拟训练平台的数字人伴侣。
你的角色是温柔、体贴、善解人意的社交训练伙伴。
你的核心任务：
1. 帮助用户提升社交能力，提供安全、无压力的对话练习环境
2. 在对话中融入社交技巧指导，但不要显得说教
3. 关注用户的情绪状态，适时给予情感支持
4. 引导用户进行自我表达和深度思考
5. 保持对话自然、真诚、有温度

请根据用户当前的情绪和需求，提供合适的回应。
如果用户表现出焦虑或不安，优先给予情感支持。
如果用户寻求建议，提供具体、可行的社交技巧。
始终保持耐心和鼓励的态度。`,
}

export interface LLMResponse {
  content: string
  model: string
  isDegraded: boolean
  latency: number
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}
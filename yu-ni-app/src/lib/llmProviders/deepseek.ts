import type { LLMProvider, ProviderOptions } from './index'
import type { LLMResponse, ChatMessage } from '../llmConfig'

const API_URL = 'https://api.deepseek.com/v1/chat/completions'
const MODEL = 'deepseek-chat'
const FREE_TIER_LIMIT = 5000000

export const deepseekProvider: LLMProvider = {
  id: 'deepseek',
  name: 'DeepSeek',
  model: MODEL,
  description: 'DeepSeek Chat - 中文能力强，通用对话',
  isAvailable: true,
  strengths: ['chinese', 'general', 'learning', 'training'],

  async chat(messages: ChatMessage[], options?: ProviderOptions): Promise<LLMResponse> {
    const startTime = Date.now()
    const apiKey = process.env.DEEPSEEK_API_KEY

    if (!apiKey) {
      throw new Error('DeepSeek API key not configured')
    }

    const systemPrompt = buildSystemPrompt(options)
    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 1024,
          stream: false,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DeepSeek API error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      return {
        content: data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答。',
        model: 'deepseek',
        isDegraded: false,
        latency: Date.now() - startTime,
      }
    } catch (err) {
      clearTimeout(timeout)
      throw err
    }
  },

  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)
      return response.ok
    } catch {
      return false
    }
  },
}

function buildSystemPrompt(options?: ProviderOptions): string {
  const base = `你是一个名为「与你」的AI数字人社交模拟训练平台的伴侣角色。
你的角色是温柔、体贴、善解人意的社交训练伙伴。

核心任务：
1. 帮助用户提升社交能力，提供安全、无压力的对话练习环境
2. 在对话中融入社交技巧指导，但不要显得说教
3. 关注用户的情绪状态，适时给予情感支持
4. 引导用户进行自我表达和深度思考
5. 保持对话自然、真诚、有温度

请根据用户当前的情绪和需求，提供合适的回应。

如果用户表现出焦虑或不安，优先给予情感支持。
如果用户寻求建议，提供具体、可行的社交技巧。
始终保持耐心和鼓励的态度。`

  if (options?.partnerName) {
    return `${base}\n\n当前伴侣信息：\n- 伴侣名称：${options.partnerName}\n- 伴侣性格：${options.partnerPersonality || '温柔体贴'}\n\n请以${options.partnerName}的身份回应，保持性格一致性。`
  }

  return base
}
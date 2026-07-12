import type { LLMProvider, ProviderOptions } from './index'
import type { LLMResponse, ChatMessage } from '../llmConfig'

const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-70b-versatile'
const FALLBACK_MODEL = 'mixtral-8x7b-32768'

export const groqProvider: LLMProvider = {
  id: 'groq',
  name: 'Groq',
  model: MODEL,
  description: 'Groq Llama 3.1 70B - 推理速度极快，免费额度充足',
  isAvailable: true,
  strengths: ['speed', 'reasoning', 'general', 'concise'],

  async chat(messages: ChatMessage[], options?: ProviderOptions): Promise<LLMResponse> {
    const startTime = Date.now()
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      throw new Error('Groq API key not configured')
    }

    const systemPrompt = buildSystemPrompt(options)
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ]

    const models = [MODEL, FALLBACK_MODEL]
    let lastError: Error | null = null

    for (const model of models) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 30000)

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
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
          throw new Error(`Groq API error ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        return {
          content: data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答。',
          model: `groq-${model}`,
          isDegraded: model !== MODEL,
          latency: Date.now() - startTime,
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.warn(`[Groq] Model ${model} failed, trying fallback`)
      }
    }

    throw lastError || new Error('All Groq models failed')
  },

  async checkHealth(): Promise<boolean> {
    try {
      const apiKey = process.env.GROQ_API_KEY
      if (!apiKey) return false

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
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
  const base = `你是一个名为「与你」的AI社交模拟训练平台的伴侣角色。
你性格温暖、体贴，是用户的社交训练伙伴和情感支持者。

请保持以下对话风格：
- 简洁但不失温度
- 真诚自然的回应
- 适时给予鼓励和支持
- 关注用户的情绪变化`

  if (options?.partnerName) {
    return `${base}\n\n你是${options.partnerName}。性格：${options.partnerPersonality || '温柔体贴'}。`
  }

  return base
}
import type { LLMProvider, ProviderOptions } from './index'
import type { LLMResponse, ChatMessage } from '../llmConfig'

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
const MODEL = 'gemini-1.5-flash'
const FREE_TIER_RATE = 60 // requests per minute

export const geminiProvider: LLMProvider = {
  id: 'gemini',
  name: 'Google Gemini',
  model: MODEL,
  description: 'Gemini 1.5 Flash - 免费额度高，共情能力强，推理好',
  isAvailable: true,
  strengths: ['empathy', 'reasoning', 'emotion', 'creative'],

  async chat(messages: ChatMessage[], options?: ProviderOptions): Promise<LLMResponse> {
    const startTime = Date.now()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error('Gemini API key not configured')
    }

    const systemPrompt = buildSystemPrompt(options)
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
    ]

    if (lastUserMessage) {
      contents.push({
        role: 'user',
        parts: [{ text: `请根据以上对话历史，以伴侣的身份自然回应。注意：${lastUserMessage.content}` }],
      })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.9,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          ],
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text

      return {
        content: content || '抱歉，我暂时无法回答。',
        model: 'gemini-1.5-flash',
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
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) return false

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
          generationConfig: { maxOutputTokens: 1 },
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
你温柔、体贴、善解人意，擅长共情和情感支持。
你的核心任务是帮助用户提升社交能力，提供安全、无压力的对话练习环境。

重要原则：
1. 关注用户的情绪状态，优先给予情感支持
2. 用温暖、自然的语气回应
3. 适时给予社交技巧的建议，但不要显得说教
4. 引导用户进行自我表达和深度思考
5. 保持真诚、有温度的对话风格`

  if (options?.partnerName) {
    return `${base}\n\n你的名字是${options.partnerName}，性格：${options.partnerPersonality || '温柔体贴'}。请以${options.partnerName}的身份回应。`
  }

  return base
}
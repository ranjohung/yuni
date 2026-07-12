import type { LLMProvider, ProviderOptions } from './index'
import type { LLMResponse, ChatMessage } from '../llmConfig'

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:14b'

const FALLBACK_RESPONSES = [
  '我理解你的感受，这确实是一个需要认真思考的问题。让我们一起想想看...',
  '嗯，你说得很有道理。我在想，也许我们可以从另一个角度来看待这个问题。',
  '谢谢你的分享。这让我想到了一个有趣的观点，想听听你的想法。',
  '我明白你的意思。其实每个人都会有这样的感受，这很正常。',
  '你说得很好。继续这个话题，我很想了解更多你的想法。',
  '听起来你对此有很深的感受，能再详细说说吗？我很想听。',
  '这个问题确实不容易，但你有勇气说出来，已经很棒了。',
]

export const ollamaProvider: LLMProvider = {
  id: 'ollama',
  name: 'Ollama',
  model: OLLAMA_MODEL,
  description: 'Ollama 本地模型 - 完全免费，离线可用',
  isAvailable: true,
  strengths: ['local', 'privacy', 'offline', 'fallback'],

  async chat(messages: ChatMessage[], options?: ProviderOptions): Promise<LLMResponse> {
    const startTime = Date.now()
    const systemPrompt = buildSystemPrompt(options)

    const ollamaMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ]

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: ollamaMessages,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 1024,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        throw new Error(`Ollama API error ${response.status}`)
      }

      const data = await response.json()
      return {
        content: data.message?.content || getFallbackResponse(),
        model: `ollama-${OLLAMA_MODEL}`,
        isDegraded: false,
        latency: Date.now() - startTime,
      }
    } catch (err) {
      console.error('[Ollama] Local model unavailable, using fallback:', err)
      return {
        content: getFallbackResponse(),
        model: 'ollama-fallback',
        isDegraded: true,
        latency: Date.now() - startTime,
      }
    }
  },

  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${OLLAMA_URL}/api/tags`, {
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
请以自然、真诚的语气回应，保持对话的温暖和深度。`

  if (options?.partnerName) {
    return `${base}\n\n你是${options.partnerName}，性格：${options.partnerPersonality || '温柔体贴'}。`
  }

  return base
}

function getFallbackResponse(): string {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
}
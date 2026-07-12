import { LLM_CONFIG, type LLMResponse, type ChatMessage } from './llmConfig'
import { getHealthChecker } from './llmHealthChecker'

export interface RouterOptions {
  userId: number
  membershipType: number
  partnerName: string
  partnerPersonality: string
}

export async function chatWithLLM(
  messages: ChatMessage[],
  options: RouterOptions
): Promise<LLMResponse> {
  const healthChecker = getHealthChecker()
  const startTime = Date.now()

  const systemPrompt = buildSystemPrompt(options)
  const fullMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]

  if (healthChecker.isUsingFallback()) {
    return callOllama(fullMessages, startTime)
  }

  const shouldUseDeepSeek = shouldRouteToDeepSeek(options.membershipType)
  if (!shouldUseDeepSeek) {
    return callOllama(fullMessages, startTime)
  }

  try {
    const result = await callDeepSeek(fullMessages, startTime)
    return result
  } catch (err) {
    console.error('[LLM Router] DeepSeek call failed, falling back to Ollama:', err)
    return callOllama(fullMessages, startTime)
  }
}

function shouldRouteToDeepSeek(membershipType: number): boolean {
  if (membershipType >= 3) return true
  if (membershipType >= 2) return true
  if (membershipType >= 1) return true
  return Math.random() < 0.1
}

function buildSystemPrompt(options: RouterOptions): string {
  return `${LLM_CONFIG.SYSTEM_PROMPT}

当前伴侣信息：
- 伴侣名称：${options.partnerName}
- 伴侣性格：${options.partnerPersonality}

请以${options.partnerName}的身份回应，保持性格一致性。`
}

async function callDeepSeek(
  messages: ChatMessage[],
  startTime: number
): Promise<LLMResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DeepSeek API key not configured')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(LLM_CONFIG.DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: LLM_CONFIG.DEEPSEEK_MODEL,
        messages,
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
    const latency = Date.now() - startTime

    return {
      content: data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答。',
      model: 'deepseek',
      isDegraded: false,
      latency,
    }
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

async function callOllama(
  messages: ChatMessage[],
  startTime: number
): Promise<LLMResponse> {
  const ollamaMessages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }))

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(`${LLM_CONFIG.OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LLM_CONFIG.OLLAMA_MODEL,
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
    const latency = Date.now() - startTime

    return {
      content: data.message?.content || getFallbackResponse(),
      model: 'ollama',
      isDegraded: getHealthChecker().isUsingFallback(),
      latency,
    }
  } catch (err) {
    console.error('[LLM Router] Ollama call failed:', err)
    return {
      content: getFallbackResponse(),
      model: 'ollama',
      isDegraded: true,
      latency: Date.now() - startTime,
    }
  }
}

function getFallbackResponse(): string {
  const responses = [
    '我理解你的感受，这确实是一个需要认真思考的问题。让我们一起想想看...',
    '嗯，你说得很有道理。我在想，也许我们可以从另一个角度来看待这个问题。',
    '谢谢你的分享。这让我想到了一个有趣的观点，想听听你的想法。',
    '我明白你的意思。其实每个人都会有这样的感受，这很正常。',
    '你说得很好。继续这个话题，我很想了解更多你的想法。',
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

export async function getLLMStatus() {
  const healthChecker = getHealthChecker()
  return {
    isDegraded: healthChecker.isUsingFallback(),
    status: healthChecker.getStatus(),
    model: healthChecker.isUsingFallback() ? 'ollama' : 'deepseek',
    modelName: healthChecker.isUsingFallback() ? LLM_CONFIG.OLLAMA_MODEL : LLM_CONFIG.DEEPSEEK_MODEL,
  }
}
import type { LLMProvider } from './llmProviders/index'
import type { LLMResponse, ChatMessage } from './llmConfig'
import { deepseekProvider } from './llmProviders/deepseek'
import { geminiProvider } from './llmProviders/gemini'
import { groqProvider } from './llmProviders/groq'
import { ollamaProvider } from './llmProviders/ollama'
import { classifyQuery } from './llmClassifier'

export interface RegistryOptions {
  preferredProvider?: string
  membershipType?: number
  userId?: number
  partnerName?: string
  partnerPersonality?: string
}

class LLMRegistry {
  private providers: Map<string, LLMProvider> = new Map()
  private healthCache: Map<string, { healthy: boolean; checkedAt: number }> = new Map()
  private readonly HEALTH_CACHE_TTL = 60000

  constructor() {
    this.register(deepseekProvider)
    this.register(geminiProvider)
    this.register(groqProvider)
    this.register(ollamaProvider)
  }

  register(provider: LLMProvider): void {
    this.providers.set(provider.id, provider)
  }

  getProvider(id: string): LLMProvider | undefined {
    return this.providers.get(id)
  }

  getAllProviders(): LLMProvider[] {
    return Array.from(this.providers.values())
  }

  getAvailableProviders(): LLMProvider[] {
    return this.getAllProviders().filter(p => p.isAvailable)
  }

  async checkProviderHealth(providerId: string): Promise<boolean> {
    const cached = this.healthCache.get(providerId)
    if (cached && Date.now() - cached.checkedAt < this.HEALTH_CACHE_TTL) {
      return cached.healthy
    }

    const provider = this.providers.get(providerId)
    if (!provider) return false

    const healthy = await provider.checkHealth()
    this.healthCache.set(providerId, { healthy, checkedAt: Date.now() })
    return healthy
  }

  async chat(
    messages: ChatMessage[],
    options?: RegistryOptions
  ): Promise<{ response: LLMResponse; usedProvider: string }> {
    const classification = classifyQuery(messages)

    const preferredId = options?.preferredProvider || classification.primaryProvider
    const providerOrder = [preferredId, ...classification.alternatives]

    const lastError: Error[] = []

    for (const providerId of providerOrder) {
      const provider = this.providers.get(providerId)
      if (!provider || !provider.isAvailable) continue

      const isHealthy = await this.checkProviderHealth(providerId)
      if (!isHealthy && providerId !== 'ollama') continue

      try {
        const response = await provider.chat(messages, {
          userId: options?.userId,
          membershipType: options?.membershipType,
          partnerName: options?.partnerName,
          partnerPersonality: options?.partnerPersonality,
        })

        const isPrimary = providerId === preferredId
        return {
          response: {
            ...response,
            isDegraded: !isPrimary,
          },
          usedProvider: providerId,
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        lastError.push(error)
        console.warn(`[LLM Registry] Provider ${providerId} failed:`, error.message)
        continue
      }
    }

    const ollamaProvider_ = this.providers.get('ollama')
    if (ollamaProvider_) {
      try {
        const response = await ollamaProvider_.chat(messages, {
          userId: options?.userId,
          partnerName: options?.partnerName,
          partnerPersonality: options?.partnerPersonality,
        })
        return {
          response: { ...response, isDegraded: true },
          usedProvider: 'ollama',
        }
      } catch (err) {
        lastError.push(err instanceof Error ? err : new Error(String(err)))
      }
    }

    return {
      response: {
        content: '抱歉，我暂时无法连接到AI服务，请稍后再试。',
        model: 'none',
        isDegraded: true,
        latency: 0,
      },
      usedProvider: 'none',
    }
  }

  async getStatus(): Promise<{
    isDegraded: boolean
    status: string
    model: string
    modelName: string
    providers: Array<{
      id: string
      name: string
      model: string
      healthy: boolean
      isFallback: boolean
    }>
  }> {
    const providerStatuses = await Promise.all(
      this.getAllProviders().map(async (p) => {
        const healthy = await this.checkProviderHealth(p.id)
        return {
          id: p.id,
          name: p.name,
          model: p.model,
          healthy,
          isFallback: p.id === 'ollama',
        }
      })
    )

    const activeProvider = providerStatuses.find(p => p.healthy && !p.isFallback)
    const degraded = !activeProvider

    return {
      isDegraded: degraded,
      status: degraded ? 'degraded' : 'healthy',
      model: activeProvider?.id || 'ollama',
      modelName: activeProvider?.model || 'ollama-fallback',
      providers: providerStatuses,
    }
  }
}

let instance: LLMRegistry | null = null

export function getRegistry(): LLMRegistry {
  if (!instance) {
    instance = new LLMRegistry()
  }
  return instance
}
import { getRegistry } from './llmRegistry'
import { getHealthChecker } from './llmHealthChecker'
import { classifyQuery } from './llmClassifier'
import type { ChatMessage } from './llmConfig'

export interface RouterOptions {
  userId: number
  membershipType: number
  partnerName: string
  partnerPersonality: string
}

export async function chatWithLLM(
  messages: ChatMessage[],
  options: RouterOptions
): Promise<{
  content: string
  model: string
  isDegraded: boolean
  latency: number
  usedProvider: string
  classification: { reason: string; priority: string }
}> {
  const registry = getRegistry()
  const startTime = Date.now()
  const classification = classifyQuery(messages)

  const { response, usedProvider } = await registry.chat(messages, {
    membershipType: options.membershipType,
    userId: options.userId,
    partnerName: options.partnerName,
    partnerPersonality: options.partnerPersonality,
  })

  return {
    ...response,
    usedProvider,
    classification: {
      reason: classification.reason,
      priority: classification.priority,
    },
  }
}

export async function getLLMStatus() {
  const registry = getRegistry()
  const healthChecker = getHealthChecker()
  const status = await registry.getStatus()

  return {
    ...status,
    healthCheckStatus: healthChecker.getStatus(),
  }
}

export { classifyQuery }
import type { ChatMessage, LLMResponse } from '../llmConfig'

export interface ProviderOptions {
  userId?: number
  membershipType?: number
  partnerName?: string
  partnerPersonality?: string
}

export interface LLMProvider {
  id: string
  name: string
  model: string
  description: string
  isAvailable: boolean
  strengths: string[]
  chat(messages: ChatMessage[], options?: ProviderOptions): Promise<LLMResponse>
  checkHealth(): Promise<boolean>
}

export interface ProviderResult {
  provider: string
  model: string
  content: string
  latency: number
  isDegraded: boolean
  error?: string
}

export type { ChatMessage, LLMResponse }
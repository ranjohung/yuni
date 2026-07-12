import { LLM_CONFIG } from './llmConfig'

type HealthStatus = 'healthy' | 'degraded' | 'checking'
type HealthListener = (status: HealthStatus) => void

class LlmHealthChecker {
  private failCount = 0
  private isDegraded = false
  private isChecking = false
  private checkIntervalId: ReturnType<typeof setInterval> | null = null
  private listeners: HealthListener[] = []

  constructor() {
    this.startHealthCheck()
  }

  private async pingDeepSeek(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(LLM_CONFIG.DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: LLM_CONFIG.DEEPSEEK_MODEL,
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
  }

  async checkHealth(): Promise<void> {
    if (this.isChecking) return
    this.isChecking = true

    try {
      const isHealthy = await this.pingDeepSeek()

      if (isHealthy) {
        this.failCount = 0
        if (this.isDegraded) {
          this.isDegraded = false
          this.notifyListeners('healthy')
          console.log('[LLM Health] DeepSeek API recovered, switching back to primary model')
        }
      } else {
        this.failCount++
        console.log(`[LLM Health] DeepSeek API ping failed (${this.failCount}/${LLM_CONFIG.DEEPSEEK_API_FAIL_THRESHOLD})`)

        if (this.failCount >= LLM_CONFIG.DEEPSEEK_API_FAIL_THRESHOLD && !this.isDegraded) {
          this.isDegraded = true
          this.notifyListeners('degraded')
          console.log('[LLM Health] DeepSeek API degraded, switching to Ollama fallback')
        }
      }
    } catch (err) {
      console.error('[LLM Health] Health check error:', err)
    } finally {
      this.isChecking = false
    }
  }

  private startHealthCheck(): void {
    this.checkHealth()
    this.checkIntervalId = setInterval(
      () => this.checkHealth(),
      LLM_CONFIG.DEEPSEEK_API_HEALTH_CHECK_INTERVAL
    )
  }

  stopHealthCheck(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId)
      this.checkIntervalId = null
    }
  }

  getStatus(): HealthStatus {
    if (this.isChecking) return 'checking'
    return this.isDegraded ? 'degraded' : 'healthy'
  }

  isUsingFallback(): boolean {
    return this.isDegraded
  }

  subscribe(listener: HealthListener): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(status: HealthStatus): void {
    this.listeners.forEach(listener => listener(status))
  }

  async forceRecovery(): Promise<boolean> {
    const isHealthy = await this.pingDeepSeek()
    if (isHealthy) {
      this.failCount = 0
      this.isDegraded = false
      this.notifyListeners('healthy')
      return true
    }
    return false
  }
}

let instance: LlmHealthChecker | null = null

export function getHealthChecker(): LlmHealthChecker {
  if (!instance) {
    instance = new LlmHealthChecker()
  }
  return instance
}

export type { HealthStatus }
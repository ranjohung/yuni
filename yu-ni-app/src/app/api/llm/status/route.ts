import { getLLMStatus } from '@/lib/llmRouter'

export async function GET() {
  try {
    const status = await getLLMStatus()
    return new Response(JSON.stringify({
      success: true,
      ...status,
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      isDegraded: true,
      status: 'unknown',
      model: 'ollama',
      modelName: 'fallback',
    }), { status: 200 })
  }
}

export async function POST() {
  const { getHealthChecker } = await import('@/lib/llmHealthChecker')
  const healthChecker = getHealthChecker()
  const recovered = await healthChecker.forceRecovery()
  const status = await getLLMStatus()

  return new Response(JSON.stringify({
    success: recovered,
    message: recovered ? '已恢复DeepSeek连接' : '恢复失败，请稍后重试',
    ...status,
  }), { status: 200 })
}
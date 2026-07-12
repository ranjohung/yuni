import { getLLMStatus } from '@/lib/llmRouter'

export async function GET() {
  try {
    const status = await getLLMStatus()
    return new Response(JSON.stringify({
      success: true,
      isDegraded: status.isDegraded,
      status: status.status,
      model: status.model,
      modelName: status.modelName,
      providers: status.providers,
      healthCheckStatus: status.healthCheckStatus,
      timestamp: new Date().toISOString(),
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      isDegraded: true,
      status: 'unknown',
      model: 'none',
      modelName: '未知',
      providers: [],
      healthCheckStatus: 'unknown',
      timestamp: new Date().toISOString(),
    }), { status: 200 })
  }
}
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Brain, Activity, Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, ArrowLeft, Clock, Cpu, Server, Wifi, Zap } from 'lucide-react'

interface ProviderStatus {
  id: string
  name: string
  model: string
  healthy: boolean
  isFallback: boolean
  hasApiKey: boolean
}

interface LLMStatus {
  success: boolean
  isDegraded: boolean
  status: string
  model: string
  modelName: string
  providers: ProviderStatus[]
  healthCheckStatus: string
  timestamp: string
}

const PROVIDER_ICONS: Record<string, string> = {
  deepseek: '🧠',
  gemini: '🔮',
  groq: '⚡',
  ollama: '🖥️',
}

const PROVIDER_COLORS: Record<string, string> = {
  deepseek: 'from-blue-500 to-blue-600',
  gemini: 'from-purple-500 to-pink-500',
  groq: 'from-green-500 to-teal-500',
  ollama: 'from-orange-500 to-amber-500',
}

export default function LLMStatusPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [llmStatus, setLlmStatus] = useState<LLMStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (authStatus === 'authenticated') {
      fetchStatus()
    }
  }, [authStatus, router])

  const fetchStatus = async () => {
    try {
      setError('')
      const res = await fetch('/api/llm/status')
      const data = await res.json()
      setLlmStatus(data)
    } catch (err) {
      setError('获取LLM状态失败')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStatus()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'degraded': return 'text-yellow-500'
      case 'unconfigured': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return '运行正常'
      case 'degraded': return '降级运行'
      case 'unconfigured': return '未配置API'
      default: return '未知状态'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'unconfigured': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />
    }
  }

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">正在检测AI服务状态...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar currentPage="llm-status" />

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* 顶部标题 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            <h1 className="text-xl font-bold text-gray-800">AI模型状态</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-auto w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 全局状态卡片 */}
        {llmStatus && (
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">系统状态</span>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                llmStatus.status === 'healthy'
                  ? 'bg-green-50 text-green-600'
                  : llmStatus.status === 'degraded'
                  ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-red-50 text-red-600'
              }`}>
                {getStatusText(llmStatus.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">当前模型</span>
                </div>
                <p className="text-lg font-bold text-gray-800">{llmStatus.modelName}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Server className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">运行模式</span>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {llmStatus.isDegraded ? '降级模式' : '正常模式'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">最后检测：</span>
              <span className="text-xs text-gray-600">
                {llmStatus.timestamp ? new Date(llmStatus.timestamp).toLocaleString('zh-CN') : '未知'}
              </span>
            </div>
          </div>
        )}

        {/* Provider列表 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-gray-800">AI服务提供商</h2>
          </div>

          <div className="space-y-3">
            {llmStatus?.providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${PROVIDER_COLORS[provider.id] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white font-bold text-lg`}>
                      {PROVIDER_ICONS[provider.id] || '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{provider.name}</h3>
                      <p className="text-xs text-gray-500">模型: {provider.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.healthy ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        正常
                      </span>
                    ) : provider.hasApiKey ? (
                      <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        不可用
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                        <XCircle className="w-3 h-3" />
                        未配置
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="w-3.5 h-3.5" />
                    <span>API Key: {provider.hasApiKey ? '已配置' : '未配置'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{provider.isFallback ? '备用服务' : '主服务'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 提示信息 */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">关于AI路由</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                系统会根据你的对话内容自动选择最优的AI模型。如果主模型不可用，会自动降级到备用模型。
                配置多个API Key可以提高服务的可用性和响应速度。
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">情感支持 → Gemini</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">学习训练 → DeepSeek</span>
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">简短对话 → Groq</span>
                <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">离线备用 → Ollama</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import {
  Heart, Sun, Moon, Coffee, MessageCircle, Sparkles, ArrowLeft,
  Bell, Clock, Smile, CloudSun, Sunrise, Sunset, Star, RefreshCw,
} from 'lucide-react'

interface CareMessage {
  id: string
  trigger: string
  message: string
  icon: string
  timeRange: string
}

interface Rule {
  id: number
  name: string
  description: string
  priority: number
}

interface CareData {
  partner: { name: string; avatar: string } | null
  affection: { score: number; level: number }
  cares: CareMessage[]
  rules: Rule[]
  stats: {
    todayTraining: number
    hasCheckedIn: boolean
    currentMood: string | null
  }
}

const TRIGGER_COLORS: Record<string, { bg: string; border: string; badge: string; label: string }> = {
  morning: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', label: '早晨' },
  afternoon: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', label: '下午' },
  evening: { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', label: '傍晚' },
  night: { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', label: '深夜' },
  training_encourage: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', label: '训练鼓励' },
  sad_comfort: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', label: '心情安慰' },
  happy_celebrate: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', label: '快乐庆祝' },
  streak_reminder: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', label: '签到提醒' },
}

const TRIGGER_ICONS: Record<string, typeof Sun> = {
  morning: Sunrise,
  afternoon: Coffee,
  evening: Sunset,
  night: Moon,
  training_encourage: Sparkles,
  sad_comfort: CloudSun,
  happy_celebrate: Star,
  streak_reminder: Bell,
}

function getTriggerConfig(trigger: string) {
  const baseKey = Object.keys(TRIGGER_COLORS).find(k => trigger.startsWith(k)) || 'morning'
  return TRIGGER_COLORS[baseKey] || TRIGGER_COLORS.morning
}

function getTriggerIcon(trigger: string) {
  const baseKey = Object.keys(TRIGGER_ICONS).find(k => trigger.startsWith(k)) || 'morning'
  return TRIGGER_ICONS[baseKey] || Sunrise
}

const AFFECTION_LEVEL_NAMES = ['', '初识', '熟悉', '亲密', '默契', '灵魂伴侣']

export default function CarePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<CareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchCareData()
    }
  }, [session, status, router])

  const fetchCareData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/care')
      const result = await response.json()
      if (result.success) {
        setData(result)
      }
    } catch (error) {
      console.error('获取关怀数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (care: CareMessage) => {
    setSendingId(care.id)
    setSuccessMessage(null)
    try {
      const response = await fetch('/api/care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: care.trigger }),
      })
      const result = await response.json()
      if (result.success) {
        setSuccessMessage(`已向 ${result.care.partnerName} 发送关怀消息`)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (error) {
      console.error('发送关怀消息失败:', error)
    } finally {
      setSendingId(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const affectionLevel = AFFECTION_LEVEL_NAMES[data?.affection?.level ?? 1] || '初识'

  const moodLabels: Record<string, string> = {
    happy: '开心',
    excited: '兴奋',
    calm: '平静',
    sad: '难过',
    anxious: '焦虑',
    angry: '生气',
    neutral: '一般',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar currentPage="care" />

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* 顶部：返回按钮 + 标题 + 伴侣信息 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">主动关怀</h1>
          {data?.partner ? (
            <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm">
              <span className="text-lg">{data.partner.avatar}</span>
              <span className="text-sm font-medium text-gray-700">{data.partner.name}</span>
            </div>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>

        {/* 成功提示 */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium text-center animate-pulse">
            {successMessage}
          </div>
        )}

        {/* 伴侣状态卡片 */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-5 text-white shadow-lg mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-300" />
              <span className="text-sm text-white/80">好感度</span>
            </div>
            <button
              onClick={fetchCareData}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{data?.affection?.score ?? 0}</p>
              <p className="text-sm text-white/80 mt-1">等级：{affectionLevel}</p>
            </div>
            <div className="bg-white/20 rounded-full px-4 py-1.5 text-sm">
              Lv.{data?.affection?.level ?? 1}
            </div>
          </div>
        </div>

        {/* 今日概况 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-gray-800 text-sm">今日概况</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-indigo-600">{data?.stats?.todayTraining ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">训练次数</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-indigo-600">
                {data?.stats?.hasCheckedIn ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">今日签到</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                {data?.stats?.currentMood ? (
                  <>
                    <Smile className="w-4 h-4 text-indigo-500" />
                    <p className="text-sm font-bold text-indigo-600">
                      {moodLabels[data.stats.currentMood] || data.stats.currentMood}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">未记录</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">当前心情</p>
            </div>
          </div>
        </div>

        {/* 关怀消息列表 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-purple-500" />
            <h3 className="font-bold text-gray-800 text-sm">可发送的关怀消息</h3>
            <span className="text-xs text-gray-400 ml-auto">{data?.cares?.length ?? 0} 条</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {data?.cares?.map((care) => {
              const config = getTriggerConfig(care.trigger)
              const Icon = getTriggerIcon(care.trigger)
              const isSending = sendingId === care.id
              return (
                <div
                  key={care.id}
                  className={`${config.bg} ${config.border} border rounded-xl p-3 flex flex-col transition-all hover:shadow-md`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className={`w-4 h-4 ${config.badge.replace('bg-', 'text-').replace('text-', 'text-').split(' ')[1] || 'text-orange-500'}`} />
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${config.badge}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 flex-1 leading-relaxed">{care.icon} {care.message}</p>
                  <button
                    onClick={() => handleSend(care)}
                    disabled={isSending}
                    className={`mt-2 w-full py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                      isSending
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    {isSending ? (
                      <>
                        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        发送中...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-3 h-3" />
                        发送关怀
                      </>
                    )}
                  </button>
                </div>
              )
            })}
            {(!data?.cares || data.cares.length === 0) && (
              <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
                当前暂无适合发送的关怀消息
              </div>
            )}
          </div>
        </div>

        {/* 陪伴模式规则说明 */}
        {data?.rules && data.rules.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-gray-800 text-sm">陪伴模式规则说明</h3>
            </div>
            <div className="space-y-2">
              {data.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-xl"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${
                    rule.priority <= 2 ? 'bg-indigo-500' : rule.priority <= 4 ? 'bg-purple-500' : 'bg-gray-400'
                  }`}>
                    {rule.priority}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{rule.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
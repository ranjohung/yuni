'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { AFFECTION_LEVELS } from '@/lib/types'
import {
  Heart, Gift, Star, Target, Calendar, Clock, ArrowLeft,
  Sparkles, Trophy, BookOpen, Zap, Smile, Award, Flame, Diamond, Crown,
} from 'lucide-react'

interface TimelineItem {
  id: string
  type: 'milestone' | 'gift' | 'training' | 'checkin' | 'diary'
  title: string
  description: string
  icon: string
  date: string
  metadata?: Record<string, unknown>
}

interface StatsData {
  totalMilestones: number
  totalGifts: number
  totalTraining: number
  totalDays: number
  maxStreak: number
  currentAffection: number
  affectionLevel: number
}

interface PartnerInfo {
  name: string
  avatar: string
}

const TYPE_CONFIG: Record<string, { color: string; bg: string; dot: string; border: string }> = {
  milestone: { color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-400', border: 'border-amber-200' },
  gift: { color: 'text-pink-600', bg: 'bg-pink-50', dot: 'bg-pink-400', border: 'border-pink-200' },
  training: { color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-400', border: 'border-blue-200' },
  checkin: { color: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-400', border: 'border-purple-200' },
  diary: { color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-400', border: 'border-green-200' },
}

const TYPE_ICONS: Record<string, string> = {
  milestone: '⭐',
  gift: '💝',
  training: '🎯',
  checkin: '⭐',
  diary: '📝',
}

function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return `${Math.floor(days / 365)}年前`
}

function getMonthKey(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const now = new Date()
  if (year === now.getFullYear() && month === now.getMonth() + 1) return '本月'
  if (year === now.getFullYear()) return `${month}月`
  return `${year}年${month}月`
}

function getLevelName(level: number): string {
  const found = AFFECTION_LEVELS.find((l) => l.level === level)
  return found?.name || '初识'
}

function getLevelProgress(score: number, level: number): number {
  const current = AFFECTION_LEVELS.find((l) => l.level === level)
  if (!current) return 0
  const range = current.maxScore - current.minScore
  if (range <= 0 || range === Infinity) return 100
  const progress = ((score - current.minScore) / range) * 100
  return Math.min(Math.max(progress, 0), 100)
}

function getLevelColor(level: number): string {
  const colors = ['', 'from-slate-400 to-slate-300', 'from-blue-400 to-blue-300', 'from-purple-400 to-purple-300', 'from-pink-400 to-pink-300', 'from-amber-400 to-yellow-300']
  return colors[level] || colors[1]
}

export default function MemoriesPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [stats, setStats] = useState<StatsData | null>(null)
  const [partner, setPartner] = useState<PartnerInfo | null>(null)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (authStatus === 'authenticated') {
      fetchMemories()
    }
  }, [authStatus, router])

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/memories')
      const data = await res.json()
      if (data.success) {
        setTimeline(data.timeline || [])
        setStats(data.stats || null)
        if (data.timeline?.length > 0) {
          const first = data.timeline[0]
          if (first.metadata?.partnerName) {
            const partnerMeta = first.metadata as Record<string, unknown>
            setPartner({
              name: (partnerMeta.partnerName as string) || '我的伴侣',
              avatar: (partnerMeta.partnerAvatar as string) || '',
            })
          }
        }
      }
    } catch (err) {
      console.error('获取回忆录失败:', err)
    } finally {
      setLoading(false)
    }
  }

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 按月份分组
  const groupedTimeline: Record<string, TimelineItem[]> = {}
  timeline.forEach((item) => {
    const key = getMonthKey(item.date)
    if (!groupedTimeline[key]) groupedTimeline[key] = []
    groupedTimeline[key].push(item)
  })
  const sortedMonths = Object.keys(groupedTimeline).sort((a, b) => b.localeCompare(a))

  // 统计卡片配置
  const statCards = [
    { label: '里程碑', value: stats?.totalMilestones ?? 0, icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: '送礼数', value: stats?.totalGifts ?? 0, icon: Gift, color: 'text-pink-500', bg: 'bg-pink-50' },
    { label: '训练数', value: stats?.totalTraining ?? 0, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '签到天数', value: stats?.totalDays ?? 0, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: '最高连续', value: stats?.maxStreak ?? 0, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  // 好感度等级
  const affectionLevel = stats?.affectionLevel ?? 1
  const affectionScore = stats?.currentAffection ?? 0
  const levelName = getLevelName(affectionLevel)
  const progress = getLevelProgress(affectionScore, affectionLevel)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar currentPage="memories" />

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* 顶部 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">关系回忆录</h1>
            <p className="text-sm text-gray-500">记录你们之间的点点滴滴</p>
          </div>
          {partner && (
            <div className="flex items-center gap-2 bg-white rounded-full pl-3 pr-4 py-1.5 shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {partner.avatar || partner.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700">{partner.name}</span>
            </div>
          )}
        </div>

        {/* 好感度概览卡片 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getLevelColor(affectionLevel)} flex items-center justify-center`}>
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">当前好感度</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-800">{levelName}</h2>
                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-medium">
                    Lv.{affectionLevel}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {affectionScore}
              </p>
              <p className="text-xs text-gray-400">好感度分</p>
            </div>
          </div>
          {/* 进度条 */}
          <div className="relative">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              {AFFECTION_LEVELS.filter((l) => l.maxScore !== Infinity).map((l) => (
                <span key={l.level} className="text-[10px] text-gray-400">{l.name}</span>
              ))}
              <span className="text-[10px] text-amber-500 font-medium">灵魂伴侣</span>
            </div>
          </div>
        </div>

        {/* 统计卡片行 */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="bg-white rounded-2xl shadow-sm p-3 text-center">
                <div className={`w-8 h-8 ${card.bg} rounded-full flex items-center justify-center mx-auto mb-1.5`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className="text-lg font-bold text-gray-800">{card.value}</p>
                <p className="text-[10px] text-gray-500">{card.label}</p>
              </div>
            )
          })}
        </div>

        {/* 时间线 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <h3 className="font-bold text-gray-800">回忆时间线</h3>
          </div>

          {timeline.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-purple-400" />
              </div>
              <p className="text-gray-500 font-medium text-lg">还没有回忆记录</p>
              <p className="text-gray-400 text-sm mt-1">开始你们的互动，记录每一个美好瞬间</p>
              <div className="flex flex-col gap-2 mt-6">
                <button
                  onClick={() => router.push('/training')}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  去训练
                </button>
                <button
                  onClick={() => router.push('/gifts')}
                  className="px-6 py-2.5 bg-white text-gray-600 rounded-xl text-sm font-medium border border-gray-200 hover:border-purple-300 transition-all"
                >
                  送个礼物
                </button>
              </div>
            </div>
          ) : (
            sortedMonths.map((monthKey) => (
              <div key={monthKey}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent" />
                  <span className="text-xs font-bold text-purple-500 bg-purple-50 px-3 py-1 rounded-full">
                    {getMonthLabel(groupedTimeline[monthKey][0].date)}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-pink-200 to-transparent" />
                </div>
                <div className="relative">
                  {/* 时间线竖线 */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-pink-200 to-purple-200" />
                  <div className="space-y-4">
                    {groupedTimeline[monthKey].map((item, index) => {
                      const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.milestone
                      return (
                        <div key={item.id} className="relative pl-12">
                          {/* 时间线圆点 */}
                          <div className={`absolute left-4 top-5 w-3 h-3 rounded-full ${config.dot} ring-4 ring-white shadow-sm`} />
                          {/* 卡片 */}
                          <div className={`bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all border-l-4 ${config.border}`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center text-lg shrink-0`}>
                                {item.icon || TYPE_ICONS[item.type] || '📌'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-800">{item.title}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {getRelativeTime(item.date)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
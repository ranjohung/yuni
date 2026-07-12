'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Heart, Calendar, MessageCircle, TrendingUp, Sparkles, Gift, ArrowRight, Clock, Users, Moon, Star, Flame, Award, Zap, Target } from 'lucide-react'
import { AFFECTION_LEVELS } from '@/lib/types'
import { Radar } from 'react-chartjs-2'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

interface AbilityStats {
  empathy: number
  expression: number
  listening: number
  confidence: number
  strategy: number
}

interface WeeklyProgress {
  usedSimulations: number
  totalSimulations: number
  percentage: number
}

interface GoodnightPlan {
  hasPlan: boolean
  planTitle: string
  planContent: string
  partnerMood: string
}

interface HomeData {
  affection: { score: number; level: number } | null
  partner: { name: string; avatar: string } | null
  todayCheckIn: boolean
  chatSession: { lastMessage: string } | null
  trainingRecords: Array<{
    id: number
    sceneName: string
    status: number
    scores: string
    createdAt: string
  }>
  abilityStats: AbilityStats
  weeklyProgress: WeeklyProgress
  goodnightPlan: GoodnightPlan | null
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<HomeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status !== 'authenticated') {
      return
    }

    const fetchData = async () => {
      try {
        const response = await fetch('/api/user/home-data')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch home data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, status, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const affectionLevel = AFFECTION_LEVELS.find(
    (level) => data?.affection?.score && data.affection.score >= level.minScore && data.affection.score <= level.maxScore
  ) || AFFECTION_LEVELS[0]

  const progress = data?.affection?.score ? ((data.affection.score % 100) / 100) * 100 : 0

  const abilityData = {
    labels: ['同理心', '表达', '倾听', '自信', '策略'],
    datasets: [
      {
        label: '能力值',
        data: [
          data?.abilityStats?.empathy || 0,
          data?.abilityStats?.expression || 0,
          data?.abilityStats?.listening || 0,
          data?.abilityStats?.confidence || 0,
          data?.abilityStats?.strategy || 0,
        ],
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(139, 92, 246, 1)',
      },
    ],
  }

  const abilityOptions = {
    scales: {
      r: {
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: 12,
          },
          color: '#666',
        },
        ticks: {
          display: false,
          stepSize: 20,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `: ${context.raw}分`
          },
        },
      },
    },
    maintainAspectRatio: false,
  }

  const abilityAverage = data?.abilityStats
    ? Math.round(
        (data.abilityStats.empathy +
          data.abilityStats.expression +
          data.abilityStats.listening +
          data.abilityStats.confidence +
          data.abilityStats.strategy) /
          5
      )
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar currentPage="home" />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              {data?.partner?.avatar ? (
                <span className="text-3xl">{data.partner.avatar}</span>
              ) : (
                <span className="text-3xl">💝</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{data?.partner?.name || '你的伴侣'}</h2>
              <p className="text-white/80 text-sm">好感度等级：{affectionLevel.name}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>好感度</span>
              <span>{data?.affection?.score || 0}</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push('/chat')}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
            >
              <Heart className="w-5 h-5" />
              <span>互动</span>
            </button>
            <button
              onClick={() => router.push('/gifts')}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
            >
              <Gift className="w-5 h-5" />
              <span>送礼物</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">社交能力雷达</h3>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <span className="text-sm text-primary-600 font-medium">{abilityAverage}分</span>
            </div>
          </div>
          <div className="h-48">
            <Radar data={abilityData} options={abilityOptions} />
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-500">同理心</p>
              <p className="text-sm font-bold text-primary-600">{data?.abilityStats?.empathy || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">表达</p>
              <p className="text-sm font-bold text-blue-600">{data?.abilityStats?.expression || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">倾听</p>
              <p className="text-sm font-bold text-green-600">{data?.abilityStats?.listening || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">自信</p>
              <p className="text-sm font-bold text-orange-600">{data?.abilityStats?.confidence || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">策略</p>
              <p className="text-sm font-bold text-secondary-600">{data?.abilityStats?.strategy || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-5 w-5" />
              <span className="text-white/80 text-sm">变美联动</span>
            </div>
            <h3 className="text-xl font-bold mb-2">社交能力提升，魅力值+10%</h3>
            <p className="text-white/80 text-sm mb-4">
              你的社交能力达到 {abilityAverage} 分，魅力值同步提升！自信的你最闪耀 ✨
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">魅力值：{Math.round(abilityAverage * 0.8)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                <span className="text-sm">自信度：{data?.abilityStats?.confidence || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h3 className="font-bold text-gray-800">本周训练进度</h3>
            </div>
            <span className="text-sm text-gray-500">
              {data?.weeklyProgress?.usedSimulations || 0}/{data?.weeklyProgress?.totalSimulations || 7} 天
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${data?.weeklyProgress?.percentage || 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>已完成 {data?.weeklyProgress?.percentage || 0}%</span>
            <span>
              {(data?.weeklyProgress?.percentage || 0) >= 100 ? (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  本周目标达成！
                </span>
              ) : (
                <span>还剩 {(data?.weeklyProgress?.totalSimulations || 7) - (data?.weeklyProgress?.usedSimulations || 0)} 天</span>
              )}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary-500" />
              <h3 className="font-bold text-gray-800">最近训练</h3>
            </div>
            <button
              onClick={() => router.push('/training')}
              className="text-primary-500 text-sm flex items-center gap-1"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {data?.trainingRecords && data.trainingRecords.length > 0 ? (
              data.trainingRecords.map((record) => {
                const score = parseInt(record.scores) || 0
                return (
                  <div
                    key={record.id}
                    className="flex-shrink-0 w-40 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => router.push('/training')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400">
                        {new Date(record.createdAt).toLocaleDateString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          score >= 80
                            ? 'bg-green-100 text-green-600'
                            : score >= 60
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {score || '-'}
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-800 text-sm mb-2 truncate">
                      {record.sceneName}
                    </h4>
                    <div className="flex items-center justify-center gap-1 text-xs text-primary-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>{record.status === 1 ? '已完成' : '进行中'}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex-shrink-0 w-full bg-white rounded-xl p-8 text-center shadow-sm">
                <Target className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">还没有训练记录</p>
                <button
                  onClick={() => router.push('/training')}
                  className="mt-3 inline-flex items-center gap-1 text-primary-600 text-sm"
                >
                  开始第一次训练
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {data?.goodnightPlan && data.goodnightPlan.hasPlan && (
          <div className="bg-gradient-to-br from-indigo-900 via-primary-900 to-secondary-800 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="h-5 w-5" />
              <h3 className="text-lg font-bold">晚安计划</h3>
              <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">
                {data.goodnightPlan.partnerMood}
              </span>
            </div>
            <h4 className="text-xl font-bold mb-3">{data.goodnightPlan.planTitle}</h4>
            <p className="text-white/80 mb-6">{data.goodnightPlan.planContent}</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/chat')}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                聊聊心事
              </button>
              <button
                onClick={() => router.push('/growth')}
                className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                睡前放松
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/checkin')}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                data?.todayCheckIn
                  ? 'bg-green-100 text-green-500'
                  : 'bg-primary-100 text-primary-500'
              }`}
            >
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-gray-800 font-medium">
              {data?.todayCheckIn ? '已签到' : '签到'}
            </span>
            <span className="text-gray-500 text-xs">
              连续 {data?.affection?.level || 1} 天
            </span>
          </button>

          <button
            onClick={() => router.push('/chat')}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-secondary-100 text-secondary-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-gray-800 font-medium">聊天</span>
            <span className="text-gray-500 text-xs">
              {data?.chatSession?.lastMessage || '暂无消息'}
            </span>
          </button>

          <button
            onClick={() => router.push('/training')}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-gray-800 font-medium">训练</span>
            <span className="text-gray-500 text-xs">
              本周 {data?.trainingRecords?.length || 0} 次
            </span>
          </button>

          <button
            onClick={() => router.push('/growth')}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-gray-800 font-medium">成长</span>
            <span className="text-gray-500 text-xs">查看报告</span>
          </button>
        </div>

        <div className="bg-gradient-to-r from-primary-100 to-secondary-100 rounded-2xl p-5">
          <h3 className="font-bold text-gray-800 mb-3">今日小贴士</h3>
          <p className="text-gray-600 text-sm">
            倾听是沟通的基础。试着在对话中多听少说，理解对方的感受比表达自己更重要。
          </p>
          <button
            onClick={() => router.push('/growth')}
            className="mt-4 flex items-center gap-2 text-primary-500 text-sm font-medium"
          >
            <span>💡</span>
            <span>学习更多沟通技巧</span>
          </button>
        </div>
      </div>
    </div>
  )
}
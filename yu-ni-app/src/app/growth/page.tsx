'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { TrendingUp, BookOpen, Brain, Heart, Award, ArrowRight, Target, Calendar, Zap, Star, CheckCircle, Clock, BarChart3, Moon } from 'lucide-react'

interface AbilityStats {
  communication: number
  empathy: number
  confidence: number
  listening: number
  expression: number
  adaptability: number
}

interface Milestone {
  id: number
  name: string
  icon: string
  description: string
  unlocked: boolean
  unlockedAt?: string
  target: string
}

interface Course {
  id: number
  title: string
  description: string
  icon: string
  duration: string
  progress: number
  level: string
}

const MOCK_ABILITY_STATS: AbilityStats = {
  communication: 75,
  empathy: 82,
  confidence: 68,
  listening: 78,
  expression: 72,
  adaptability: 65,
}

const MOCK_MILESTONES: Milestone[] = [
  { id: 1, name: '初次训练', icon: '🌟', description: '完成第一次社交训练', unlocked: true, unlockedAt: '7月4日', target: '完成1次训练' },
  { id: 2, name: '坚持不懈', icon: '🔥', description: '连续训练7天', unlocked: true, unlockedAt: '7月10日', target: '连续7天训练' },
  { id: 3, name: '社交达人', icon: '👑', description: '累计训练30次', unlocked: false, target: '完成30次训练' },
  { id: 4, name: '完美表现', icon: '💎', description: '获得一次满分', unlocked: false, target: '训练得100分' },
  { id: 5, name: '全能选手', icon: '🏆', description: '完成所有场景训练', unlocked: false, target: '完成所有场景' },
  { id: 6, name: '沟通大师', icon: '🎖️', description: '所有能力值达到80', unlocked: false, target: '能力值均达80' },
]

const MOCK_COURSES: Course[] = [
  { id: 1, title: '破冰技巧入门', description: '学习如何开启一段对话', icon: '☕', duration: '20分钟', progress: 100, level: '已完成' },
  { id: 2, title: '非暴力沟通基础', description: '观察、感受、需要、请求', icon: '❤️', duration: '35分钟', progress: 60, level: '学习中' },
  { id: 3, title: '自信表达训练', description: '提升公众演讲能力', icon: '🎤', duration: '40分钟', progress: 0, level: '未开始' },
  { id: 4, title: '情绪管理技巧', description: '学会控制和调节情绪', icon: '🧘', duration: '30分钟', progress: 0, level: '未开始' },
]

interface TrainingStats {
  totalTraining: number
  completionRate: number
  avgScore: number
  streak: number
}

export default function GrowthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trainingStats, setTrainingStats] = useState<TrainingStats>({
    totalTraining: 0,
    completionRate: 0,
    avgScore: 0,
    streak: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      const fetchData = async () => {
        try {
          setTrainingStats({
            totalTraining: 15,
            completionRate: 60,
            avgScore: 75,
            streak: 7,
          })
        } catch (error) {
          console.error('Failed to fetch growth data:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    }
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const abilityLabels = ['沟通', '共情', '自信', '倾听', '表达', '应变']
  const abilityValues = [
    MOCK_ABILITY_STATS.communication,
    MOCK_ABILITY_STATS.empathy,
    MOCK_ABILITY_STATS.confidence,
    MOCK_ABILITY_STATS.listening,
    MOCK_ABILITY_STATS.expression,
    MOCK_ABILITY_STATS.adaptability,
  ]

  const maxValue = Math.max(...abilityValues)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar currentPage="growth" />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">成长报告</h2>
              <p className="text-white/80 text-sm">追踪你的进步轨迹</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" />
                <span className="text-sm">累计训练</span>
              </div>
              <p className="text-2xl font-bold">{trainingStats.totalTraining}次</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4" />
                <span className="text-sm">平均得分</span>
              </div>
              <p className="text-2xl font-bold">{trainingStats.avgScore}分</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">完成率</span>
              </div>
              <p className="text-2xl font-bold">{trainingStats.completionRate}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">连续训练</span>
              </div>
              <p className="text-2xl font-bold">{trainingStats.streak}天</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">能力雷达</h3>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              综合评分 {Math.round(abilityValues.reduce((a, b) => a + b, 0) / abilityValues.length)}
            </span>
          </div>
          <div className="flex items-center justify-around">
            {abilityValues.map((value, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                    <circle
                      cx="24" cy="24" r="20"
                      stroke={value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8" fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(value / 100) * 126} 126`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                    {value}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{abilityLabels[index]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">成长里程碑</h3>
            <span className="text-xs text-primary-500 flex items-center gap-1">
              查看全部
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {MOCK_MILESTONES.map((milestone) => (
              <div
                key={milestone.id}
                className={`rounded-xl p-3 text-center ${
                  milestone.unlocked ? 'bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200' : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className={`text-2xl mb-2 ${!milestone.unlocked ? 'grayscale' : ''}`}>
                  {milestone.icon}
                </div>
                <p className="font-medium text-gray-800 text-xs">{milestone.name}</p>
                {milestone.unlocked && (
                  <p className="text-xs text-green-500 mt-1">{milestone.unlockedAt}</p>
                )}
                {!milestone.unlocked && (
                  <p className="text-xs text-gray-400 mt-1">{milestone.target}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">学习课程</h3>
            <span className="text-xs text-primary-500 flex items-center gap-1">
              更多课程
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
          <div className="space-y-3">
            {MOCK_COURSES.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                  course.progress === 100 ? 'bg-green-100 text-green-500' : course.progress > 0 ? 'bg-primary-100 text-primary-500' : 'bg-gray-200 text-gray-400'
                }`}>
                  {course.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{course.title}</h4>
                  <p className="text-gray-500 text-sm">{course.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      course.progress === 100 ? 'bg-green-100 text-green-600' : course.progress > 0 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                </div>
                {course.progress > 0 && course.progress < 100 && (
                  <div className="w-20">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">{course.progress}%</p>
                  </div>
                )}
                {course.progress === 100 && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/cbt')}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 text-left"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <span className="font-medium text-gray-800">CBT思维记录</span>
            <span className="text-gray-500 text-sm">记录思维模式</span>
            <ArrowRight className="w-4 h-4 text-gray-400 self-end" />
          </button>

          <button
            onClick={() => router.push('/nvc')}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 text-left"
          >
            <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <span className="font-medium text-gray-800">NVC沟通训练</span>
            <span className="text-gray-500 text-sm">非暴力沟通</span>
            <ArrowRight className="w-4 h-4 text-gray-400 self-end" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">📌 留存工具</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => router.push('/nightly')}
              className="p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors text-center"
            >
              <div className="w-10 h-10 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Moon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-700">晚安计划</span>
            </button>
            <button
              onClick={() => router.push('/diary')}
              className="p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors text-center"
            >
              <div className="w-10 h-10 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-700">情绪日记</span>
            </button>
            <button
              onClick={() => router.push('/report')}
              className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center"
            >
              <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-700">每周报告</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary-100 to-secondary-100 rounded-2xl p-5">
          <h3 className="font-bold text-gray-800 mb-3">💡 成长小贴士</h3>
          <p className="text-gray-600 text-sm">
            每天坚持训练10分钟，你的社交能力会稳步提升。完成课程和训练可以获得积分奖励，解锁更多高级功能！
          </p>
        </div>
      </div>
    </div>
  )
}

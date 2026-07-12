'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import { User, Settings, HelpCircle, Share2, Heart, Star, Coins, Clock, LogOut, Bell, Shield, Database, Info, ArrowRight, Trophy, Target, Zap, ShoppingBag, Clock as ClockIcon, Brain, Palette } from 'lucide-react'
import { MEMBERSHIP_LABELS, AFFECTION_LEVELS } from '@/lib/types'

interface ProfileData {
  user: {
    nickname: string
    phone: string
    membershipType: number
    points: number
    currentStreak: number
    avatar: string
    level: number
    totalPoints: number
    maxStreak: number
  } | null
  affection: {
    score: number
    level: number
  } | null
  partner: {
    name: string
    avatar: string
    coreType: string
  } | null
  checkInCount: number
}

interface Stats {
  trainingCount: number
  badgeCount: number
  friendCount: number
  courseCount: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState<Stats>({
    trainingCount: 0,
    badgeCount: 0,
    friendCount: 0,
    courseCount: 0,
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
          const response = await fetch('/api/user/me')
          const result = await response.json()
          setData(result)
          setStats({
            trainingCount: 15,
            badgeCount: 4,
            friendCount: 8,
            courseCount: 2,
          })
        } catch (error) {
          console.error('Failed to fetch profile data:', error)
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

  const affectionLevel = AFFECTION_LEVELS.find(
    (level) => data?.affection?.score && data.affection.score >= level.minScore && data.affection.score <= level.maxScore
  ) || AFFECTION_LEVELS[0]

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const membershipBenefits = [
    { icon: '🎯', title: '无限训练', desc: '解锁全部训练场景' },
    { icon: '💎', title: '双倍积分', desc: '每次训练获得双倍积分' },
    { icon: '📚', title: '专属课程', desc: '会员专属学习内容' },
    { icon: '💝', title: '优先体验', desc: '新功能优先使用' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar currentPage="profile" />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                {data?.user?.avatar ? (
                  <span className="text-3xl">{data.user.avatar}</span>
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-primary-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{data?.user?.nickname || `用户${data?.user?.phone?.slice(-4)}`}</h2>
              <p className="text-white/80 text-sm">Lv.{data?.user?.level || 1} · {MEMBERSHIP_LABELS[data?.user?.membershipType as 0 | 1 | 2 | 3] || '免费版'}</p>
            </div>
            <button className="text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
              编辑资料
            </button>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Heart className="w-4 h-4" />
                <span className="text-xl font-bold">{data?.affection?.score || 0}</span>
              </div>
              <p className="text-white/60 text-xs mt-1">好感度</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Coins className="w-4 h-4" />
                <span className="text-xl font-bold">{data?.user?.points || 0}</span>
              </div>
              <p className="text-white/60 text-xs mt-1">积分</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-xl font-bold">{data?.user?.currentStreak || 0}</span>
              </div>
              <p className="text-white/60 text-xs mt-1">连续签到</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xl font-bold">{stats.badgeCount}</span>
              </div>
              <p className="text-white/60 text-xs mt-1">徽章</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="w-10 h-10 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5" />
            </div>
            <p className="font-bold text-gray-800">{stats.trainingCount}</p>
            <p className="text-gray-500 text-xs">训练次数</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="w-10 h-10 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5" />
            </div>
            <p className="font-bold text-gray-800">{stats.badgeCount}</p>
            <p className="text-gray-500 text-xs">获得徽章</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="w-10 h-10 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Share2 className="w-5 h-5" />
            </div>
            <p className="font-bold text-gray-800">{stats.friendCount}</p>
            <p className="text-gray-500 text-xs">好友</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="w-10 h-10 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-5 h-5" />
            </div>
            <p className="font-bold text-gray-800">{stats.courseCount}</p>
            <p className="text-gray-500 text-xs">完成课程</p>
          </div>
        </div>

        {data?.partner && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-800">我的伴侣</h3>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">{data.partner.avatar}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{data.partner.name}</h4>
                <p className="text-gray-500 text-sm">类型：{data.partner.coreType}</p>
                <p className="text-gray-500 text-sm">好感度等级：{affectionLevel.name}</p>
              </div>
              <div className="w-20">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                    style={{ width: `${(data.affection?.score || 0) / 10}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">{data.affection?.score || 0}/1000</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">功能入口</h3>
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => router.push('/shop')}
              className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-all"
            >
              <div className="w-12 h-12 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-xs text-gray-600">道具商店</span>
            </button>
            <button
              onClick={() => router.push('/timetravel')}
              className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-all"
            >
              <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center">
                <ClockIcon className="w-6 h-6" />
              </div>
              <span className="text-xs text-gray-600">时空穿梭</span>
            </button>
            <button
              onClick={() => router.push('/mentalhealth')}
              className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-all"
            >
              <div className="w-12 h-12 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <span className="text-xs text-gray-600">心理健康</span>
            </button>
            <button
              onClick={() => router.push('/character')}
              className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-all"
            >
              <div className="w-12 h-12 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center">
                <Palette className="w-6 h-6" />
              </div>
              <span className="text-xs text-gray-600">角色定制</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-gray-800">升级会员</h3>
            </div>
            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">限时优惠</span>
          </div>
          <p className="text-gray-600 text-sm mb-4">解锁全部功能，享受更好的训练体验</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {membershipBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span>{benefit.icon}</span>
                <div>
                  <p className="font-medium text-gray-800 text-xs">{benefit.title}</p>
                  <p className="text-gray-500 text-xs">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button
              onClick={() => router.push('/membership')}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
            立即升级
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="space-y-2">
            <button
              onClick={() => {}}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-all"
            >
              <div className="w-10 h-10 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium text-gray-800">个人资料</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => {}}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-all"
            >
              <div className="w-10 h-10 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium text-gray-800">通知设置</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => {}}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium text-gray-800">账号设置</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => {}}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-all"
            >
              <div className="w-10 h-10 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium text-gray-800">帮助与反馈</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => router.push('/invite')}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-all"
            >
              <div className="w-10 h-10 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium text-gray-800">邀请好友</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="space-y-2">
            <button
              onClick={() => {}}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-all"
            >
              <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium text-gray-800">隐私设置</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => {}}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-all"
            >
              <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium text-gray-800">数据管理</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => {}}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-all"
            >
              <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium text-gray-800">关于我们</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>退出登录</span>
        </button>

        <div className="text-center text-gray-400 text-xs">
          <p>版本 v1.0.0</p>
          <p className="mt-1">与你 · 让社交更简单</p>
        </div>
      </div>
    </div>
  )
}

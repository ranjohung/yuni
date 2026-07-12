'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Crown, Star, Zap, Shield, Check, ArrowLeft, Sparkles, Award, Heart, Target, Gem, Infinity } from 'lucide-react'

interface PlanFeature {
  free: boolean
  day: boolean
  week: boolean
  month: boolean
  year: boolean
}

interface Plan {
  id: string
  name: string
  price: string
  priceRmb: number
  color: string
  popular?: boolean
  features: string[]
}

interface CurrentPlan {
  id: string
  name: string
  price: string
  priceRmb: number
  color: string
  features: string[]
  isActive: boolean
  daysLeft: number
  expiresAt: string | null
}

const COMPARISON_FEATURES: { label: string; key: string; values: Record<string, boolean | string> }[] = [
  { label: '每日训练次数', key: 'training', values: { free: '3次', day: '无限', week: '无限', month: '无限', year: '无限' } },
  { label: '场景解锁', key: 'scenes', values: { free: '基础', day: '全部', week: '全部', month: '全部', year: '全部' } },
  { label: 'DeepSeek AI对话', key: 'ai', values: { free: false, day: true, week: true, month: true, year: true } },
  { label: '双倍积分', key: 'points', values: { free: false, day: true, week: true, month: true, year: true } },
  { label: '时空穿梭券', key: 'tickets', values: { free: '0张', day: '3张', week: '5张', month: '15张', year: '60张' } },
  { label: '情绪日记分析', key: 'diary', values: { free: false, day: false, week: true, month: true, year: '深度分析' } },
  { label: '每周报告', key: 'report', values: { free: false, day: false, week: true, month: true, year: true } },
  { label: '语音情绪分析', key: 'voice', values: { free: false, day: false, week: false, month: true, year: true } },
  { label: '专属客服', key: 'service', values: { free: false, day: false, week: false, month: true, year: true } },
  { label: '3D数字人渲染', key: 'render', values: { free: false, day: false, week: false, month: false, year: true } },
  { label: '新功能优先体验', key: 'priority', values: { free: false, day: false, week: false, month: false, year: true } },
]

const PLAN_ORDER = ['free', 'day', 'week', 'month', 'year']

export default function MembershipPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchMembershipData()
    }
  }, [session, status, router])

  const fetchMembershipData = async () => {
    try {
      const response = await fetch('/api/membership')
      const data = await response.json()
      if (data.success) {
        const sortedPlans = PLAN_ORDER.map(id => data.plans.find((p: Plan) => p.id === id)).filter(Boolean)
        setPlans(sortedPlans)
        setCurrentPlan(data.currentPlan)
      }
    } catch (error) {
      console.error('获取会员信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (planId: string) => {
    if (planId === 'free') return
    setPurchasing(planId)

    try {
      const response = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await response.json()
      if (response.ok) {
        window.location.reload()
      } else {
        alert(data.error || '购买失败')
      }
    } catch (error) {
      console.error('购买失败:', error)
      alert('购买失败，请稍后重试')
    } finally {
      setPurchasing(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isCurrentPlan = (planId: string) => {
    return currentPlan?.isActive && currentPlan?.id === planId
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return Star
      case 'day': return Zap
      case 'week': return Sparkles
      case 'month': return Gem
      case 'year': return Crown
      default: return Star
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50">
      <Navbar currentPage="membership" />

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
            <Crown className="w-6 h-6 text-yellow-500" />
            <h1 className="text-xl font-bold text-gray-800">会员中心</h1>
          </div>
        </div>

        {/* 当前会员状态卡片 */}
        <div className="bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 rounded-3xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {currentPlan?.isActive ? (
                <Crown className="w-6 h-6" />
              ) : (
                <Star className="w-6 h-6" />
              )}
              <span className="text-lg font-bold">
                {currentPlan?.isActive ? currentPlan.name : '免费版'}
              </span>
            </div>
            {currentPlan?.isActive ? (
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                已激活
              </span>
            ) : (
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                未开通
              </span>
            )}
          </div>

          {currentPlan?.isActive ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/15 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Infinity className="w-4 h-4 text-yellow-200" />
                  <span className="text-yellow-100 text-xs">剩余天数</span>
                </div>
                <p className="text-2xl font-bold">
                  {currentPlan.daysLeft}
                  <span className="text-sm font-normal text-yellow-200 ml-1">天</span>
                </p>
              </div>
              <div className="bg-white/15 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-yellow-200" />
                  <span className="text-yellow-100 text-xs">会员特权</span>
                </div>
                <p className="text-sm font-medium">
                  {currentPlan.features.length}项特权
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white/15 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-sm text-white/90">开通会员享受更多特权，提升你的社交训练体验</p>
            </div>
          )}

          {currentPlan?.expiresAt && currentPlan.isActive && (
            <p className="text-yellow-100 text-xs mt-3">
              有效期至 {new Date(currentPlan.expiresAt).toLocaleDateString('zh-CN')}
            </p>
          )}
        </div>

        {/* 会员方案列表 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-500" />
            <h2 className="font-bold text-gray-800">选择会员方案</h2>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {plans.map((plan) => {
              const Icon = getPlanIcon(plan.id)
              const isCurrent = isCurrentPlan(plan.id)
              const isPopular = plan.popular
              const isFree = plan.id === 'free'

              return (
                <div
                  key={plan.id}
                  className={`flex-shrink-0 w-64 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative ${
                    isPopular ? 'ring-2 ring-yellow-500' : ''
                  }`}
                >
                  {/* 热门标签 */}
                  {isPopular && (
                    <div className="absolute -top-3 right-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      热门
                    </div>
                  )}

                  {/* 性价比标签 */}
                  {plan.id === 'year' && (
                    <div className="absolute -top-3 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      性价比
                    </div>
                  )}

                  {/* 当前方案标签 */}
                  {isCurrent && (
                    <div className="absolute -top-3 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      当前方案
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isPopular ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        {isFree ? (
                          <span className="text-2xl font-bold text-gray-800">免费</span>
                        ) : (
                          <>
                            <span className="text-xs text-gray-500">¥</span>
                            <span className="text-2xl font-bold text-gray-800">{plan.price}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 功能列表 */}
                  <div className="space-y-2 mb-4">
                    {plan.features.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 5 && (
                      <p className="text-xs text-gray-400 ml-6">+{plan.features.length - 5}项更多特权</p>
                    )}
                  </div>

                  {/* 购买按钮 */}
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={isFree || isCurrent || purchasing === plan.id}
                    className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isFree
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isPopular
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600 shadow-md'
                        : 'bg-gradient-to-r from-gray-800 to-gray-700 text-white hover:from-gray-900 hover:to-gray-800'
                    }`}
                  >
                    {purchasing === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        处理中...
                      </span>
                    ) : isCurrent ? (
                      '当前方案'
                    ) : isFree ? (
                      '当前方案'
                    ) : (
                      `立即开通 ¥${plan.price}`
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* 会员权益对比表格 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-yellow-500" />
            <h2 className="font-bold text-gray-800">会员权益对比</h2>
          </div>

          <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr>
                  <th className="text-left py-3 pr-4 text-gray-500 font-medium text-xs">权益</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-3 px-2 text-gray-500 font-medium text-xs">
                      <div className="flex flex-col items-center gap-1">
                        {plan.id === 'day' ? (
                          <span className="text-yellow-600 font-bold">{plan.name}</span>
                        ) : (
                          plan.name
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((feature, index) => (
                  <tr key={feature.key} className={index % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="py-3 pr-4 text-gray-700 text-xs">{feature.label}</td>
                    {plans.map((plan) => {
                      const value = feature.values[plan.id as keyof typeof feature.values]
                      return (
                        <td key={plan.id} className="text-center py-3 px-2">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <Check className="w-4 h-4 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )
                          ) : (
                            <span className={`text-xs ${
                              value === '无限' || value === '全部' || value === '深度分析'
                                ? 'text-yellow-600 font-medium'
                                : 'text-gray-600'
                            }`}>
                              {value}
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 会员专属说明 */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-5 border border-yellow-200">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-gray-800">会员专属体验</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/80 rounded-xl p-3">
              <Target className="w-5 h-5 text-yellow-500 mb-1" />
              <p className="font-medium text-gray-800 text-sm">无限训练</p>
              <p className="text-gray-500 text-xs">打破次数限制</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3">
              <Gem className="w-5 h-5 text-yellow-500 mb-1" />
              <p className="font-medium text-gray-800 text-sm">专属内容</p>
              <p className="text-gray-500 text-xs">解锁高级场景</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3">
              <Zap className="w-5 h-5 text-yellow-500 mb-1" />
              <p className="font-medium text-gray-800 text-sm">优先体验</p>
              <p className="text-gray-500 text-xs">新功能抢先使用</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3">
              <Award className="w-5 h-5 text-yellow-500 mb-1" />
              <p className="font-medium text-gray-800 text-sm">专属标识</p>
              <p className="text-gray-500 text-xs">彰显会员身份</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

const MEMBERSHIP_PLANS = [
  {
    id: 'free',
    name: '免费版',
    price: '免费',
    priceRmb: 0,
    color: 'bg-gray-100 text-gray-600',
    features: [
      '每日3次训练',
      '基础场景',
      '文字对话',
      '基础签到',
      '查看学习卡片',
    ],
  },
  {
    id: 'day',
    name: '体验日卡',
    price: '3.9',
    priceRmb: 3.9,
    color: 'bg-green-100 text-green-600',
    popular: true,
    features: [
      '无限训练',
      '全部场景解锁',
      'DeepSeek AI对话',
      '双倍积分',
      '时空穿梭券 ×3',
    ],
  },
  {
    id: 'week',
    name: '周卡',
    price: '19.9',
    priceRmb: 19.9,
    color: 'bg-blue-100 text-blue-600',
    features: [
      '无限训练',
      '全部场景解锁',
      'DeepSeek AI对话',
      '双倍积分',
      '时空穿梭券 ×5',
      '情绪日记分析',
      '每周报告',
    ],
  },
  {
    id: 'month',
    name: '月卡',
    price: '49.9',
    priceRmb: 49.9,
    color: 'bg-purple-100 text-purple-600',
    features: [
      '无限训练',
      '全部场景解锁',
      'DeepSeek AI对话',
      '双倍积分',
      '时空穿梭券 ×15',
      '情绪日记+分析',
      '每周报告+建议',
      '语音情绪分析',
      '专属客服',
    ],
  },
  {
    id: 'year',
    name: '年卡',
    price: '399',
    priceRmb: 399,
    color: 'bg-yellow-100 text-yellow-600',
    features: [
      '无限训练',
      '全部场景解锁',
      'DeepSeek AI高优先级',
      '双倍积分',
      '时空穿梭券 ×60',
      '情绪日记+深度分析',
      '每周报告+建议',
      '语音情绪分析',
      '专属客服',
      '3D数字人渲染',
      '新功能优先体验',
    ],
  },
]

function getDaysFromPlan(planId: string): number {
  switch (planId) {
    case 'day': return 1
    case 'week': return 7
    case 'month': return 30
    case 'year': return 365
    default: return 0
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { membershipType: true, membershipExpiresAt: true },
    })

    const now = new Date()
    const isActive = user?.membershipExpiresAt && new Date(user.membershipExpiresAt) > now
    const daysLeft = isActive && user?.membershipExpiresAt
      ? Math.ceil((new Date(user.membershipExpiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    const currentPlan = MEMBERSHIP_PLANS[user?.membershipType || 0]

    return new Response(JSON.stringify({
      success: true,
      plans: MEMBERSHIP_PLANS,
      currentPlan: {
        ...currentPlan,
        isActive: !!isActive,
        daysLeft,
        expiresAt: user?.membershipExpiresAt,
      },
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取会员信息失败' }), { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { planId } = await request.json()

  const planIndex = MEMBERSHIP_PLANS.findIndex(p => p.id === planId)
  if (planIndex < 1) {
    return new Response(JSON.stringify({ success: false, error: '无效的会员方案' }), { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: '用户不存在' }), { status: 404 })
    }

    const days = getDaysFromPlan(planId)
    const now = new Date()
    const currentExpiry = user.membershipExpiresAt && new Date(user.membershipExpiresAt) > now
      ? new Date(user.membershipExpiresAt)
      : now

    const newExpiry = new Date(currentExpiry)
    newExpiry.setDate(newExpiry.getDate() + days)

    await prisma.user.update({
      where: { id: userId },
      data: {
        membershipType: planIndex,
        membershipExpiresAt: newExpiry,
      },
    })

    const plan = MEMBERSHIP_PLANS[planIndex]

    return new Response(JSON.stringify({
      success: true,
      message: `成功购买${plan.name}！有效期至${newExpiry.toLocaleDateString('zh-CN')}`,
      plan: {
        ...plan,
        isActive: true,
        daysLeft: days,
        expiresAt: newExpiry,
      },
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '购买会员失败' }), { status: 500 })
  }
}
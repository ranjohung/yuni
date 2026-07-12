import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

const CARE_MESSAGES = [
  { trigger: 'morning', message: '早安！新的一天开始了，记得吃早餐哦 ☀️', icon: '🌅', timeRange: '06:00-09:00' },
  { trigger: 'afternoon', message: '下午好，工作学习辛苦啦，适当休息一下 ☕', icon: '☕', timeRange: '12:00-14:00' },
  { trigger: 'evening', message: '晚上好，今天过得怎么样？ 🌆', icon: '🌆', timeRange: '17:00-19:00' },
  { trigger: 'night', message: '夜深了，早点休息，明天会更好 🌙', icon: '🌙', timeRange: '22:00-00:00' },
  { trigger: 'inactive_1h', message: '已经一个小时没见你了，有点想你 💭', icon: '💭', timeRange: 'inactive_1h' },
  { trigger: 'inactive_3h', message: '这么久没来，是在忙什么呢？记得照顾好自己 💗', icon: '💗', timeRange: 'inactive_3h' },
  { trigger: 'inactive_1d', message: '已经一天没见到你了，希望你一切都好 🌸', icon: '🌸', timeRange: 'inactive_1d' },
  { trigger: 'training_encourage', message: '刚刚完成训练的你真棒，继续加油！💪', icon: '💪', timeRange: 'after_training' },
  { trigger: 'sad_comfort', message: '看起来你心情不太好，需要我陪陪你吗？ 🌈', icon: '🌈', timeRange: 'emotion_sad' },
  { trigger: 'happy_celebrate', message: '看到你开心，我也很开心！今天真是美好的一天 ✨', icon: '✨', timeRange: 'emotion_happy' },
  { trigger: 'streak_reminder', message: '今天还没有签到哦，连续签到有奖励！⭐', icon: '⭐', timeRange: 'evening_reminder' },
  { trigger: 'gift_thanks', message: '谢谢你送的礼物，我很喜欢！💝', icon: '💝', timeRange: 'after_gift' },
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  try {
    const now = new Date()
    const hour = now.getHours()
    const rules = await prisma.companionModeRule.findMany({ orderBy: { priority: 'asc' } })

    const [activePartner, affection, todayCheckin, todayTraining, todayMood] = await Promise.all([
      prisma.partner.findFirst({ where: { userId, isActive: true }, select: { name: true, avatar: true } }),
      prisma.affection.findUnique({ where: { userId } }),
      prisma.checkIn.findFirst({ where: { userId, checkInDate: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } } }),
      prisma.trainingRecord.count({ where: { userId, createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } } }),
      prisma.dailyMood.findFirst({ where: { userId, createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } }, orderBy: { createdAt: 'desc' } }),
    ])

    const availableMessages = CARE_MESSAGES.filter(m => {
      if (m.timeRange.startsWith('emotion_')) {
        if (!todayMood) return false
        const emotion = m.timeRange.replace('emotion_', '')
        if (emotion === 'sad' && ['sad', 'anxious', 'angry'].includes(todayMood.mood)) return true
        if (emotion === 'happy' && ['happy', 'excited'].includes(todayMood.mood)) return true
        return false
      }
      if (m.timeRange === 'after_training') return todayTraining > 0
      if (m.timeRange === 'evening_reminder') return !todayCheckin && (hour >= 18 || hour < 6)
      if (m.timeRange === 'after_gift') return false
      if (m.timeRange.startsWith('inactive_')) return false
      if (m.timeRange.includes('-')) {
        const [start, end] = m.timeRange.split('-').map(t => parseInt(t))
        if (start <= end) return hour >= start && hour < end
        return hour >= start || hour < end
      }
      return true
    })

    return new Response(JSON.stringify({
      success: true,
      partner: activePartner,
      affection: { score: affection?.score || 0, level: affection?.level || 1 },
      cares: availableMessages.map(m => ({
        ...m,
        id: `${m.trigger}_${Date.now()}`,
      })),
      rules: rules.map(r => ({
        id: r.id,
        name: r.modeName,
        description: r.description,
        priority: r.priority,
      })),
      stats: {
        todayTraining,
        hasCheckedIn: !!todayCheckin,
        currentMood: todayMood?.mood || null,
      },
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取关怀消息失败' }), { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { trigger } = await request.json()

  const message = CARE_MESSAGES.find(m => m.trigger === trigger)
  if (!message) {
    return new Response(JSON.stringify({ success: false, error: '未知的关怀类型' }), { status: 400 })
  }

  try {
    const activePartner = await prisma.partner.findFirst({
      where: { userId, isActive: true },
      select: { name: true, avatar: true },
    })

    return new Response(JSON.stringify({
      success: true,
      care: {
        ...message,
        partnerName: activePartner?.name || 'TA',
        partnerAvatar: activePartner?.avatar || '💝',
        sentAt: new Date().toISOString(),
      },
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '发送关怀消息失败' }), { status: 500 })
  }
}
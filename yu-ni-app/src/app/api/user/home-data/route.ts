import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [affection, partner, todayCheckIn, chatSession, trainingRecords] = await Promise.all([
    prisma.affection.findUnique({ where: { userId } }),
    prisma.partner.findFirst({ where: { userId, isActive: true } }),
    prisma.checkIn.findFirst({ where: { userId, checkInDate: today } }),
    prisma.chatSession.findFirst({
      where: { userId },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    }),
    prisma.trainingRecord.findMany({
      where: { userId },
      include: { scene: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const abilityStats = {
    empathy: 65,
    expression: 70,
    listening: 60,
    confidence: 75,
    strategy: 68,
  }

  const weeklyProgress = {
    usedSimulations: 3,
    totalSimulations: 7,
    percentage: Math.round((3 / 7) * 100),
  }

  const affectionScore = affection?.score || 0
  const isEvening = new Date().getHours() >= 19

  let goodnightPlan = null
  if (isEvening && partner) {
    let planTitle = ''
    let planContent = ''
    let partnerMood = ''

    if (affectionScore >= 80) {
      planTitle = '甜蜜晚安'
      planContent = '今晚想和你一起看星星，聊聊今天发生的趣事...'
      partnerMood = '开心'
    } else if (affectionScore >= 50) {
      planTitle = '温馨陪伴'
      planContent = '今天辛苦了，好好休息吧，明天又是新的一天'
      partnerMood = '温柔'
    } else {
      planTitle = '晚安问候'
      planContent = '夜深了，早点休息，晚安'
      partnerMood = '平静'
    }

    goodnightPlan = {
      hasPlan: true,
      planTitle,
      planContent,
      partnerMood,
    }
  }

  const result = {
    affection: affection ? { score: affection.score, level: affection.level } : null,
    partner: partner
      ? {
          name: partner.name,
          avatar: partner.avatar,
          coreType: partner.coreType,
        }
      : null,
    todayCheckIn: !!todayCheckIn,
    chatSession: chatSession && chatSession.messages.length > 0
      ? { lastMessage: chatSession.messages[0].content }
      : null,
    trainingRecords: trainingRecords.map((record) => ({
      id: record.id,
      sceneName: record.scene.name,
      status: record.status,
      scores: record.scores,
      createdAt: record.createdAt.toISOString(),
    })),
    abilityStats,
    weeklyProgress,
    goodnightPlan,
  }

  return new Response(JSON.stringify(result), { status: 200 })
}

import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  try {
    const reports = await prisma.weeklyReport.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
      take: 20,
    })

    return new Response(JSON.stringify({
      success: true,
      reports: reports.map(r => ({
        id: r.id,
        weekNumber: r.weekNumber,
        year: r.year,
        trainingCount: r.trainingCount,
        scores: r.scores ? JSON.parse(r.scores) : null,
        improvements: r.improvements,
        recommendation: r.recommendation,
        partnerMessage: r.partnerMessage,
        createdAt: r.createdAt,
      })),
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取报告失败' }), { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  try {
    const now = new Date()
    const year = now.getFullYear()
    const weekNumber = Math.ceil((now.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))

    const existing = await prisma.weeklyReport.findFirst({
      where: { userId, year, weekNumber },
    })
    if (existing) {
      return new Response(JSON.stringify({ success: false, error: '本周报告已生成' }), { status: 400 })
    }

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [trainingRecords, checkIns, giftRecords, emotionDiaries, affection] = await Promise.all([
      prisma.trainingRecord.findMany({
        where: { userId, createdAt: { gte: weekAgo } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.checkIn.findMany({
        where: { userId, checkInDate: { gte: weekAgo } },
      }),
      prisma.giftRecord.findMany({
        where: { userId, createdAt: { gte: weekAgo } },
      }),
      prisma.emotionDiary.findMany({
        where: { userId, createdAt: { gte: weekAgo } },
      }),
      prisma.affection.findUnique({ where: { userId } }),
    ])

    const trainingCount = trainingRecords.length
    const completedCount = trainingRecords.filter(r => r.status === 1).length
    const avgScore = trainingCount > 0
      ? Math.round(trainingRecords.reduce((sum, r) => {
          const scores = typeof r.scores === 'string' ? JSON.parse(r.scores) : r.scores
          return sum + (typeof scores === 'object' && scores !== null ? Object.values(scores).reduce((a: number, b: unknown) => a + (Number(b) || 0), 0) / Object.keys(scores).length : Number(scores) || 0)
        }, 0) / trainingCount)
      : 0

    const allScores = trainingRecords.map(r => {
      const scores = typeof r.scores === 'string' ? JSON.parse(r.scores) : r.scores
      if (typeof scores === 'object' && scores !== null) {
        return Object.values(scores).reduce((a: number, b: unknown) => a + (Number(b) || 0), 0) / Object.keys(scores).length
      }
      return Number(scores) || 0
    })

    const checkinCount = checkIns.length
    const giftCount = giftRecords.length
    const diaryCount = emotionDiaries.length
    const affectionScore = affection?.score || 0

    const emotionDistribution = {
      positive: emotionDiaries.filter(d => ['happy', 'excited', 'grateful', 'peaceful'].includes(d.emotionTag || '')).length,
      neutral: emotionDiaries.filter(d => ['calm', 'normal', 'tired'].includes(d.emotionTag || '')).length,
      negative: emotionDiaries.filter(d => ['sad', 'anxious', 'angry', 'depressed'].includes(d.emotionTag || '')).length,
    }

    let improvements = ''
    const improvementParts: string[] = []
    if (trainingCount > 0) {
      improvementParts.push(`完成了 ${trainingCount} 次训练，${completedCount} 次完成，平均得分 ${avgScore} 分`)
    }
    if (checkinCount > 0) {
      improvementParts.push(`签到 ${checkinCount} 天`)
    }
    if (giftCount > 0) {
      improvementParts.push(`送礼物 ${giftCount} 次`)
    }
    if (diaryCount > 0) {
      improvementParts.push(`记录情绪日记 ${diaryCount} 篇`)
    }
    if (improvementParts.length > 0) {
      improvements = improvementParts.join('，') + '。'
      if (avgScore >= 80) improvements += '表现非常出色！'
      else if (trainingCount > 0) improvements += '继续加油！'
    } else {
      improvements = '本周还没有进行训练，开始你的第一次训练吧！'
    }

    const recommendation = avgScore >= 80
      ? '表现非常出色！可以尝试挑战更高难度的场景，探索更多社交技巧。'
      : avgScore >= 60
      ? '基础不错，建议多练习薄弱环节，关注情绪识别和表达能力的提升。'
      : '建议从基础场景开始，逐步提升训练难度，同时多与伴侣互动获取反馈。'

    const partner = await prisma.partner.findFirst({
      where: { userId, isActive: true },
    })

    let partnerMessage = ''
    if (partner) {
      if (avgScore >= 80) {
        partnerMessage = `${partner.name}：这周你进步很大，为你感到骄傲！继续保持这份热情，我们一起成长~`
      } else if (avgScore >= 60 || trainingCount > 0) {
        partnerMessage = `${partner.name}：我看到你的努力了！每一次训练都是一次成长，继续加油，我会一直陪着你。`
      } else if (affectionScore >= 80) {
        partnerMessage = `${partner.name}：虽然这周训练不多，但我们的关系很好！希望下周能看到你更多进步哦~`
      } else {
        partnerMessage = `${partner.name}：没关系，慢慢来。有时候休息也是为了更好地出发，我相信你一定可以的！`
      }
    } else {
      partnerMessage = '继续加油！'
    }

    const report = await prisma.weeklyReport.create({
      data: {
        userId,
        weekNumber,
        year,
        trainingCount,
        scores: JSON.stringify({
          avgScore,
          completedCount,
          totalTraining: trainingCount,
          scoreTrend: allScores,
          checkinCount,
          giftCount,
          diaryCount,
          affectionScore,
          emotionDistribution,
        }),
        improvements,
        recommendation,
        partnerMessage,
      },
    })

    return new Response(JSON.stringify({
      success: true,
      report: {
        id: report.id,
        weekNumber: report.weekNumber,
        year: report.year,
        trainingCount: report.trainingCount,
        scores: JSON.parse(report.scores as string),
        improvements: report.improvements,
        recommendation: report.recommendation,
        partnerMessage: report.partnerMessage,
        createdAt: report.createdAt,
      },
    }), { status: 201 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '生成报告失败' }), { status: 500 })
  }
}
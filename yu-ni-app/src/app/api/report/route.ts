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

    const trainingRecords = await prisma.trainingRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const thisWeekRecords = trainingRecords.filter(r => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(r.createdAt) >= weekAgo
    })

    const trainingCount = thisWeekRecords.length
    const completedCount = thisWeekRecords.filter(r => r.status === 1).length
    const avgScore = trainingCount > 0
      ? Math.round(thisWeekRecords.reduce((sum, r) => {
          const scores = typeof r.scores === 'string' ? JSON.parse(r.scores) : r.scores
          return sum + (typeof scores === 'object' && scores !== null ? Object.values(scores).reduce((a: number, b: unknown) => a + (Number(b) || 0), 0) / Object.keys(scores).length : Number(scores) || 0)
        }, 0) / trainingCount)
      : 0

    const allScores = thisWeekRecords.map(r => {
      const scores = typeof r.scores === 'string' ? JSON.parse(r.scores) : r.scores
      if (typeof scores === 'object' && scores !== null) {
        return Object.values(scores).reduce((a: number, b: unknown) => a + (Number(b) || 0), 0) / Object.keys(scores).length
      }
      return Number(scores) || 0
    })

    const improvements = trainingCount > 0
      ? `本周完成了 ${trainingCount} 次训练，${completedCount} 次完成，平均得分 ${avgScore} 分。${
          completedCount === trainingCount ? '全部完成，表现不错！' : `还有 ${trainingCount - completedCount} 次训练待完成。`
        }`
      : '本周还没有进行训练，开始你的第一次训练吧！'

    const recommendation = avgScore >= 80
      ? '表现非常出色！可以尝试挑战更高难度的场景。'
      : avgScore >= 60
      ? '基础不错，建议多练习薄弱环节，提升社交能力。'
      : '建议从基础场景开始，逐步提升训练难度。'

    const partner = await prisma.partner.findFirst({
      where: { userId, isActive: true },
    })
    const partnerMessage = partner
      ? `${partner.name}：${avgScore >= 80 ? '这周你进步很大，为你感到骄傲！' : avgScore >= 60 ? '继续加油，我看到你的努力了！' : '没关系，慢慢来，我会一直陪着你。'}`
      : '继续加油！'

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
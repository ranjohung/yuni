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
    const [milestones, affection, giftRecords, trainingRecords, checkIns, diaries] = await Promise.all([
      prisma.relationshipMilestone.findMany({
        where: { userId },
        include: { partner: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.affection.findUnique({ where: { userId } }),
      prisma.giftRecord.findMany({
        where: { userId },
        include: {
          gift: { select: { name: true } },
          partner: { select: { name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.trainingRecord.findMany({
        where: { userId, status: 1 },
        include: { scene: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.checkIn.findMany({
        where: { userId },
        orderBy: { checkInDate: 'desc' },
        take: 100,
      }),
      prisma.emotionDiary.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ])

    const timeline: Array<{
      id: string
      type: string
      title: string
      description: string
      icon: string
      date: string
      metadata?: Record<string, unknown>
    }> = []

    milestones.forEach(m => {
      timeline.push({
        id: `milestone-${m.id}`,
        type: 'milestone',
        title: m.description || '关系里程碑',
        description: m.milestoneType,
        icon: getMilestoneIcon(m.milestoneType),
        date: m.createdAt.toISOString(),
        metadata: { affectionValue: m.affectionValue, partnerName: m.partner.name },
      })
    })

    giftRecords.forEach(g => {
      timeline.push({
        id: `gift-${g.id}`,
        type: 'gift',
        title: `送出了礼物 ${g.gift.name}`,
        description: g.wasSuccessful ? '伴侣很喜欢！好感度 +' + g.affectionChange : '伴侣收下了',
        icon: g.wasSuccessful ? '💝' : '🎁',
        date: g.createdAt.toISOString(),
        metadata: { affectionChange: g.affectionChange, partnerName: g.partner.name },
      })
    })

    trainingRecords.forEach(t => {
      timeline.push({
        id: `training-${t.id}`,
        type: 'training',
        title: `完成了「${t.scene.name}」训练`,
        description: t.scores ? `评分：${JSON.parse(t.scores as string).overall || '完成'}` : '已完成',
        icon: '🎯',
        date: (t.completedAt || t.createdAt).toISOString(),
      })
    })

    checkIns.forEach(c => {
      timeline.push({
        id: `checkin-${c.id}`,
        type: 'checkin',
        title: `连续签到第 ${c.streak} 天`,
        description: '坚持就是胜利！',
        icon: '⭐',
        date: c.checkInDate.toISOString(),
        metadata: { streak: c.streak },
      })
    })

    diaries.forEach(d => {
      timeline.push({
        id: `diary-${d.id}`,
        type: 'diary',
        title: '记录了一篇情绪日记',
        description: `情绪：${d.emotionTag || '未标记'}`,
        icon: '📝',
        date: d.createdAt.toISOString(),
      })
    })

    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const stats = {
      totalMilestones: milestones.length,
      totalGifts: giftRecords.length,
      totalTraining: trainingRecords.length,
      totalDays: checkIns.length,
      maxStreak: checkIns.length > 0 ? Math.max(...checkIns.map(c => c.streak)) : 0,
      currentAffection: affection?.score || 0,
      affectionLevel: affection?.level || 1,
    }

    return new Response(JSON.stringify({ success: true, timeline: timeline.slice(0, 200), stats }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取回忆录失败' }), { status: 500 })
  }
}

function getMilestoneIcon(type: string): string {
  const icons: Record<string, string> = {
    first_training: '🌟',
    first_gift: '🎁',
    first_diary: '📝',
    affection_level_up: '💗',
    streak_7: '🔥',
    streak_30: '💪',
    all_scenes: '🏆',
    perfect_score: '💎',
    max_affection: '👑',
  }
  return icons[type] || '🏅'
}
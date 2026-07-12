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
    const greetings = await prisma.nightlyGreeting.findMany({
      where: { userId },
      include: {
        partner: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = await prisma.nightlyGreeting.count({
      where: { userId, createdAt: { gte: today } },
    })

    const totalCount = await prisma.nightlyGreeting.count({ where: { userId } })
    const playedCount = await prisma.nightlyGreeting.count({ where: { userId, isPlayed: true } })

    return new Response(JSON.stringify({
      success: true,
      greetings: greetings.map(g => ({
        id: g.id,
        content: g.content,
        isPlayed: g.isPlayed,
        partnerName: g.partner.name,
        partnerAvatar: g.partner.avatar,
        createdAt: g.createdAt,
      })),
      todayCount,
      totalCount,
      playedCount,
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取晚安计划失败' }), { status: 500 })
  }
}
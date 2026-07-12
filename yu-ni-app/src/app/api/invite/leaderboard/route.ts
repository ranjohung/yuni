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
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        avatar: true,
        _count: {
          select: { invitations: true },
        },
      },
      orderBy: {
        invitations: { _count: 'desc' },
      },
      take: 50,
    })

    const leaderboard = users
      .filter(u => u._count.invitations > 0)
      .map((u, index) => ({
        rank: index + 1,
        userId: u.id,
        name: u.nickname || `用户${u.id}`,
        avatar: u.avatar || '👤',
        count: u._count.invitations,
        isMe: u.id === userId,
      }))

    const totalInvited = leaderboard.reduce((sum, u) => sum + u.count, 0)
    const myRank = leaderboard.find(u => u.isMe)?.rank || null
    const myCount = leaderboard.find(u => u.isMe)?.count || 0

    return new Response(JSON.stringify({
      success: true,
      leaderboard,
      totalInvited,
      myRank,
      myCount,
      totalParticipants: leaderboard.length,
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取排行榜失败' }), { status: 500 })
  }
}
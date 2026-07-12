import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  const [user, affection, partner, checkIns] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.affection.findUnique({ where: { userId } }),
    prisma.partner.findFirst({ where: { userId, isActive: true } }),
    prisma.checkIn.findMany({ where: { userId } }),
  ])

  const result = {
    user: user
      ? {
          nickname: user.nickname || '',
          phone: user.phone,
          membershipType: user.membershipType,
          points: user.points || 0,
          currentStreak: user.currentStreak || 0,
          avatar: user.avatar || '',
        }
      : null,
    affection: affection ? { score: affection.score, level: affection.level } : null,
    partner: partner
      ? {
          name: partner.name,
          avatar: partner.avatar,
          coreType: partner.coreType,
        }
      : null,
    checkInCount: checkIns.length,
  }

  return new Response(JSON.stringify(result), { status: 200 })
}

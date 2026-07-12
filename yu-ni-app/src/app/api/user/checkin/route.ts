import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existingCheckIn = await prisma.checkIn.findFirst({
    where: {
      userId,
      checkInDate: today,
    },
  })

  if (existingCheckIn) {
    return new Response(JSON.stringify({ success: false, error: '今日已签到' }), { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayCheckIn = await prisma.checkIn.findFirst({
    where: {
      userId,
      checkInDate: yesterday,
    },
  })

  const newStreak = yesterdayCheckIn ? (user?.currentStreak || 0) + 1 : 1

  await prisma.$transaction([
    prisma.checkIn.create({
      data: {
        userId,
        checkInDate: today,
        streak: newStreak,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        maxStreak: Math.max(newStreak, user?.maxStreak || 0),
        points: (user?.points || 0) + 10,
      },
    }),
    prisma.affection.update({
      where: { userId },
      data: {
        score: { increment: 10 },
      },
    }),
  ])

  return new Response(JSON.stringify({ success: true, streak: newStreak }), { status: 200 })
}

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
    where: { userId, checkInDate: today },
  })

  if (existingCheckIn) {
    return new Response(JSON.stringify({ message: '今天已经签到过了' }), { status: 200 })
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const yesterdayCheckIn = await prisma.checkIn.findFirst({
    where: { userId, checkInDate: yesterday },
  })

  const lastCheckIn = await prisma.checkIn.findFirst({
    where: { userId },
    orderBy: { checkInDate: 'desc' },
  })

  const streak = yesterdayCheckIn ? (lastCheckIn?.streak || 0) + 1 : 1

  await prisma.checkIn.create({
    data: { userId, checkInDate: today, streak },
  })

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: streak,
      maxStreak: { set: Math.max(streak, (lastCheckIn?.streak || 0)) },
      points: { increment: 10 },
    },
  })

  return new Response(JSON.stringify({ message: '签到成功', streak }), { status: 200 })
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayCheckIn = await prisma.checkIn.findFirst({
    where: { userId, checkInDate: today },
  })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, maxStreak: true },
  })

  return new Response(
    JSON.stringify({
      checkedIn: !!todayCheckIn,
      currentStreak: user?.currentStreak || 0,
      maxStreak: user?.maxStreak || 0,
    }),
    { status: 200 }
  )
}

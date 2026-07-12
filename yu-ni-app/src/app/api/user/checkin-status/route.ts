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

  const checkIn = await prisma.checkIn.findFirst({
    where: {
      userId,
      createdAt: {
        gte: today,
      },
    },
  })

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  return new Response(
    JSON.stringify({
      checkedIn: !!checkIn,
      streak: user?.currentStreak || 0,
    }),
    { status: 200 }
  )
}

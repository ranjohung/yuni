import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  const giftRecords = await prisma.giftRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { gift: true },
  })

  return new Response(JSON.stringify(giftRecords), { status: 200 })
}

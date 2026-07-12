import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const giftItems = await prisma.giftItem.findMany({
    orderBy: { tier: 'asc' },
  })

  return new Response(JSON.stringify(giftItems), { status: 200 })
}

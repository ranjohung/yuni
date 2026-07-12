import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { partnerId } = await request.json()

  if (!partnerId) {
    return new Response(JSON.stringify({ error: '缺少伴侣ID' }), { status: 400 })
  }

  const partner = await prisma.partner.findUnique({ where: { id: partnerId } })
  if (!partner || partner.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Partner not found' }), { status: 404 })
  }

  await prisma.partner.updateMany({
    where: { userId },
    data: { isActive: false },
  })

  await prisma.partner.update({
    where: { id: partnerId },
    data: { isActive: true },
  })

  return new Response(JSON.stringify({ success: true, partner }), { status: 200 })
}

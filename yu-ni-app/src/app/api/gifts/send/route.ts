import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { giftId } = await request.json()

  const user = await prisma.user.findUnique({ where: { id: userId } })
  const gift = await prisma.giftItem.findUnique({ where: { id: giftId } })
  const partner = await prisma.partner.findFirst({ where: { userId, isActive: true } })

  if (!user || !gift || !partner) {
    return new Response(JSON.stringify({ error: '参数错误' }), { status: 400 })
  }

  if (user.points < gift.pricePoints) {
    return new Response(JSON.stringify({ error: '积分不足' }), { status: 400 })
  }

  const affectionChange = Math.floor(Math.random() * (gift.affectionMax - gift.affectionMin + 1)) + gift.affectionMin

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { points: { decrement: gift.pricePoints } },
    }),
    prisma.affection.update({
      where: { userId },
      data: { score: { increment: affectionChange } },
    }),
    prisma.giftRecord.create({
      data: {
        userId,
        partnerId: partner.id,
        giftId,
        affectionChange,
        wasSuccessful: true,
      },
    }),
  ])

  return new Response(JSON.stringify({ message: '送礼成功', affectionChange }), { status: 200 })
}

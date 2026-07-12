import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response(JSON.stringify({ success: false, error: '未登录' }), { status: 401 })
  }

  try {
    const userId = parseInt(session.user.id)
    const inventory = await prisma.inventoryItem.findMany({
      where: { userId, quantity: { gt: 0 } },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    })

    return new Response(JSON.stringify(inventory), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取背包失败' }), { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response(JSON.stringify({ success: false, error: '未登录' }), { status: 401 })
  }

  const { itemId } = await request.json()

  try {
    const userId = parseInt(session.user.id)
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: { userId, itemId },
      include: { item: true },
    })

    if (!inventoryItem || inventoryItem.quantity <= 0) {
      return new Response(JSON.stringify({ success: false, error: '道具不足' }), { status: 400 })
    }

    const item = inventoryItem.item
    let result = { success: true, message: '使用成功' }

    await prisma.$transaction(async (tx) => {
      await tx.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { quantity: inventoryItem.quantity - 1 },
      })

      switch (item.effect) {
        case 'affection_boost_20':
          const affection = await tx.affection.findUnique({ where: { userId } })
          if (affection) {
            await tx.affection.update({
              where: { userId },
              data: { score: affection.score + 20 },
            })
            result.message = '好感度+20'
          }
          break
        case 'points_300':
          await tx.user.update({
            where: { id: userId },
            data: { points: { increment: 300 } },
          })
          result.message = '积分+300'
          break
        default:
          break
      }
    })

    return new Response(JSON.stringify(result), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '使用道具失败' }), { status: 500 })
  }
}
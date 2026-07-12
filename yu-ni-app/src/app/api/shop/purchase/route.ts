import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response(JSON.stringify({ success: false, error: '未登录' }), { status: 401 })
  }

  const { itemId, quantity = 1 } = await request.json()

  try {
    const userId = parseInt(session.user.id)
    const item = await prisma.shopItem.findUnique({ where: { id: itemId } })

    if (!item || !item.isActive) {
      return new Response(JSON.stringify({ success: false, error: '商品不存在' }), { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.points < item.pricePoints * quantity) {
      return new Response(JSON.stringify({ success: false, error: '积分不足' }), { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { points: user.points - item.pricePoints * quantity },
      })

      const existingInventory = await tx.inventoryItem.findFirst({
        where: { userId, itemId },
      })

      if (existingInventory) {
        await tx.inventoryItem.update({
          where: { id: existingInventory.id },
          data: { quantity: existingInventory.quantity + quantity },
        })
      } else {
        await tx.inventoryItem.create({
          data: { userId, itemId, quantity },
        })
      }
    })

    return new Response(JSON.stringify({ success: true, message: '购买成功' }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '购买失败' }), { status: 500 })
  }
}
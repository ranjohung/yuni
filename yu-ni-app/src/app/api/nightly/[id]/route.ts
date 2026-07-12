import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const id = parseInt(params.id)

  try {
    const greeting = await prisma.nightlyGreeting.findFirst({
      where: { id, userId },
    })

    if (!greeting) {
      return new Response(JSON.stringify({ error: '记录不存在' }), { status: 404 })
    }

    const updated = await prisma.nightlyGreeting.update({
      where: { id },
      data: { isPlayed: true },
    })

    return new Response(JSON.stringify({
      success: true,
      greeting: {
        id: updated.id,
        content: updated.content,
        isPlayed: updated.isPlayed,
        createdAt: updated.createdAt,
      },
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: '更新失败' }), { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const id = parseInt(params.id)

  try {
    await prisma.nightlyGreeting.deleteMany({
      where: { id, userId },
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: '删除失败' }), { status: 500 })
  }
}
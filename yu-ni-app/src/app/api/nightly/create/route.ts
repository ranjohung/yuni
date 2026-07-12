import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { content } = await request.json()

  if (!content?.trim()) {
    return new Response(JSON.stringify({ error: '内容不能为空' }), { status: 400 })
  }

  try {
    const partner = await prisma.partner.findFirst({
      where: { userId, isActive: true },
    })

    if (!partner) {
      return new Response(JSON.stringify({ error: '请先创建伴侣' }), { status: 400 })
    }

    const greeting = await prisma.nightlyGreeting.create({
      data: {
        userId,
        partnerId: partner.id,
        content: content.trim(),
        isPlayed: false,
      },
    })

    return new Response(JSON.stringify({
      success: true,
      greeting: {
        id: greeting.id,
        content: greeting.content,
        isPlayed: greeting.isPlayed,
        createdAt: greeting.createdAt,
      },
    }), { status: 201 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '创建晚安计划失败' }), { status: 500 })
  }
}
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response(JSON.stringify({ success: false, error: '未登录' }), { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  try {
    const userId = parseInt(session.user.id)
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 5,
        },
        partner: {
          select: { name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (sessionId) {
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId: parseInt(sessionId) },
        orderBy: { createdAt: 'asc' },
      })
      return new Response(JSON.stringify({ success: true, messages }), { status: 200 })
    }

    const history = sessions.map(s => ({
      id: s.id,
      partnerName: s.partner.name,
      partnerAvatar: s.partner.avatar,
      preview: s.messages.length > 0 ? s.messages[s.messages.length - 1].content : '',
      messageCount: s.messages.length,
      createdAt: s.createdAt,
    }))

    return new Response(JSON.stringify({ success: true, history }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取历史记录失败' }), { status: 500 })
  }
}
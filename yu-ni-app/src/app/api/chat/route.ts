import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  const partner = await prisma.partner.findFirst({ where: { userId, isActive: true } })
  if (!partner) {
    return new Response(JSON.stringify({ error: 'No active partner' }), { status: 400 })
  }

  const chatSession = await prisma.chatSession.findFirst({
    where: { userId, partnerId: partner.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })

  if (!chatSession) {
    return new Response(JSON.stringify({ messages: [] }), { status: 200 })
  }

  const messages = chatSession.messages.map((msg) => ({
    id: msg.id,
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
    emotionType: msg.emotionType,
    emotionScore: msg.emotionScore,
    createdAt: msg.createdAt,
  }))

  return new Response(JSON.stringify({ partner, messages }), { status: 200 })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { content } = await request.json()

  if (!content?.trim()) {
    return new Response(JSON.stringify({ error: 'Empty message' }), { status: 400 })
  }

  const partner = await prisma.partner.findFirst({ where: { userId, isActive: true } })
  if (!partner) {
    return new Response(JSON.stringify({ error: 'No active partner' }), { status: 400 })
  }

  let chatSession = await prisma.chatSession.findFirst({
    where: { userId, partnerId: partner.id },
  })

  if (!chatSession) {
    chatSession = await prisma.chatSession.create({
      data: {
        userId,
        partnerId: partner.id,
      },
    })
  }

  const userMessage = await prisma.chatMessage.create({
    data: {
      sessionId: chatSession.id,
      role: 'user',
      content: content.trim(),
    },
  })

  const replyContent = '我理解你的感受，这确实是一个需要认真思考的问题。让我们一起想想看...'
  const assistantMessage = await prisma.chatMessage.create({
    data: {
      sessionId: chatSession.id,
      role: 'assistant',
      content: replyContent,
    },
  })

  return new Response(JSON.stringify({
    userMessage: {
      id: userMessage.id,
      role: 'user' as const,
      content: userMessage.content,
      createdAt: userMessage.createdAt,
    },
    assistantMessage: {
      id: assistantMessage.id,
      role: 'assistant' as const,
      content: assistantMessage.content,
      createdAt: assistantMessage.createdAt,
    },
  }), { status: 201 })
}

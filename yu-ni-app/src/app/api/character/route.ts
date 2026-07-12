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
    const characters = await prisma.customCharacter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return new Response(JSON.stringify({ success: true, characters }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取角色失败' }), { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response(JSON.stringify({ success: false, error: '未登录' }), { status: 401 })
  }

  const { name, avatar, style, personality, colorScheme, background } = await request.json()

  try {
    const userId = parseInt(session.user.id)

    const character = await prisma.customCharacter.create({
      data: {
        userId,
        name: name || '我的角色',
        avatar: avatar || '👤',
        style: style || 'default',
        personality: personality || JSON.stringify({ openness: 0.5, conscientiousness: 0.5, extraversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 }),
        colorScheme: colorScheme || 'indigo',
        background: background || 'gradient',
      },
    })

    return new Response(JSON.stringify({ success: true, character }), { status: 201 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '创建角色失败' }), { status: 500 })
  }
}
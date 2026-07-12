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
    const moods = await prisma.dailyMood.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    return new Response(JSON.stringify({ success: true, moods }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取心情记录失败' }), { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response(JSON.stringify({ success: false, error: '未登录' }), { status: 401 })
  }

  const { mood, intensity, note } = await request.json()

  try {
    const userId = parseInt(session.user.id)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await prisma.dailyMood.findFirst({
      where: { userId, createdAt: { gte: today } },
    })

    if (existing) {
      await prisma.dailyMood.update({
        where: { id: existing.id },
        data: { mood, intensity, note },
      })
    } else {
      await prisma.dailyMood.create({
        data: { userId, mood, intensity, note },
      })
    }

    return new Response(JSON.stringify({ success: true, message: '心情记录成功' }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '记录心情失败' }), { status: 500 })
  }
}
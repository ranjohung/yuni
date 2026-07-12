import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  try {
    const record = await prisma.cbtRecord.findFirst({
      where: { id: params.id, userId },
    })

    if (!record) {
      return new Response(JSON.stringify({ error: '记录不存在' }), { status: 404 })
    }

    return new Response(JSON.stringify(record), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: '获取记录失败' }), { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const data = await request.json()

  try {
    const record = await prisma.cbtRecord.findFirst({
      where: { id: params.id, userId },
    })

    if (!record) {
      return new Response(JSON.stringify({ error: '记录不存在' }), { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (data.situation !== undefined) updateData.situation = data.situation
    if (data.thought !== undefined) updateData.thought = data.thought
    if (data.emotions !== undefined) updateData.emotions = data.emotions
    if (data.emotionIntensityBefore !== undefined) updateData.emotionIntensityBefore = data.emotionIntensityBefore
    if (data.evidenceFor !== undefined) updateData.evidenceFor = data.evidenceFor
    if (data.evidenceAgainst !== undefined) updateData.evidenceAgainst = data.evidenceAgainst
    if (data.alternativeThought !== undefined) updateData.alternativeThought = data.alternativeThought
    if (data.emotionIntensityAfter !== undefined) updateData.emotionIntensityAfter = data.emotionIntensityAfter
    if (data.detectedDistortions !== undefined) updateData.detectedDistortions = data.detectedDistortions
    if (data.status !== undefined) updateData.status = data.status
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt
    updateData.savedAt = new Date()

    const updated = await prisma.cbtRecord.update({
      where: { id: params.id },
      data: updateData,
    })

    return new Response(JSON.stringify(updated), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: '更新记录失败' }), { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  try {
    await prisma.cbtRecord.deleteMany({
      where: { id: params.id, userId },
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: '删除记录失败' }), { status: 500 })
  }
}
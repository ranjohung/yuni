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
    const record = await prisma.nvcRecord.findFirst({
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
    const record = await prisma.nvcRecord.findFirst({
      where: { id: params.id, userId },
    })

    if (!record) {
      return new Response(JSON.stringify({ error: '记录不存在' }), { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (data.observation !== undefined) updateData.observation = data.observation
    if (data.observationValid !== undefined) updateData.observationValid = data.observationValid
    if (data.observationFeedback !== undefined) updateData.observationFeedback = data.observationFeedback
    if (data.feeling !== undefined) updateData.feeling = data.feeling
    if (data.need !== undefined) updateData.need = data.need
    if (data.request !== undefined) updateData.request = data.request
    if (data.requestValid !== undefined) updateData.requestValid = data.requestValid
    if (data.requestFeedback !== undefined) updateData.requestFeedback = data.requestFeedback
    if (data.fullSentence !== undefined) updateData.fullSentence = data.fullSentence
    if (data.qualityScore !== undefined) updateData.qualityScore = data.qualityScore
    if (data.status !== undefined) updateData.status = data.status
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt
    updateData.savedAt = new Date()

    const updated = await prisma.nvcRecord.update({
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
    await prisma.nvcRecord.deleteMany({
      where: { id: params.id, userId },
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: '删除记录失败' }), { status: 500 })
  }
}
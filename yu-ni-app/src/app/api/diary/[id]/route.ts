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
  const { emotionTag, content, insight } = await request.json()

  try {
    const existing = await prisma.emotionDiary.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return new Response(JSON.stringify({ error: '日记不存在' }), { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (emotionTag !== undefined) updateData.emotionTag = emotionTag
    if (content !== undefined) updateData.content = content
    if (insight !== undefined) updateData.insight = insight

    const updated = await prisma.emotionDiary.update({
      where: { id },
      data: updateData,
    })

    return new Response(JSON.stringify({
      success: true,
      diary: {
        id: updated.id,
        emotionTag: updated.emotionTag,
        content: updated.content,
        insight: updated.insight,
        createdAt: updated.createdAt,
      },
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: '更新日记失败' }), { status: 500 })
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
    await prisma.emotionDiary.deleteMany({
      where: { id, userId },
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: '删除日记失败' }), { status: 500 })
  }
}
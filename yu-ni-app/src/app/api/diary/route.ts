import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

const EMOTION_TAGS = [
  { id: 'happy', label: '开心', icon: '😊', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'sad', label: '难过', icon: '😢', color: 'bg-blue-100 text-blue-600' },
  { id: 'neutral', label: '平静', icon: '😐', color: 'bg-gray-100 text-gray-600' },
  { id: 'anxious', label: '焦虑', icon: '😰', color: 'bg-orange-100 text-orange-600' },
  { id: 'angry', label: '生气', icon: '😠', color: 'bg-red-100 text-red-600' },
  { id: 'excited', label: '兴奋', icon: '🤩', color: 'bg-pink-100 text-pink-600' },
  { id: 'grateful', label: '感恩', icon: '🙏', color: 'bg-green-100 text-green-600' },
  { id: 'tired', label: '疲惫', icon: '😴', color: 'bg-purple-100 text-purple-600' },
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  try {
    const diaries = await prisma.emotionDiary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const stats = {
      total: diaries.length,
      thisWeek: diaries.filter(d => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(d.createdAt) >= weekAgo
      }).length,
      emotionDistribution: EMOTION_TAGS.map(tag => ({
        ...tag,
        count: diaries.filter(d => d.emotionTag === tag.id).length,
      })).filter(e => e.count > 0),
    }

    return new Response(JSON.stringify({
      success: true,
      diaries: diaries.map(d => ({
        id: d.id,
        emotionTag: d.emotionTag,
        content: d.content,
        insight: d.insight,
        createdAt: d.createdAt,
      })),
      stats,
      emotionTags: EMOTION_TAGS,
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取日记失败' }), { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { emotionTag, content, insight } = await request.json()

  if (!content?.trim()) {
    return new Response(JSON.stringify({ error: '内容不能为空' }), { status: 400 })
  }

  try {
    const diary = await prisma.emotionDiary.create({
      data: {
        userId,
        emotionTag: emotionTag || 'neutral',
        content: content.trim(),
        insight: insight?.trim() || null,
      },
    })

    return new Response(JSON.stringify({
      success: true,
      diary: {
        id: diary.id,
        emotionTag: diary.emotionTag,
        content: diary.content,
        insight: diary.insight,
        createdAt: diary.createdAt,
      },
    }), { status: 201 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '创建日记失败' }), { status: 500 })
  }
}
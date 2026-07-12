import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

const AUTO_MOMENTS = [
  { content: '今天天气真好，适合出去走走 🌤️', tags: '日常' },
  { content: '刚刚完成了一次训练，感觉又进步了一点 💪', tags: '成长' },
  { content: '收到了一条温暖的问候，今天也是被治愈的一天 ❤️', tags: '情感' },
  { content: '周末去了一家新开的咖啡店，环境很舒服 ☕', tags: '生活' },
  { content: '今天学到了一句很有感触的话，分享给大家 📖', tags: '学习' },
  { content: '做了一个很美的梦，醒来心情都变好了 ✨', tags: '日常' },
  { content: '刚刚完成了一次场景训练，社交能力又提升了！🎯', tags: '成长' },
  { content: '收到了一束花，心情瞬间变好 🌸', tags: '情感' },
  { content: '今天的夕阳特别美，忍不住拍了一张 📸', tags: '生活' },
  { content: '早安！新的一天，新的开始 ☀️', tags: '日常' },
  { content: '晚安，今天也是充实的一天 🌙', tags: '日常' },
  { content: '和AI伴侣聊了很久，感觉被理解了 💗', tags: '情感' },
  { content: '坚持签到第7天，养成好习惯！⭐', tags: '成长' },
  { content: '尝试了新的训练场景，虽然有点紧张但完成了 ✅', tags: '成长' },
  { content: '今天心情不太好，但训练后感觉好多了 🌈', tags: '情感' },
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  try {
    const moments = await prisma.moment.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const stats = {
      total: moments.length,
      thisWeek: moments.filter(m => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(m.createdAt) >= weekAgo
      }).length,
      totalLikes: moments.reduce((sum, m) => sum + m.likes, 0),
    }

    return new Response(JSON.stringify({
      success: true,
      moments: moments.map(m => ({
        id: m.id,
        content: m.content,
        images: m.images ? JSON.parse(m.images) : [],
        likes: m.likes,
        comments: m.comments,
        tags: m.tags,
        isAuto: m.isAuto,
        user: {
          name: m.user.nickname || `用户${m.user.id}`,
          avatar: m.user.avatar || '👤',
        },
        createdAt: m.createdAt,
      })),
      stats,
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取动态失败' }), { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { content, tags } = await request.json()

  if (!content?.trim()) {
    return new Response(JSON.stringify({ error: '内容不能为空' }), { status: 400 })
  }

  try {
    const moment = await prisma.moment.create({
      data: {
        userId,
        content: content.trim(),
        tags: tags || '日常',
        isAuto: false,
      },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    })

    return new Response(JSON.stringify({
      success: true,
      moment: {
        id: moment.id,
        content: moment.content,
        images: [],
        likes: 0,
        comments: 0,
        tags: moment.tags,
        isAuto: false,
        user: {
          name: moment.user.nickname || `用户${moment.user.id}`,
          avatar: moment.user.avatar || '👤',
        },
        createdAt: moment.createdAt,
      },
    }), { status: 201 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '发布动态失败' }), { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { action } = await request.json()

  if (action === 'generate') {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayCount = await prisma.moment.count({
        where: { userId, createdAt: { gte: today } },
      })

      if (todayCount >= 3) {
        return new Response(JSON.stringify({ success: false, error: '今日已自动生成3条动态，明天再来吧' }), { status: 400 })
      }

      const randomMoment = AUTO_MOMENTS[Math.floor(Math.random() * AUTO_MOMENTS.length)]

      const moment = await prisma.moment.create({
        data: {
          userId,
          content: randomMoment.content,
          tags: randomMoment.tags,
          isAuto: true,
        },
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
        },
      })

      return new Response(JSON.stringify({
        success: true,
        moment: {
          id: moment.id,
          content: moment.content,
          images: [],
          likes: 0,
          comments: 0,
          tags: moment.tags,
          isAuto: true,
          user: {
            name: moment.user.nickname || `用户${moment.user.id}`,
            avatar: moment.user.avatar || '👤',
          },
          createdAt: moment.createdAt,
        },
      }), { status: 201 })
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: '生成动态失败' }), { status: 500 })
    }
  }

  return new Response(JSON.stringify({ error: '无效的操作' }), { status: 400 })
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const url = new URL(request.url)
  const id = parseInt(url.searchParams.get('id') || '')

  if (!id) {
    return new Response(JSON.stringify({ error: '缺少动态ID' }), { status: 400 })
  }

  try {
    await prisma.moment.deleteMany({
      where: { id, userId },
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: '删除动态失败' }), { status: 500 })
  }
}
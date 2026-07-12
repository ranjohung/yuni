import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  try {
    const activePartner = await prisma.partner.findFirst({
      where: { userId, isActive: true },
      include: {
        preferences: { orderBy: { id: 'asc' } },
      },
    })

    if (!activePartner) {
      return new Response(JSON.stringify({ success: false, error: '请先创建伴侣' }), { status: 404 })
    }

    const revealed = activePartner.preferences.filter(p => p.revealed)
    const hidden = activePartner.preferences.filter(p => !p.revealed)

    const affection = await prisma.affection.findUnique({ where: { userId } })
    const revealThreshold = Math.min(5, Math.floor((affection?.score || 0) / 50))

    return new Response(JSON.stringify({
      success: true,
      partner: { id: activePartner.id, name: activePartner.name, avatar: activePartner.avatar },
      preferences: {
        revealed: revealed.map(p => ({
          id: p.id,
          type: p.preferenceType,
          detail: p.preferenceDetail,
          revealedAt: p.revealedAt,
        })),
        hidden: hidden.map(p => ({
          id: p.id,
          type: p.preferenceType,
          hint: getPreferenceHint(p.preferenceType),
          canReveal: revealed.length < revealThreshold,
        })),
      },
      stats: {
        total: activePartner.preferences.length,
        revealed: revealed.length,
        canRevealMore: revealed.length < revealThreshold,
        nextRevealAt: Math.min(250, (revealed.length + 1) * 50),
        affectionScore: affection?.score || 0,
      },
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取喜好信息失败' }), { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { preferenceId } = await request.json()

  try {
    const preference = await prisma.partnerPreference.findUnique({
      where: { id: preferenceId || undefined },
      include: { partner: true },
    })

    if (!preference || preference.partner.userId !== userId) {
      return new Response(JSON.stringify({ success: false, error: '喜好信息不存在' }), { status: 404 })
    }

    const updated = await prisma.partnerPreference.update({
      where: { id: preferenceId },
      data: { revealed: true, revealedAt: new Date() },
    })

    return new Response(JSON.stringify({
      success: true,
      preference: {
        id: updated.id,
        type: updated.preferenceType,
        detail: updated.preferenceDetail,
        revealedAt: updated.revealedAt,
      },
      message: `你发现了伴侣的喜好：${getPreferenceTypeName(updated.preferenceType)} — ${updated.preferenceDetail}`,
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '揭示喜好失败' }), { status: 500 })
  }
}

function getPreferenceHint(type: string): string {
  const hints: Record<string, string> = {
    food: '??? 她喜欢什么味道呢？',
    hobby: '??? 她闲暇时喜欢做什么？',
    music: '??? 她喜欢什么风格的音乐？',
    color: '??? 她的幸运色是什么？',
    place: '??? 她喜欢去哪里？',
    animal: '??? 她喜欢什么小动物？',
  }
  return hints[type] || '??? 还需要更多了解...'
}

function getPreferenceTypeName(type: string): string {
  const names: Record<string, string> = {
    food: '美食偏好',
    hobby: '兴趣爱好',
    music: '音乐品味',
    color: '颜色偏好',
    place: '喜欢的地方',
    animal: '喜欢的动物',
  }
  return names[type] || type
}
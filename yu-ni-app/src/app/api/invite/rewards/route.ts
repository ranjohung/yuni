import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

const REWARD_RULES = [
  { count: 1, points: 100, tickets: 1, label: '首次邀请' },
  { count: 3, points: 300, tickets: 3, label: '邀请3人' },
  { count: 5, points: 500, tickets: 5, label: '邀请5人' },
  { count: 10, points: 1200, tickets: 10, label: '邀请10人' },
  { count: 20, points: 3000, tickets: 20, label: '邀请20人' },
  { count: 50, points: 8000, tickets: 50, label: '邀请50人' },
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  try {
    const invitedCount = await prisma.invitation.count({
      where: { inviterId: userId, status: 'completed' },
    })

    const invitation = await prisma.invitation.findFirst({
      where: { inviterId: userId },
      orderBy: { createdAt: 'desc' },
    })

    const claimedRewards = invitation?.rewardsClaimed
      ? JSON.parse(invitation.rewardsClaimed as string) as number[]
      : []

    const rewards = REWARD_RULES.map(rule => ({
      ...rule,
      achieved: invitedCount >= rule.count,
      claimed: claimedRewards.includes(rule.count),
    }))

    const totalPoints = rewards
      .filter(r => r.achieved && r.claimed)
      .reduce((sum, r) => sum + r.points, 0)

    const totalTickets = rewards
      .filter(r => r.achieved && r.claimed)
      .reduce((sum, r) => sum + r.tickets, 0)

    return new Response(JSON.stringify({
      success: true,
      invitedCount,
      totalPoints,
      totalTickets,
      rewards,
      nextReward: REWARD_RULES.find(r => invitedCount < r.count) || null,
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取奖励信息失败' }), { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { rewardCount } = await request.json()

  try {
    const invitedCount = await prisma.invitation.count({
      where: { inviterId: userId, status: 'completed' },
    })

    const rule = REWARD_RULES.find(r => r.count === rewardCount)
    if (!rule) {
      return new Response(JSON.stringify({ success: false, error: '无效的奖励' }), { status: 400 })
    }

    if (invitedCount < rule.count) {
      return new Response(JSON.stringify({ success: false, error: '未达到邀请人数要求' }), { status: 400 })
    }

    const invitation = await prisma.invitation.findFirst({
      where: { inviterId: userId },
      orderBy: { createdAt: 'desc' },
    })

    const claimedRewards = invitation?.rewardsClaimed
      ? JSON.parse(invitation.rewardsClaimed as string) as number[]
      : []

    if (claimedRewards.includes(rule.count)) {
      return new Response(JSON.stringify({ success: false, error: '该奖励已领取' }), { status: 400 })
    }

    claimedRewards.push(rule.count)

    await prisma.$transaction([
      prisma.invitation.updateMany({
        where: { inviterId: userId },
        data: { rewardsClaimed: JSON.stringify(claimedRewards) },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          points: { increment: rule.points },
          tickets: { increment: rule.tickets },
        },
      }),
    ])

    return new Response(JSON.stringify({
      success: true,
      message: `领取成功！获得${rule.points}积分和${rule.tickets}张穿梭券`,
      points: rule.points,
      tickets: rule.tickets,
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '领取奖励失败' }), { status: 500 })
  }
}
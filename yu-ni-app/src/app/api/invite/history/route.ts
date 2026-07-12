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
    const invitations = await prisma.invitation.findMany({
      where: { inviterId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const history = await Promise.all(
      invitations.map(async (inv) => {
        let inviteeName = null
        if (inv.inviteeId) {
          const invitee = await prisma.user.findUnique({
            where: { id: inv.inviteeId },
            select: { nickname: true, phone: true },
          })
          if (invitee) {
            inviteeName = invitee.nickname || `用户${invitee.phone.slice(-4)}`
          }
        }

        return {
          id: inv.id,
          code: inv.code,
          status: inv.status,
          inviteeName,
          createdAt: inv.createdAt,
        }
      })
    )

    const stats = {
      total: invitations.length,
      completed: invitations.filter(i => i.status === 'completed').length,
      pending: invitations.filter(i => i.status === 'pending').length,
    }

    return new Response(JSON.stringify({
      success: true,
      history,
      stats,
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取邀请记录失败' }), { status: 500 })
  }
}
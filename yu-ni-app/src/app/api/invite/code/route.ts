import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  try {
    let invitation = await prisma.invitation.findFirst({
      where: { inviterId: userId, status: 'pending' },
    })

    if (!invitation) {
      let code = generateInviteCode()
      let exists = await prisma.invitation.findUnique({ where: { code } })
      while (exists) {
        code = generateInviteCode()
        exists = await prisma.invitation.findUnique({ where: { code } })
      }

      invitation = await prisma.invitation.create({
        data: {
          code,
          inviterId: userId,
          status: 'pending',
        },
      })
    }

    const invitedCount = await prisma.invitation.count({
      where: { inviterId: userId, status: 'completed' },
    })

    return new Response(JSON.stringify({
      success: true,
      code: invitation.code,
      createdAt: invitation.createdAt,
      invitedCount,
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取邀请码失败' }), { status: 500 })
  }
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  try {
    let code = generateInviteCode()
    let exists = await prisma.invitation.findUnique({ where: { code } })
    while (exists) {
      code = generateInviteCode()
      exists = await prisma.invitation.findUnique({ where: { code } })
    }

    const invitation = await prisma.invitation.create({
      data: {
        code,
        inviterId: userId,
        status: 'pending',
      },
    })

    return new Response(JSON.stringify({
      success: true,
      code: invitation.code,
    }), { status: 201 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '生成邀请码失败' }), { status: 500 })
  }
}
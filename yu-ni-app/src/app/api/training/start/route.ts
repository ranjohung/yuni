import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { sceneId } = await request.json()

  const scene = await prisma.socialScene.findUnique({ where: { id: sceneId } })
  const affection = await prisma.affection.findUnique({ where: { userId } })

  if (!scene) {
    return new Response(JSON.stringify({ error: '场景不存在' }), { status: 400 })
  }

  if ((affection?.score || 0) < scene.unlockAffection) {
    return new Response(JSON.stringify({ error: '好感度不足，无法解锁此场景' }), { status: 400 })
  }

  const record = await prisma.trainingRecord.create({
    data: {
      userId,
      sceneId,
      status: 0,
      scores: JSON.stringify({}),
    },
  })

  return new Response(JSON.stringify(record), { status: 201 })
}

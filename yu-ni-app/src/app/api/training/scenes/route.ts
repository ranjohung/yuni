import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

const SCENE_EXTRAS: Record<number, { category: string; icon: string; time: string; reward: string }> = {
  1: { category: 'icebreak', icon: '☕', time: '8分钟', reward: '+5' },
  2: { category: 'icebreak', icon: '🎤', time: '10分钟', reward: '+8' },
  3: { category: 'dating', icon: '💕', time: '12分钟', reward: '+10' },
  4: { category: 'dating', icon: '💬', time: '10分钟', reward: '+8' },
  5: { category: 'workplace', icon: '💼', time: '8分钟', reward: '+6' },
  6: { category: 'workplace', icon: '📊', time: '10分钟', reward: '+8' },
  7: { category: 'social', icon: '👥', time: '8分钟', reward: '+5' },
  8: { category: 'social', icon: '⚖️', time: '10分钟', reward: '+8' },
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)

  const [scenes, affection, trainingRecords] = await Promise.all([
    prisma.socialScene.findMany({
      orderBy: { stage: 'asc', difficulty: 'asc' },
    }),
    prisma.affection.findUnique({ where: { userId } }),
    prisma.trainingRecord.findMany({ where: { userId } }),
  ])

  const result = {
    affectionScore: affection?.score || 0,
    scenes: scenes.map((scene) => {
      const extras = SCENE_EXTRAS[scene.id] || { category: 'icebreak', icon: '📋', time: '未知', reward: '+' }
      return {
        id: scene.id,
        name: scene.name,
        description: scene.description,
        difficulty: scene.difficulty,
        stage: scene.stage,
        unlockAffection: scene.unlockAffection,
        ...extras,
      }
    }),
    trainingRecords: trainingRecords.map((record) => ({
      id: record.id,
      sceneId: record.sceneId,
      status: record.status,
    })),
  }

  return new Response(JSON.stringify(result), { status: 200 })
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)

  try {
    const { delta, reason } = await request.json()

    const affection = await prisma.affection.findUnique({
      where: { userId },
    })

    let newScore = (affection?.score || 0) + delta
    newScore = Math.max(0, Math.min(100, newScore))

    const updatedAffection = await prisma.affection.upsert({
      where: { userId },
      update: {
        score: newScore,
      },
      create: {
        userId,
        score: newScore,
      },
    })

    const crisisLevel = newScore < 30 ? 'danger' : newScore < 50 ? 'warning' : 'normal'

    await prisma.relationshipEvent.create({
      data: {
        userId,
        type: delta > 0 ? 'positive' : 'negative',
        reason: reason || '互动',
        affectionChange: delta,
        newScore: newScore,
      },
    })

    return NextResponse.json({
      success: true,
      newScore: newScore,
      crisisLevel,
      message: delta > 0 ? '亲密度提升了！' : '亲密度下降了...',
    })
  } catch (error) {
    console.error('Failed to adjust affection:', error)
    return NextResponse.json({ error: 'Failed to adjust affection' }, { status: 500 })
  }
}
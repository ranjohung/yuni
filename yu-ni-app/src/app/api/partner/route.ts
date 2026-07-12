import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (id) {
    const partner = await prisma.partner.findUnique({
      where: { id: parseInt(id) },
      include: { preferences: true },
    })
    if (!partner || partner.userId !== userId) {
      return new Response(JSON.stringify({ error: 'Partner not found' }), { status: 404 })
    }
    return new Response(JSON.stringify(partner), { status: 200 })
  }

  const partners = await prisma.partner.findMany({
    where: { userId },
    include: { preferences: true },
    orderBy: { createdAt: 'desc' },
  })

  return new Response(JSON.stringify(partners), { status: 200 })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { name, avatar, coreType, personality } = await request.json()

  if (!name) {
    return new Response(JSON.stringify({ error: '请输入伴侣名称' }), { status: 400 })
  }

  const userPartners = await prisma.partner.count({ where: { userId } })
  if (userPartners >= 5) {
    return new Response(JSON.stringify({ error: '最多创建5个伴侣' }), { status: 400 })
  }

  const partner = await prisma.partner.create({
    data: {
      userId,
      name,
      avatar: avatar || '💝',
      coreType: coreType || 'empathetic',
      personality: personality || JSON.stringify({
        openness: 0.7,
        conscientiousness: 0.6,
        extraversion: 0.5,
        agreeableness: 0.8,
        neuroticism: 0.3,
      }),
      isActive: userPartners === 0,
    },
  })

  if (userPartners === 0) {
    await prisma.affection.create({
      data: { userId, score: 0, level: 1 },
    })
  }

  await prisma.chatSession.create({
    data: {
      userId,
      partnerId: partner.id,
    },
  })

  await prisma.partnerPreference.createMany({
    data: [
      { partnerId: partner.id, preferenceType: 'food', preferenceDetail: '甜品' },
      { partnerId: partner.id, preferenceType: 'hobby', preferenceDetail: '阅读' },
      { partnerId: partner.id, preferenceType: 'music', preferenceDetail: '轻音乐' },
    ],
  })

  return new Response(JSON.stringify(partner), { status: 201 })
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { id, name, avatar, coreType } = await request.json()

  if (!id) {
    return new Response(JSON.stringify({ error: '缺少伴侣ID' }), { status: 400 })
  }

  const partner = await prisma.partner.findUnique({ where: { id: parseInt(id) } })
  if (!partner || partner.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Partner not found' }), { status: 404 })
  }

  const updated = await prisma.partner.update({
    where: { id: parseInt(id) },
    data: {
      ...(name && { name }),
      ...(avatar && { avatar }),
      ...(coreType && { coreType }),
    },
  })

  return new Response(JSON.stringify(updated), { status: 200 })
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return new Response(JSON.stringify({ error: '缺少伴侣ID' }), { status: 400 })
  }

  const partner = await prisma.partner.findUnique({ where: { id: parseInt(id) } })
  if (!partner || partner.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Partner not found' }), { status: 404 })
  }

  const userPartners = await prisma.partner.count({ where: { userId } })
  if (userPartners === 1) {
    return new Response(JSON.stringify({ error: '至少保留一个伴侣' }), { status: 400 })
  }

  await prisma.partner.delete({ where: { id: parseInt(id) } })

  const remainingPartners = await prisma.partner.findMany({ where: { userId } })
  if (partner.isActive && remainingPartners.length > 0) {
    await prisma.partner.update({
      where: { id: remainingPartners[0].id },
      data: { isActive: true },
    })
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
}

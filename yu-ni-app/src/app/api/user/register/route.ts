import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  const { phone, password, confirmPassword, nickname } = await request.json()

  if (!phone || !password || !confirmPassword) {
    return new Response(JSON.stringify({ success: false, error: '请填写所有必填项' }), { status: 400 })
  }

  if (password !== confirmPassword) {
    return new Response(JSON.stringify({ success: false, error: '两次密码输入不一致' }), { status: 400 })
  }

  if (password.length < 6) {
    return new Response(JSON.stringify({ success: false, error: '密码长度至少6位' }), { status: 400 })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return new Response(JSON.stringify({ success: false, error: '该手机号已注册' }), { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        nickname: nickname || `用户${phone.slice(-4)}`,
      },
    })

    await prisma.affection.create({
      data: { userId: user.id, score: 0, level: 1 },
    })

    const partner = await prisma.partner.create({
      data: {
        userId: user.id,
        name: '小语',
        avatar: '💝',
        coreType: 'empathetic',
        personality: JSON.stringify({
          openness: 0.7,
          conscientiousness: 0.6,
          extraversion: 0.5,
          agreeableness: 0.8,
          neuroticism: 0.3,
        }),
        isActive: true,
      },
    })

    await prisma.chatSession.create({
      data: {
        userId: user.id,
        partnerId: partner.id,
      },
    })

    await prisma.partnerPreference.createMany({
      data: [
        { partnerId: partner.id, preferenceType: 'food', preferenceDetail: '甜品', revealed: true },
        { partnerId: partner.id, preferenceType: 'hobby', preferenceDetail: '阅读', revealed: true },
        { partnerId: partner.id, preferenceType: 'music', preferenceDetail: '轻音乐', revealed: true },
      ],
    })

    return new Response(JSON.stringify({ success: true, user: { id: user.id, phone: user.phone, nickname: user.nickname } }), { status: 201 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '注册失败，请重试' }), { status: 500 })
  }
}

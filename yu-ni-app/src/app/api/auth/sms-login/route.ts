import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  const { phone, smsCode } = await request.json()

  if (!phone || !smsCode) {
    return new Response(JSON.stringify({ success: false, error: '请填写手机号和验证码' }), { status: 400 })
  }

  if (smsCode !== '123456') {
    return new Response(JSON.stringify({ success: false, error: '验证码错误' }), { status: 400 })
  }

  try {
    let user = await prisma.user.findUnique({
      where: { phone },
    })

    if (!user) {
      // 短信验证码登录自动注册
      const hashedPassword = await bcrypt.hash('sms_user_' + phone, 10)
      user = await prisma.user.create({
        data: {
          phone,
          password: hashedPassword,
          nickname: `用户${phone.slice(-4)}`,
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
        data: { userId: user.id, partnerId: partner.id },
      })

      await prisma.partnerPreference.createMany({
        data: [
          { partnerId: partner.id, preferenceType: 'food', preferenceDetail: '甜品', revealed: true },
          { partnerId: partner.id, preferenceType: 'hobby', preferenceDetail: '阅读', revealed: true },
          { partnerId: partner.id, preferenceType: 'music', preferenceDetail: '轻音乐', revealed: true },
        ],
      })
    }

    return new Response(JSON.stringify({
      success: true,
      user: { id: user.id, phone: user.phone, nickname: user.nickname },
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '登录失败，请重试' }), { status: 500 })
  }
}
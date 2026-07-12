import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const testPhone = '13800138000'
    const testPassword = '123456'
    
    const existingUser = await prisma.user.findUnique({
      where: { phone: testPhone },
    })

    if (existingUser) {
      const hashedPassword = await bcrypt.hash(testPassword, 10)
      await prisma.user.update({
        where: { phone: testPhone },
        data: { password: hashedPassword },
      })
      return new Response(JSON.stringify({ success: true, message: '测试账号密码已重置', phone: testPhone, password: testPassword }), { status: 200 })
    }

    const hashedPassword = await bcrypt.hash(testPassword, 10)

    const user = await prisma.user.create({
      data: {
        phone: testPhone,
        password: hashedPassword,
        nickname: '测试用户',
      },
    })

    await prisma.affection.create({
      data: { userId: user.id, score: 65, level: 1 },
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

    return new Response(JSON.stringify({ success: true, message: '测试账号已创建', phone: testPhone, password: testPassword }), { status: 201 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '创建失败' }), { status: 500 })
  }
}
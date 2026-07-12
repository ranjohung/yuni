import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  const { phone, smsCode, newPassword, confirmPassword } = await request.json()

  if (!phone || !smsCode || !newPassword || !confirmPassword) {
    return new Response(JSON.stringify({ success: false, error: '请填写所有必填项' }), { status: 400 })
  }

  if (smsCode !== '123456') {
    return new Response(JSON.stringify({ success: false, error: '验证码错误' }), { status: 400 })
  }

  if (newPassword !== confirmPassword) {
    return new Response(JSON.stringify({ success: false, error: '两次密码输入不一致' }), { status: 400 })
  }

  if (newPassword.length < 6) {
    return new Response(JSON.stringify({ success: false, error: '密码长度至少6位' }), { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { phone } })

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: '该手机号未注册' }), { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { phone },
      data: { password: hashedPassword },
    })

    return new Response(JSON.stringify({ success: true, message: '密码重置成功' }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '密码重置失败，请重试' }), { status: 500 })
  }
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    const existingUser = await prisma.user.findUnique({ where: { phone } });

    if (existingUser) {
      return NextResponse.json({ error: '用户已存在' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        nickname: `用户${phone.slice(-4)}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
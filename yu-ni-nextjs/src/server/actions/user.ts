'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function registerUser(phone: string, password: string) {
  const existingUser = await prisma.user.findUnique({ where: { phone } });
  
  if (existingUser) {
    throw new Error('用户已存在');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      phone,
      password: hashedPassword,
      nickname: `用户${phone.slice(-4)}`,
    },
  });

  return user;
}

export async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      Partner: true,
      Affection: true,
    },
  });
}

export async function updateUserProfile(userId: string, data: {
  nickname?: string;
  avatarUrl?: string;
}) {
  return await prisma.user.update({
    where: { id: parseInt(userId) },
    data,
  });
}

export async function verifyRealName(userId: string, realName: string, idCard: string) {
  const age = calculateAgeFromIdCard(idCard);
  const isMinor = age < 18;

  return await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      realName,
      idCard,
      age,
      isMinor,
    },
  });
}

function calculateAgeFromIdCard(idCard: string): number {
  const birthYear = parseInt(idCard.slice(6, 10), 10);
  const birthMonth = parseInt(idCard.slice(10, 12), 10);
  const birthDay = parseInt(idCard.slice(12, 14), 10);
  
  const today = new Date();
  let age = today.getFullYear() - birthYear;
  
  if (today.getMonth() < birthMonth - 1 || 
      (today.getMonth() === birthMonth - 1 && today.getDate() < birthDay)) {
    age--;
  }
  
  return age;
}
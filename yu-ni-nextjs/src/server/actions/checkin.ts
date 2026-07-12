'use server';

import { prisma } from '@/lib/prisma';
import { AffectionEngine } from '../engines/affection';

export async function checkIn(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingCheckIn = await prisma.checkIn.findUnique({
    where: { userId_checkInDate: { userId: parseInt(userId), checkInDate: today } },
  });

  if (existingCheckIn) {
    return { success: false, message: '今日已签到', streakCount: existingCheckIn.streakCount };
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayCheckIn = await prisma.checkIn.findUnique({
    where: { userId_checkInDate: { userId: parseInt(userId), checkInDate: yesterday } },
  });

  const streakCount = yesterdayCheckIn ? yesterdayCheckIn.streakCount + 1 : 1;

  await prisma.checkIn.create({
    data: {
      userId: parseInt(userId),
      checkInDate: today,
      streakCount,
    },
  });

  const affectionEngine = new AffectionEngine();
  await affectionEngine.calculateChange(userId, 'daily_login');

  return { success: true, message: '签到成功', streakCount, reward: streakCount * 5 };
}

export async function getCheckInStatus(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCheckIn = await prisma.checkIn.findUnique({
    where: { userId_checkInDate: { userId: parseInt(userId), checkInDate: today } },
  });

  if (todayCheckIn) {
    return { checkedIn: true, streakCount: todayCheckIn.streakCount };
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayCheckIn = await prisma.checkIn.findUnique({
    where: { userId_checkInDate: { userId: parseInt(userId), checkInDate: yesterday } },
  });

  const streakCount = yesterdayCheckIn ? yesterdayCheckIn.streakCount : 0;

  return { checkedIn: false, streakCount };
}

export async function getCheckInHistory(userId: string, limit: number = 7) {
  const records = await prisma.checkIn.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { checkInDate: 'desc' },
    take: limit,
  });

  return records.map(record => ({
    id: record.id.toString(),
    checkInDate: record.checkInDate.toISOString(),
    streakCount: record.streakCount,
    rewardClaimed: record.rewardClaimed,
  }));
}
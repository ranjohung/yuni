'use server';

import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

interface AbilityRadar {
  empathy: number;
  expression: number;
  listening: number;
  confidence: number;
  strategy: number;
}

interface WeeklyReport {
  weekNumber: number;
  totalSimulations: number;
  averageScore: number;
  improvement: number;
  topSkill: string;
  suggestions: string[];
}

export async function getAbilityRadar(userId: string): Promise<AbilityRadar> {
  const records = await prisma.trainingRecord.findMany({
    where: { userId: parseInt(userId) },
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  if (records.length === 0) {
    return { empathy: 50, expression: 50, listening: 50, confidence: 50, strategy: 50 };
  }

  const total = { empathy: 0, expression: 0, listening: 0, confidence: 0, strategy: 0 };

  for (const record of records) {
    const dims = JSON.parse(record.dimensions as string);
    total.empathy += dims.empathy || 0;
    total.expression += dims.expression || 0;
    total.listening += dims.listening || 0;
    total.confidence += dims.confidence || 0;
    total.strategy += dims.strategy || 0;
  }

  const count = records.length;
  return {
    empathy: Math.round(total.empathy / count),
    expression: Math.round(total.expression / count),
    listening: Math.round(total.listening / count),
    confidence: Math.round(total.confidence / count),
    strategy: Math.round(total.strategy / count),
  };
}

export async function getWeeklyReport(userId: string): Promise<WeeklyReport> {
  const now = new Date();
  const weekNumber = Math.ceil((now.getDate() + now.getDay()) / 7);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const weeklyRecords = await prisma.trainingRecord.findMany({
    where: {
      userId: parseInt(userId),
      createdAt: { gte: startOfWeek, lt: endOfWeek },
    },
  });

  const lastWeekStart = new Date(startOfWeek);
  lastWeekStart.setDate(startOfWeek.getDate() - 7);

  const lastWeekRecords = await prisma.trainingRecord.findMany({
    where: {
      userId: parseInt(userId),
      createdAt: { gte: lastWeekStart, lt: startOfWeek },
    },
  });

  const totalSimulations = weeklyRecords.length;
  const weeklyAvg = weeklyRecords.length > 0
    ? weeklyRecords.reduce((sum, r) => sum + r.score, 0) / weeklyRecords.length
    : 0;
  const lastWeekAvg = lastWeekRecords.length > 0
    ? lastWeekRecords.reduce((sum, r) => sum + r.score, 0) / lastWeekRecords.length
    : 0;

  const improvement = lastWeekAvg > 0 ? Math.round(((weeklyAvg - lastWeekAvg) / lastWeekAvg) * 100) : 0;

  const abilities = await getAbilityRadar(userId);
  const topSkill = Object.entries(abilities).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  return {
    weekNumber,
    totalSimulations,
    averageScore: Math.round(weeklyAvg),
    improvement,
    topSkill,
    suggestions: ['继续保持良好的训练习惯', '尝试挑战更高难度的场景', '多复习学习卡片'],
  };
}

export async function getStudyCards(userId: string) {
  const cards = await prisma.studyCard.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
  });

  return cards.map(card => ({
    id: card.id.toString(),
    sceneName: card.sceneName,
    bestResponse: card.bestResponse,
    improvementTips: card.improvementTips,
    skillTags: card.skillTags,
    createdAt: card.createdAt.toISOString(),
  }));
}

export async function getUserStats(userId: string) {
  const [totalSimulations, totalScore, studyCardsCount, chatCount] = await Promise.all([
    prisma.trainingRecord.count({ where: { userId: parseInt(userId) } }),
    prisma.trainingRecord.aggregate({
      where: { userId: parseInt(userId) },
      _avg: { score: true },
    }),
    prisma.studyCard.count({ where: { userId: parseInt(userId) } }),
    redis.get(`chat:count:${userId}`),
  ]);

  return {
    totalSimulations,
    averageScore: Math.round(totalScore._avg.score || 0),
    studyCardsCount,
    chatCount: chatCount ? parseInt(chatCount, 10) : 0,
  };
}

export async function getGrowthHistory(userId: string, limit: number = 20) {
  const records = await prisma.trainingRecord.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      scene: { select: { sceneName: true } },
    },
  });

  return records.map(record => ({
    id: record.id.toString(),
    score: record.score,
    sceneName: record.scene?.sceneName || '',
    dimensions: JSON.parse(record.dimensions as string),
    createdAt: record.createdAt.toISOString(),
  }));
}
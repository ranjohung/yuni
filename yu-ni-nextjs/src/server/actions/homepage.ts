'use server';

import { prisma } from '@/lib/prisma';
import { getCheckInStatus } from './checkin';

export interface WeeklyProgress {
  usedSimulations: number;
  totalSimulations: number;
  percentage: number;
}

export interface RecentTraining {
  id: string;
  sceneName: string;
  score: number;
  createdAt: string;
}

export interface GoodnightPlan {
  hasPlan: boolean;
  planTitle: string;
  planContent: string;
  partnerMood: string;
}

export async function getWeeklyProgress(userId: string): Promise<WeeklyProgress> {
  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
  
  if (!user) {
    return { usedSimulations: 0, totalSimulations: 10, percentage: 0 };
  }

  const used = 10 - (user.weeklySimulations || 0);
  const total = 10;
  const percentage = Math.round((used / total) * 100);

  return { usedSimulations: used, totalSimulations: total, percentage };
}

export async function getRecentTrainings(userId: string, limit: number = 5): Promise<RecentTraining[]> {
  const records = await prisma.trainingRecord.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { scene: true },
  });

  return records.map(record => ({
    id: record.id.toString(),
    sceneName: record.scene?.sceneName || '未知场景',
    score: record.score,
    createdAt: record.createdAt.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
  }));
}

export async function getGoodnightPlan(userId: string): Promise<GoodnightPlan> {
  const [partner, affection] = await Promise.all([
    prisma.partner.findUnique({ where: { userId: parseInt(userId) } }),
    prisma.affection.findUnique({ where: { userId: parseInt(userId) } }),
  ]);

  if (!partner) {
    return {
      hasPlan: false,
      planTitle: '',
      planContent: '',
      partnerMood: '',
    };
  }

  const affectionScore = affection?.score || 0;
  
  let planTitle = '';
  let planContent = '';
  let partnerMood = '';

  if (affectionScore >= 80) {
    planTitle = '甜蜜晚安';
    planContent = '今晚想和你一起看星星，聊聊今天发生的趣事...';
    partnerMood = '开心';
  } else if (affectionScore >= 50) {
    planTitle = '温馨陪伴';
    planContent = '今天辛苦了，好好休息吧，明天又是新的一天';
    partnerMood = '温柔';
  } else {
    planTitle = '晚安问候';
    planContent = '夜深了，早点休息，晚安';
    partnerMood = '平静';
  }

  return {
    hasPlan: true,
    planTitle,
    planContent,
    partnerMood,
  };
}

export interface AbilityStats {
  empathy: number;
  expression: number;
  listening: number;
  confidence: number;
  strategy: number;
}

export async function getAbilityStats(userId: string): Promise<AbilityStats> {
  const records = await prisma.trainingRecord.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (records.length === 0) {
    return { empathy: 60, expression: 60, listening: 60, confidence: 60, strategy: 60 };
  }

  const stats: AbilityStats = { empathy: 0, expression: 0, listening: 0, confidence: 0, strategy: 0 };
  let count = 0;

  records.forEach(record => {
    try {
      const dimensions = JSON.parse(record.dimensions as string);
      stats.empathy += dimensions.empathy || 0;
      stats.expression += dimensions.expression || 0;
      stats.listening += dimensions.listening || 0;
      stats.confidence += dimensions.confidence || 0;
      stats.strategy += dimensions.strategy || 0;
      count++;
    } catch {
    }
  });

  return {
    empathy: Math.round(stats.empathy / count),
    expression: Math.round(stats.expression / count),
    listening: Math.round(stats.listening / count),
    confidence: Math.round(stats.confidence / count),
    strategy: Math.round(stats.strategy / count),
  };
}

export interface HomepageData {
  checkIn: Awaited<ReturnType<typeof getCheckInStatus>>;
  weeklyProgress: WeeklyProgress;
  recentTrainings: RecentTraining[];
  goodnightPlan: GoodnightPlan;
  abilityStats: AbilityStats;
}

export async function getHomepageData(userId: string): Promise<HomepageData> {
  const [checkIn, weeklyProgress, recentTrainings, goodnightPlan, abilityStats] = await Promise.all([
    getCheckInStatus(userId),
    getWeeklyProgress(userId),
    getRecentTrainings(userId),
    getGoodnightPlan(userId),
    getAbilityStats(userId),
  ]);

  return {
    checkIn,
    weeklyProgress,
    recentTrainings,
    goodnightPlan,
    abilityStats,
  };
}
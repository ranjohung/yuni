'use server';

import { prisma } from '@/lib/prisma';
import { AffectionEngine } from '../engines/affection';

interface CreatePartnerData {
  name: string;
  coreType: string;
  relationshipOrigin?: string;
  voiceType?: string;
  extroversion?: number;
  intuition?: number;
  feeling?: number;
  judging?: number;
}

export async function createPartner(userId: string, data: CreatePartnerData) {
  const existingPartner = await prisma.partner.findUnique({ where: { userId: parseInt(userId) } });

  if (existingPartner) {
    throw new Error('用户已创建伴侣');
  }

  const partner = await prisma.partner.create({
    data: {
      userId: parseInt(userId),
      name: data.name,
      coreType: data.coreType,
      relationshipOrigin: data.relationshipOrigin || 'default',
      voiceType: data.voiceType || 'zh-CN-XiaoxiaoNeural',
      extroversion: data.extroversion || 5,
      intuition: data.intuition || 5,
      feeling: data.feeling || 5,
      judging: data.judging || 5,
      personalityTraits: {
        traits: [],
        hobbies: [],
      },
    },
  });

  await prisma.affection.create({
    data: { userId: parseInt(userId) },
  });

  await prisma.chatSession.create({
    data: {
      userId: parseInt(userId),
      sessionType: 'partner',
      messages: [
        {
          role: 'ai',
          content: `你好呀！我是${data.name}，很高兴认识你！😊 以后我们可以一起聊天，共同成长哦~`,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  });

  return partner;
}

export async function getPartner(userId: string) {
  return await prisma.partner.findUnique({ where: { userId: parseInt(userId) } });
}

export async function updatePartner(userId: string, data: Partial<CreatePartnerData>) {
  return await prisma.partner.update({
    where: { userId: parseInt(userId) },
    data: {
      name: data.name,
      coreType: data.coreType,
      relationshipOrigin: data.relationshipOrigin,
      voiceType: data.voiceType,
      extroversion: data.extroversion,
      intuition: data.intuition,
      feeling: data.feeling,
      judging: data.judging,
    },
  });
}

export async function deletePartner(userId: string) {
  await prisma.affection.delete({ where: { userId: parseInt(userId) } });
  return await prisma.partner.delete({ where: { userId: parseInt(userId) } });
}

export async function sendGift(userId: string, giftValue: number) {
  const affectionEngine = new AffectionEngine();
  return await affectionEngine.calculateChange(userId, 'gift', { giftValue });
}

export async function resetAffection(userId: string) {
  return await prisma.affection.update({
    where: { userId: parseInt(userId) },
    data: { score: 0, level: 1, dailyInteractionCount: 0 },
  });
}
'use server';

import { prisma } from '@/lib/prisma';
import { llmProxy } from '@/lib/llm';
import { AffectionEngine } from '../engines/affection';
import { DecisionEngine } from '../engines/decision';
import { EmotionEngine } from '../engines/emotion';
import { redis } from '@/lib/redis';

export async function sendMessage(userId: string, message: string) {
  const affectionEngine = new AffectionEngine();
  const decisionEngine = new DecisionEngine();
  const emotionEngine = new EmotionEngine();

  const [decision] = await Promise.all([
    decisionEngine.getDecision(userId, message, 0),
    emotionEngine.analyzeText(userId, message, 0),
  ]);

  const partner = await prisma.partner.findUnique({ where: { userId: parseInt(userId) } });
  const systemPrompt = partner
    ? `你是${partner.name}，一个${partner.coreType}型人格的AI伴侣。性格特点：外向程度${partner.extroversion}/10，直觉程度${partner.intuition}/10，情感程度${partner.feeling}/10，判断程度${partner.judging}/10。请以这个角色的身份回复用户。`
    : '你是一个AI伴侣，请友好地回复用户。';

  const response = await llmProxy.request(userId, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message },
  ]);

  const newMessages = [
    { role: 'user', content: message },
    { role: 'assistant', content: response.content },
  ];

  const existingSession = await prisma.chatSession.findFirst({
    where: { userId: parseInt(userId), sessionType: 'partner' },
    orderBy: { createdAt: 'desc' },
  });

  if (existingSession) {
    const currentMessages = typeof existingSession.messages === 'string' 
      ? JSON.parse(existingSession.messages) 
      : existingSession.messages;
    const updatedMessages = [...currentMessages, ...newMessages];
    await prisma.chatSession.update({
      where: { id: existingSession.id },
      data: { messages: JSON.stringify(updatedMessages) },
    });
  } else {
    await prisma.chatSession.create({
      data: {
        userId: parseInt(userId),
        sessionType: 'partner',
        messages: JSON.stringify(newMessages),
      },
    });
  }

  await affectionEngine.calculateChange(userId, 'chat_message');

  await redis.incr(`chat:count:${userId}`);

  return {
    content: response.content,
    emotionType: decision.emotionType,
    triggerMode: decision.triggerMode,
  };
}

export async function getChatHistory(userId: string, limit: number = 20) {
  const sessions = await prisma.chatSession.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return sessions.map(session => ({
    id: session.id.toString(),
    messages: typeof session.messages === 'string' ? JSON.parse(session.messages) : session.messages,
    createdAt: session.createdAt.toISOString(),
  }));
}

export async function createChatSession(userId: string, sessionType: string = 'partner') {
  return await prisma.chatSession.create({
    data: {
      userId: parseInt(userId),
      sessionType,
      messages: JSON.stringify([]),
    },
  });
}

export async function getChatCount(userId: string): Promise<number> {
  const count = await redis.get(`chat:count:${userId}`);
  return count ? parseInt(count, 10) : 0;
}
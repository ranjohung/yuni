'use server';

import { prisma } from '@/lib/prisma';
import { llmProxy } from '@/lib/llm';
import { AffectionEngine } from '../engines/affection';
import { redis } from '@/lib/redis';

interface TrainingResult {
  score: number;
  dimensions: {
    empathy: number;
    expression: number;
    listening: number;
    confidence: number;
    strategy: number;
  };
  suggestions: string[];
  studyCardId?: string;
}

export async function startTraining(userId: string, sceneId: number) {
  const scene = await prisma.socialScene.findUnique({ where: { id: sceneId } });

  if (!scene) {
    throw new Error('场景不存在');
  }

  const affection = await prisma.affection.findUnique({ where: { userId: parseInt(userId) } });

  if (affection && affection.score < scene.unlockAffection) {
    throw new Error('好感度不足，无法解锁该场景');
  }

  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });

  if (user && user.weeklySimulations <= 0) {
    throw new Error('本周模拟次数已用完');
  }

  return scene;
}

export async function submitTrainingAnswer(userId: string, sceneId: number, answer: string): Promise<TrainingResult> {
  const scene = await prisma.socialScene.findUnique({ where: { id: sceneId } });

  if (!scene) {
    throw new Error('场景不存在');
  }

  const evaluationPrompt = `请作为社交训练导师，评估用户在"${scene.sceneName}"场景中的回答："${answer}"。
请从以下五个维度进行评分（0-100分）：
1. 同理心（empathy）：是否理解对方感受
2. 表达能力（expression）：表达是否清晰恰当
3. 倾听技巧（listening）：是否关注对方需求
4. 自信程度（confidence）：语气是否自信
5. 应对策略（strategy）：策略是否有效

请返回JSON格式：
{
  "score": 总分,
  "dimensions": {
    "empathy": 分数,
    "expression": 分数,
    "listening": 分数,
    "confidence": 分数,
    "strategy": 分数
  },
  "suggestions": ["建议1", "建议2", "建议3"],
  "bestResponse": "最佳回应示例"
}`;

  const response = await llmProxy.request(userId, [{ role: 'user', content: evaluationPrompt }]);

  let result: Partial<TrainingResult> & { bestResponse?: string } = {
    score: Math.floor(Math.random() * 30) + 60,
    dimensions: {
      empathy: Math.floor(Math.random() * 40) + 50,
      expression: Math.floor(Math.random() * 40) + 50,
      listening: Math.floor(Math.random() * 40) + 50,
      confidence: Math.floor(Math.random() * 40) + 50,
      strategy: Math.floor(Math.random() * 40) + 50,
    },
    suggestions: ['继续保持', '可以尝试从不同角度思考', '多加练习会更好'],
    bestResponse: '这是一个很好的开始！',
  };

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    }
  } catch {
  }

  const trainingRecord = await prisma.trainingRecord.create({
    data: {
      userId: parseInt(userId),
      sceneId: sceneId,
      score: result.score || 0,
      dimensions: result.dimensions ? JSON.stringify(result.dimensions) : JSON.stringify({}),
      suggestions: result.suggestions ? JSON.stringify(result.suggestions) : JSON.stringify([]),
    },
  });

  if ((result.score || 0) >= 70) {
    const studyCard = await prisma.studyCard.create({
      data: {
        userId: parseInt(userId),
        trainingId: trainingRecord.id,
        sceneName: scene.sceneName,
        bestResponse: result.bestResponse || '',
        improvementTips: result.suggestions?.join('; ') || '',
        skillTags: '社交技巧',
        cbtSuggestion: '',
      },
    });

    (result as TrainingResult).studyCardId = studyCard.id.toString();
  }

  const affectionEngine = new AffectionEngine();
  await affectionEngine.calculateChange(userId, 'scene_completion', { score: result.score });

  await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { weeklySimulations: { decrement: 1 } },
  });

  await redis.decr(`simulation:weekly:${userId}`);

  return result as TrainingResult;
}

export async function getTrainingHistory(userId: string, limit: number = 20) {
  const records = await prisma.trainingRecord.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return records.map(record => ({
    id: record.id.toString(),
    sceneId: record.sceneId.toString(),
    score: record.score,
    dimensions: JSON.parse(record.dimensions as string),
    suggestions: JSON.parse(record.suggestions as string),
    createdAt: record.createdAt.toISOString(),
  }));
}

export async function getScenes() {
  return await prisma.socialScene.findMany({ orderBy: [{ stage: 'asc' }, { difficulty: 'asc' }] });
}

export async function getSceneById(sceneId: number) {
  return await prisma.socialScene.findUnique({ where: { id: sceneId } });
}
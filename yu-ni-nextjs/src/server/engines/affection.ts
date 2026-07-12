import { prisma } from '@/lib/prisma';

type ActionType = 'daily_login' | 'chat_message' | 'voice_call' | 'gift' | 'scene_completion';

export class AffectionEngine {
  async calculateChange(userId: string, actionType: ActionType, metadata?: Record<string, unknown>) {
    const affection = await prisma.affection.findUnique({ where: { userId: parseInt(userId) } });
    
    if (!affection) {
      await prisma.affection.create({
        data: { userId: parseInt(userId) },
      });
      return { change: 0, newScore: 0, newLevel: 1 };
    }

    let change = 0;

    const rules: Record<ActionType, () => number> = {
      daily_login: () => 5,
      chat_message: () => affection.dailyInteractionCount >= 20 ? 0 : 1,
      voice_call: () => metadata?.durationMinutes ? 5 * Number(metadata.durationMinutes) : 0,
      gift: () => metadata?.giftValue ? Number(metadata.giftValue) : 0,
      scene_completion: () => metadata?.score ? Math.floor(10 * Number(metadata.score) / 100) : 0,
    };

    change = rules[actionType]?.() || 0;

    const newScore = Math.min(affection.score + change, 2000);
    const newLevel = this.calculateLevel(newScore);

    await prisma.affection.update({
      where: { userId: parseInt(userId) },
      data: {
        score: newScore,
        level: newLevel,
        dailyInteractionCount: actionType === 'chat_message' ? affection.dailyInteractionCount + 1 : affection.dailyInteractionCount,
      },
    });

    return { change, newScore, newLevel };
  }

  calculateLevel(score: number): number {
    if (score >= 1000) return 5;
    if (score >= 600) return 4;
    if (score >= 300) return 3;
    if (score >= 100) return 2;
    return 1;
  }

  async getAffection(userId: string) {
    return await prisma.affection.findUnique({ where: { userId: parseInt(userId) } });
  }

  async resetDailyInteraction(userId: string) {
    await prisma.affection.update({
      where: { userId: parseInt(userId) },
      data: { dailyInteractionCount: 0 },
    });
  }
}
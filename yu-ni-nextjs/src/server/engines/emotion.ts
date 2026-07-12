import { prisma } from '@/lib/prisma';

export type EmotionType = 'neutral' | 'positive' | 'negative' | 'high_negative' | 'recovery' | 'treehole';
export type TriggerMode = 'treehole' | 'suggestion' | 'mixed' | 'force_treehole';

const POSITIVE_KEYWORDS = ['开心', '高兴', '快乐', '幸福', '满足', '兴奋', '感谢', '喜欢', '爱', '美好', '顺利', '成功', '棒', '赞'];
const NEGATIVE_KEYWORDS = ['难过', '伤心', '失望', '焦虑', '紧张', '害怕', '担心', '压力', '烦躁', '生气', '愤怒', '委屈', '孤独', '无助'];
const HIGH_NEGATIVE_KEYWORDS = ['绝望', '想死', '自杀', '崩溃', '受不了', '放弃', '活不下去', '痛苦'];
const RECOVERY_KEYWORDS = ['好多了', '想开了', '没事了', '放下了', '释怀', '调整', '振作'];

export class EmotionEngine {
  private keywordMatch(text: string, keywords: string[]): number {
    let count = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        count++;
      }
    }
    return count;
  }

  async analyzeText(userId: string, text: string, membershipType: number): Promise<{ type: EmotionType; score: number }> {
    let emotionType: EmotionType = 'neutral';
    let emotionScore = 0;

    if (membershipType === 0) {
      const highNegativeCount = this.keywordMatch(text, HIGH_NEGATIVE_KEYWORDS);
      const negativeCount = this.keywordMatch(text, NEGATIVE_KEYWORDS);
      const positiveCount = this.keywordMatch(text, POSITIVE_KEYWORDS);
      const recoveryCount = this.keywordMatch(text, RECOVERY_KEYWORDS);

      if (highNegativeCount > 0) {
        emotionType = 'high_negative';
        emotionScore = 80 + highNegativeCount * 5;
      } else if (negativeCount > positiveCount) {
        emotionType = 'negative';
        emotionScore = 40 + negativeCount * 10;
      } else if (positiveCount > negativeCount) {
        emotionType = 'positive';
        emotionScore = 60 + positiveCount * 10;
      } else if (recoveryCount > 0) {
        emotionType = 'recovery';
        emotionScore = 50 + recoveryCount * 10;
      }
    } else {
      emotionType = this.simulateBERTResult(text);
      emotionScore = Math.floor(Math.random() * 50) + 30;
    }

    await prisma.emotionRecord.create({
      data: {
        userId: parseInt(userId),
        emotionType,
        emotionScore,
        context: text.slice(0, 100),
        source: 'text',
      },
    });

    return { type: emotionType, score: emotionScore };
  }

  private simulateBERTResult(text: string): EmotionType {
    const negativeScore = NEGATIVE_KEYWORDS.filter(k => text.includes(k)).length;
    const positiveScore = POSITIVE_KEYWORDS.filter(k => text.includes(k)).length;
    const highNegativeScore = HIGH_NEGATIVE_KEYWORDS.filter(k => text.includes(k)).length;

    if (highNegativeScore > 0) return 'high_negative';
    if (negativeScore >= 3) return 'high_negative';
    if (negativeScore > positiveScore) return 'negative';
    if (positiveScore > negativeScore) return 'positive';
    return 'neutral';
  }

  async analyzeBehavior(userId: string): Promise<{ score: number; trend: 'up' | 'down' | 'stable' }> {
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    
    if (!user) {
      return { score: 50, trend: 'stable' };
    }

    let behaviorScore = 50;

    if (user.dailyUsageSeconds > 3600) {
      behaviorScore -= 20;
    } else if (user.dailyUsageSeconds < 300) {
      behaviorScore += 10;
    }

    const checkIns = await prisma.checkIn.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { checkInDate: 'desc' },
      take: 7,
    });

    if (checkIns.length >= 5) {
      behaviorScore += 15;
    }

    const trainingCount = await prisma.trainingRecord.count({
      where: { userId: parseInt(userId) },
    });

    if (trainingCount > 0) {
      behaviorScore += 10;
    }

    return { 
      score: Math.min(100, Math.max(0, behaviorScore)), 
      trend: behaviorScore >= 60 ? 'up' : behaviorScore <= 40 ? 'down' : 'stable' 
    };
  }

  async analyzeVoice(userId: string, audioFeatures: { 
    speakingRate: number; 
    volume: number; 
    pitch: number; 
    stability: number;
  }): Promise<{ type: EmotionType; score: number }> {
    let emotionType: EmotionType = 'neutral';
    let emotionScore = 50;

    if (audioFeatures.speakingRate > 180) {
      emotionType = 'negative';
      emotionScore += 20;
    } else if (audioFeatures.speakingRate < 100) {
      emotionType = 'neutral';
      emotionScore -= 10;
    }

    if (audioFeatures.volume > 80) {
      emotionScore += 15;
    } else if (audioFeatures.volume < 40) {
      emotionScore -= 15;
    }

    if (audioFeatures.stability < 0.5) {
      emotionType = 'negative';
      emotionScore += 15;
    }

    await prisma.emotionRecord.create({
      data: {
        userId: parseInt(userId),
        emotionType,
        emotionScore,
        context: JSON.stringify(audioFeatures),
        source: 'voice',
      },
    });

    return { type: emotionType, score: Math.min(100, emotionScore) };
  }
}
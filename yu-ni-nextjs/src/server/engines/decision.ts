import { EmotionEngine, EmotionType, TriggerMode } from './emotion';

export class DecisionEngine {
  private emotionEngine: EmotionEngine;

  constructor() {
    this.emotionEngine = new EmotionEngine();
  }

  async getDecision(userId: string, text: string, membershipType: number): Promise<{
    emotionType: EmotionType;
    triggerMode: TriggerMode;
    confidence: number;
  }> {
    const textResult = await this.emotionEngine.analyzeText(userId, text, membershipType);
    const behaviorResult = await this.emotionEngine.analyzeBehavior(userId);

    const textWeight = 0.5;
    const behaviorWeight = 0.2;
    const voiceWeight = 0.3;

    const voiceScore = 50;

    const finalScore = (textResult.score * textWeight) + (behaviorResult.score * behaviorWeight) + (voiceScore * voiceWeight);

    const emotionType = this.determineEmotionType(textResult.type, finalScore);
    const triggerMode = this.determineTriggerMode(emotionType, membershipType);

    return {
      emotionType,
      triggerMode,
      confidence: Math.floor((finalScore / 100) * 100),
    };
  }

  private determineEmotionType(textType: EmotionType, finalScore: number): EmotionType {
    if (textType === 'high_negative') return 'high_negative';
    if (textType === 'recovery') return 'recovery';
    
    if (finalScore >= 70) return 'positive';
    if (finalScore >= 50) return 'neutral';
    if (finalScore >= 30) return 'negative';
    return 'high_negative';
  }

  private determineTriggerMode(emotionType: EmotionType, membershipType: number): TriggerMode {
    if (emotionType === 'high_negative') {
      return 'force_treehole';
    }

    if (emotionType === 'negative') {
      if (membershipType >= 2) {
        return 'mixed';
      }
      return 'treehole';
    }

    if (emotionType === 'positive') {
      return 'suggestion';
    }

    if (emotionType === 'recovery') {
      return 'mixed';
    }

    return 'suggestion';
  }
}
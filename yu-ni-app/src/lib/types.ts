export interface UserSession {
  id: string
  phone: string
  nickname?: string
  membershipType: number
}

declare module 'next-auth' {
  interface Session {
    user: UserSession
  }
}

export interface Partner {
  id: number
  userId: number
  name: string
  avatar: string
  coreType: string
  personality: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  voiceId?: string
}

export interface Affection {
  userId: number
  score: number
  level: number
}

export interface ChatMessage {
  id: number
  sessionId: number
  role: 'user' | 'assistant'
  content: string
  emotionType?: string
  emotionScore?: number
  nvcSentence: boolean
  isRetroactive: boolean
  createdAt: Date
}

export interface GiftItem {
  id: number
  name: string
  category?: string
  tier: number
  pricePoints: number
  priceRmb?: number
  membershipRequired: number
  affectionMin: number
  affectionMax: number
  adUnlockable: boolean
  imageUrl?: string
  compatiblePersonality?: string[]
}

export interface SocialScene {
  id: number
  name: string
  description: string
  difficulty: number
  stage: number
  unlockAffection: number
  options: { label: string; value: string; quality: 'safe' | 'good' | 'cold' }[]
}

export type CompanionMode = 'treehole' | 'suggestion' | 'hybrid' | 'forced_treehole'

export type MembershipType = 0 | 1 | 2 | 3

export const MEMBERSHIP_LABELS: Record<MembershipType, string> = {
  0: '免费版',
  1: '周卡会员',
  2: '月卡会员',
  3: '年卡会员',
}

export const AFFECTION_LEVELS = [
  { level: 1, minScore: 0, maxScore: 99, name: '初识' },
  { level: 2, minScore: 100, maxScore: 299, name: '熟悉' },
  { level: 3, minScore: 300, maxScore: 599, name: '亲密' },
  { level: 4, minScore: 600, maxScore: 999, name: '默契' },
  { level: 5, minScore: 1000, maxScore: Infinity, name: '灵魂伴侣' },
]

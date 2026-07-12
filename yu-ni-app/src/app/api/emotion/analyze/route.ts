import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

const EMOTION_KEYWORDS: Record<string, { keywords: string[]; weight: number }[]> = {
  anxiety: [
    { keywords: ['担心', '害怕', '紧张', '焦虑', '慌', '压力大', '睡不着', '失眠'], weight: 0.8 },
    { keywords: ['不安', '烦躁', '坐立不安', '心慌', '恐惧'], weight: 0.7 },
    { keywords: ['胡思乱想', '想太多', '纠结'], weight: 0.5 },
  ],
  sadness: [
    { keywords: ['难过', '伤心', '失落', '绝望', '没希望', '想哭', '哭'], weight: 0.8 },
    { keywords: ['孤独', '寂寞', '没人理解', '被抛弃'], weight: 0.7 },
    { keywords: ['郁闷', '低沉', '不开心'], weight: 0.5 },
  ],
  anger: [
    { keywords: ['生气', '气死了', '烦', '受不了', '凭什么', '愤怒'], weight: 0.7 },
    { keywords: ['讨厌', '恶心', '厌恶', '烦躁'], weight: 0.6 },
    { keywords: ['不满', '不爽', '火大'], weight: 0.5 },
  ],
  fear: [
    { keywords: ['怕', '不敢', '恐惧', '吓人', '完了', '死定了', '可怕'], weight: 0.8 },
    { keywords: ['紧张', '发抖', '冒冷汗', '退缩'], weight: 0.6 },
  ],
 委屈: [
    { keywords: ['委屈', '冤枉', '不公平', '凭什么是我', '明明'], weight: 0.7 },
  ],
  happiness: [
    { keywords: ['开心', '高兴', '好棒', '太好了', '幸福', '快乐'], weight: 0.6 },
    { keywords: ['满足', '感动', '温暖', '欣慰', '期待'], weight: 0.5 },
  ],
  calm: [
    { keywords: ['还好', '还行', '一般', '没事', '正常', '淡定'], weight: 0.3 },
  ],
}

function analyzeTextEmotion(text: string): { emotion: string; intensity: number; confidence: number } {
  let maxScore = 0
  let detectedEmotion = 'calm'
  let emotionScores: Record<string, number> = {}

  for (const [emotion, patterns] of Object.entries(EMOTION_KEYWORDS)) {
    let score = 0
    for (const pattern of patterns) {
      for (const keyword of pattern.keywords) {
        if (text.includes(keyword)) {
          score += pattern.weight
        }
      }
    }
    if (score > 0) {
      emotionScores[emotion] = score
    }
    if (score > maxScore) {
      maxScore = score
      detectedEmotion = emotion
    }
  }

  const intensity = Math.min(maxScore, 1)
  const confidence = Math.min(0.4 + maxScore * 0.4, 0.95)

  return { emotion: detectedEmotion, intensity, confidence }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { text, sourceType, sessionType } = await request.json()

  if (!text?.trim()) {
    return new Response(JSON.stringify({ error: '文本不能为空' }), { status: 400 })
  }

  try {
    const result = analyzeTextEmotion(text)

    await prisma.emotionRecord.create({
      data: {
        id: `emo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId,
        sessionType: sessionType || 'chat',
        sourceType: sourceType || 'text',
        rawText: text.slice(0, 500),
        emotionPrimary: result.emotion,
        intensity: result.intensity,
        confidence: result.confidence,
        polarity: result.intensity > 0.6 ? 'negative' : result.intensity > 0.3 ? 'neutral' : 'positive',
        triggerMode: result.intensity > 0.7 ? 'forced_treehole' : result.intensity > 0.4 ? 'hybrid' : 'suggestion',
      },
    })

    return new Response(JSON.stringify({
      success: true,
      emotion: result.emotion,
      intensity: result.intensity,
      confidence: result.confidence,
      companionMode: result.intensity > 0.7 ? 'treehole' : result.intensity > 0.4 ? 'hybrid' : 'suggestion',
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '情绪分析失败' }), { status: 500 })
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100)

  try {
    const records = await prisma.emotionRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        emotionPrimary: true,
        intensity: true,
        polarity: true,
        createdAt: true,
        triggerMode: true,
      },
    })

    const trend = records.reduce((acc: Record<string, number>, r) => {
      const date = new Date(r.createdAt).toLocaleDateString('zh-CN')
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    return new Response(JSON.stringify({
      success: true,
      records,
      trend: Object.entries(trend).map(([date, count]) => ({ date, count })),
      recentEmotion: records.length > 0 ? records[0].emotionPrimary : 'calm',
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '获取情绪历史失败' }), { status: 500 })
  }
}
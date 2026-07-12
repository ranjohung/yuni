import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'

const DISTORTION_PATTERNS = [
  {
    type: '灾难化思维',
    description: '把事情想象得比实际更糟',
    keywords: ['肯定失败', '完蛋了', '彻底完了', '没救了', '死定了', '最差的', '无法挽回'],
    suggestion: '试着用更客观的眼光看待这件事，问问自己：最坏的情况真的会发生吗？概率有多大？',
  },
  {
    type: '过度概括',
    description: '一次失败代表永远失败',
    keywords: ['总是', '从不', '永远', '每次都', '所有人', '没人', '从来没有'],
    suggestion: '一次的经历不代表全部。试着找出反例：有没有什么时候情况是不同的？',
  },
  {
    type: '个人化',
    description: '把责任都归咎于自己',
    keywords: ['都是我的错', '都怪我', '是我不好', '是我害的', '全怪我'],
    suggestion: '事情的结果往往由多种因素决定，不全是你的责任。试着列出其他可能的原因。',
  },
  {
    type: '非黑即白',
    description: '认为事情只有两种极端',
    keywords: ['要么', '不然就', '不是...就是', '完美', '彻底', '完全', '绝对'],
    suggestion: '大多数事情都不是非黑即白的。试着寻找中间地带和灰色区域。',
  },
  {
    type: '情绪推理',
    description: '用感受代替事实',
    keywords: ['我感觉自己', '我觉得我', '感到自己', '觉得自己', '认为自己'],
    suggestion: '感受不等于事实。试着把"我感觉"和"事实是"分开来看。',
  },
  {
    type: '读心术',
    description: '假设知道别人在想什么',
    keywords: ['他们一定', '他肯定', '大家觉得', '别人认为', '所有人都觉得', 'ta一定'],
    suggestion: '我们无法真正知道别人在想什么。试着直接沟通或寻找客观证据。',
  },
  {
    type: '应该陈述',
    description: '对自己或他人设定不合理的期望',
    keywords: ['应该', '必须', '不得不', '一定得'],
    suggestion: '"应该"往往来自外部期望。试着把"我应该"换成"我选择"或"我希望"。',
  },
]

function analyzeThought(thought: string, situation: string): {
  distortions: { type: string; description: string; suggestion: string }[]
  confidence: number
} {
  const combinedText = `${situation} ${thought}`
  const detected: { type: string; description: string; suggestion: string }[] = []

  for (const pattern of DISTORTION_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (combinedText.includes(keyword)) {
        detected.push({
          type: pattern.type,
          description: pattern.description,
          suggestion: pattern.suggestion,
        })
        break
      }
    }
  }

  const confidence = Math.min(0.5 + detected.length * 0.15, 0.95)

  return { distortions: detected, confidence }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { thought, situation } = await request.json()

  if (!thought?.trim()) {
    return new Response(JSON.stringify({ error: '想法不能为空' }), { status: 400 })
  }

  try {
    const result = analyzeThought(thought, situation || '')

    return new Response(JSON.stringify({
      success: true,
      distortions: result.distortions,
      confidence: result.confidence,
      hasDistortions: result.distortions.length > 0,
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '分析失败' }), { status: 500 })
  }
}
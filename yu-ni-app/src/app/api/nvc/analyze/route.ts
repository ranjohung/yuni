import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'

const EVALUATION_WORDS = ['态度很差', '很不好', '总是', '从不', '应该', '每次', '故意', '老是']
const FEELING_WORDS = ['感到', '感觉', '觉得', '感受']
const FEELING_LIST = ['受伤', '难过', '生气', '委屈', '失望', '孤独', '焦虑', '害怕', '开心', '满足', '感动', '温暖', '疲惫', '压力', '尴尬', '无助', '被忽视', '被尊重', '被理解', '被接纳']
const NEED_LIST = ['被尊重', '被理解', '被接纳', '被认可', '安全', '信任', '自主', '平等', '诚实', '陪伴', '支持', '倾听', '空间', '合作', '意义', '成长', '休息', '自由', '表达', '参与']

function isObservation(input: string): { valid: boolean; message: string; suggestion?: string } {
  const hasEvaluation = EVALUATION_WORDS.some(word => input.includes(word))
  if (hasEvaluation) {
    return {
      valid: false,
      message: '这是评价，不是观察',
      suggestion: '试试改成客观描述，描述具体看到或听到的事实，例如：\n· "当你提高音量说话时"\n· "当你没有回复我的消息时"\n· "当我看到你皱着眉头时"',
    }
  }
  return { valid: true, message: '很好！这是客观的观察，只描述了具体事实' }
}

function isFeeling(input: string): { valid: boolean; message: string; suggestion?: string } {
  const hasFeelingWord = FEELING_WORDS.some(word => input.includes(word))
  const matchedFeeling = FEELING_LIST.find(f => input.includes(f))

  if (!hasFeelingWord && !matchedFeeling) {
    return {
      valid: false,
      message: '这更像是想法，不是感受',
      suggestion: '试试用"我感到..."来表达真实的感受，例如：\n· "我感到受伤"\n· "我感到孤独"\n· "我感到焦虑"',
    }
  }
  return { valid: true, message: '很好！你表达了真实的感受' }
}

function isNeed(input: string): { valid: boolean; message: string; suggestion?: string } {
  const matchedNeed = NEED_LIST.find(n => input.includes(n))
  if (!matchedNeed) {
    return {
      valid: false,
      message: '试着更明确地表达你的需要',
      suggestion: '常见需要包括：被尊重、被理解、被接纳、安全、信任、陪伴、支持、倾听、空间等',
    }
  }
  return { valid: true, message: `很好！你表达了"${matchedNeed}"的需要` }
}

function isRequest(input: string): { valid: boolean; message: string; suggestion?: string } {
  if (!input.includes('你愿意') && !input.includes('可以') && !input.includes('能不能') && !input.includes('好吗')) {
    return {
      valid: false,
      message: '请求需要具体且可操作',
      suggestion: '试试用"你愿意...吗？"或"可以...吗？"的句式，例如：\n· "你愿意下次先用平和的语气和我说吗？"\n· "可以给我一些时间消化一下吗？"',
    }
  }
  if (input.length < 6) {
    return {
      valid: false,
      message: '请求太简短了，试着更具体一些',
      suggestion: '描述具体的行动，让对方知道该怎么做',
    }
  }
  return { valid: true, message: '很好！这是一个具体可行的请求' }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { step, input } = await request.json()

  if (!input?.trim()) {
    return new Response(JSON.stringify({ error: '输入不能为空' }), { status: 400 })
  }

  try {
    let result

    switch (step) {
      case 'observation':
        result = isObservation(input)
        break
      case 'feeling':
        result = isFeeling(input)
        break
      case 'need':
        result = isNeed(input)
        break
      case 'request':
        result = isRequest(input)
        break
      case 'full':
        result = {
          valid: true,
          message: 'NVC句子已生成！',
          fullSentence: input,
        }
        break
      default:
        return new Response(JSON.stringify({ error: '无效的步骤' }), { status: 400 })
    }

    return new Response(JSON.stringify({
      success: true,
      valid: result.valid,
      feedback: result.message,
      suggestion: result.suggestion,
    }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: '分析失败' }), { status: 500 })
  }
}
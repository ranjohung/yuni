import type { ChatMessage } from './llmConfig'

export interface ClassificationResult {
  primaryProvider: string
  reason: string
  alternatives: string[]
  priority: 'empathy' | 'speed' | 'accuracy' | 'general'
}

const EMOTION_KEYWORDS = [
  '难过', '伤心', '焦虑', '紧张', '害怕', '担心', '孤独', '委屈', '压抑',
  '烦躁', '生气', '崩溃', '绝望', '无助', '迷茫', '不自信', '自卑',
  'sad', 'anxious', 'scared', 'lonely', 'angry', 'depressed', 'hopeless',
  'worried', 'nervous', 'upset', 'stressed', 'tired',
]

const LEARNING_KEYWORDS = [
  '怎么', '如何', '方法', '技巧', '练习', '训练', '学习', '提高', '提升',
  '建议', '帮助', '指导', '教', '不懂', '不会', '怎么办', '该怎么做',
  'how', 'what should', 'tips', 'advice', 'practice', 'learn', 'improve',
  'suggestion', 'guide', 'help',
]

const TRAINING_KEYWORDS = [
  '场景', '模拟', '面试', '汇报', '社交', '破冰', '沟通', '对话',
  '表白', '道歉', '拒绝', '冲突', '误会', '尴尬', '冷场',
  'interview', 'presentation', 'social', 'communication', 'conversation',
  'practice', 'roleplay', 'scenario',
]

const QUICK_KEYWORDS = [
  '你好', '嗨', 'hi', 'hello', '在吗', '是的', '好的', '对', '嗯', '哦',
  'ok', 'okay', 'yes', 'no', 'yep', 'nope', 'thanks', '谢谢',
]

const COMPLEX_KEYWORDS = [
  '为什么', '分析', '原因', '本质', '逻辑', '关系', '影响', '结果',
  '比较', '区别', '联系', '原理', '机制', '趋势', '规律',
  'why', 'analyze', 'reason', 'cause', 'effect', 'compare',
  'difference', 'relationship', 'principle', 'mechanism',
]

export function classifyQuery(messages: ChatMessage[]): ClassificationResult {
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null
  const text = lastMessage?.content || ''
  const allText = messages.map(m => m.content).join(' ')

  const textToCheck = `${text} ${allText}`.toLowerCase()

  const emotionScore = countMatches(textToCheck, EMOTION_KEYWORDS)
  const learningScore = countMatches(textToCheck, LEARNING_KEYWORDS)
  const trainingScore = countMatches(textToCheck, TRAINING_KEYWORDS)
  const quickScore = countMatches(textToCheck, QUICK_KEYWORDS)
  const complexScore = countMatches(textToCheck, COMPLEX_KEYWORDS)

  const isShortMessage = text.length < 20

  if (emotionScore >= 2 || (emotionScore >= 1 && text.length > 10)) {
    return {
      primaryProvider: 'gemini',
      reason: '检测到情绪表达，Gemini共情能力更强',
      alternatives: ['deepseek', 'groq', 'ollama'],
      priority: 'empathy',
    }
  }

  if (complexScore >= 2 || (complexScore >= 1 && text.length > 30)) {
    return {
      primaryProvider: 'gemini',
      reason: '涉及复杂推理和分析，Gemini推理能力更强',
      alternatives: ['deepseek', 'groq', 'ollama'],
      priority: 'accuracy',
    }
  }

  if (learningScore >= 2 || trainingScore >= 1) {
    return {
      primaryProvider: 'deepseek',
      reason: '涉及学习/训练，DeepSeek中文指导能力更强',
      alternatives: ['gemini', 'groq', 'ollama'],
      priority: 'accuracy',
    }
  }

  if (isShortMessage && quickScore >= 1) {
    return {
      primaryProvider: 'groq',
      reason: '简短对话，Groq响应速度最快',
      alternatives: ['deepseek', 'gemini', 'ollama'],
      priority: 'speed',
    }
  }

  const hasChinese = /[\u4e00-\u9fff]/.test(text)
  if (hasChinese) {
    return {
      primaryProvider: 'deepseek',
      reason: '中文对话，DeepSeek中文能力最优',
      alternatives: ['gemini', 'groq', 'ollama'],
      priority: 'general',
    }
  }

  return {
    primaryProvider: 'deepseek',
    reason: '通用对话，默认使用DeepSeek',
    alternatives: ['gemini', 'groq', 'ollama'],
    priority: 'general',
  }
}

function countMatches(text: string, keywords: string[]): number {
  return keywords.filter(keyword => text.includes(keyword)).length
}
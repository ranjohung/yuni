import type { ChatMessage } from './llmConfig'

export interface ClassificationResult {
  primaryProvider: string
  reason: string
  alternatives: string[]
  priority: 'empathy' | 'speed' | 'accuracy' | 'general'
  category: 'emotion' | 'learning' | 'training' | 'complex' | 'quick' | 'general' | 'creative' | 'social'
}

const EMOTION_KEYWORDS = [
  '难过', '伤心', '焦虑', '紧张', '害怕', '担心', '孤独', '委屈', '压抑',
  '烦躁', '生气', '崩溃', '绝望', '无助', '迷茫', '不自信', '自卑',
  '受伤', '心痛', '心碎', '失落', '空虚', '疲惫', '沮丧', '抑郁',
  'sad', 'anxious', 'scared', 'lonely', 'angry', 'depressed', 'hopeless',
  'worried', 'nervous', 'upset', 'stressed', 'tired', 'hurt', 'broken',
]

const LEARNING_KEYWORDS = [
  '怎么', '如何', '方法', '技巧', '练习', '训练', '学习', '提高', '提升',
  '建议', '帮助', '指导', '教', '不懂', '不会', '怎么办', '该怎么做',
  'how', 'what should', 'tips', 'advice', 'practice', 'learn', 'improve',
  'suggestion', 'guide', 'help', 'tutorial', 'step',
]

const TRAINING_KEYWORDS = [
  '场景', '模拟', '面试', '汇报', '社交', '破冰', '沟通', '对话',
  '表白', '道歉', '拒绝', '冲突', '误会', '尴尬', '冷场',
  'interview', 'presentation', 'social', 'communication', 'conversation',
  'practice', 'roleplay', 'scenario', '演练', '实战',
]

const QUICK_KEYWORDS = [
  '你好', '嗨', 'hi', 'hello', '在吗', '是的', '好的', '对', '嗯', '哦',
  'ok', 'okay', 'yes', 'no', 'yep', 'nope', 'thanks', '谢谢', '好',
  '早安', '晚安', '再见', '拜拜', 'bye', '哈哈', '嗯嗯',
]

const COMPLEX_KEYWORDS = [
  '为什么', '分析', '原因', '本质', '逻辑', '关系', '影响', '结果',
  '比较', '区别', '联系', '原理', '机制', '趋势', '规律',
  'why', 'analyze', 'reason', 'cause', 'effect', 'compare',
  'difference', 'relationship', 'principle', 'mechanism', 'explain',
]

const CREATIVE_KEYWORDS = [
  '故事', '写诗', '写歌', '创作', '创意', '想象', '如果', '假如',
  '假设', '幻想', '梦想', '未来', 'story', 'poem', 'creative',
  'imagine', 'what if', 'suppose', 'dream', 'future',
]

const SOCIAL_KEYWORDS = [
  '朋友', '同事', '家人', '恋人', '约会', '相亲', '聚会', '团建',
  '社交', '交友', '认识', '搭讪', '聊天', '话题', 'friend', 'date',
  'social', 'party', 'gathering', 'meetup', 'network',
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
  const creativeScore = countMatches(textToCheck, CREATIVE_KEYWORDS)
  const socialScore = countMatches(textToCheck, SOCIAL_KEYWORDS)

  const isShortMessage = text.length < 20

  // 情感支持 - 优先使用Gemini（共情能力强）
  if (emotionScore >= 2 || (emotionScore >= 1 && text.length > 10)) {
    return {
      primaryProvider: 'gemini',
      reason: '检测到情绪表达，Gemini共情能力更强',
      alternatives: ['deepseek', 'groq', 'ollama'],
      priority: 'empathy',
      category: 'emotion',
    }
  }

  // 复杂推理 - 优先使用Gemini
  if (complexScore >= 2 || (complexScore >= 1 && text.length > 30)) {
    return {
      primaryProvider: 'gemini',
      reason: '涉及复杂推理和分析，Gemini推理能力更强',
      alternatives: ['deepseek', 'groq', 'ollama'],
      priority: 'accuracy',
      category: 'complex',
    }
  }

  // 创意类 - 优先使用Gemini
  if (creativeScore >= 2) {
    return {
      primaryProvider: 'gemini',
      reason: '涉及创意内容，Gemini创造力更强',
      alternatives: ['deepseek', 'groq', 'ollama'],
      priority: 'accuracy',
      category: 'creative',
    }
  }

  // 学习/训练 - 优先使用DeepSeek（中文指导能力强）
  if (learningScore >= 2 || trainingScore >= 1) {
    return {
      primaryProvider: 'deepseek',
      reason: '涉及学习/训练，DeepSeek中文指导能力更强',
      alternatives: ['gemini', 'groq', 'ollama'],
      priority: 'accuracy',
      category: trainingScore >= 1 ? 'training' : 'learning',
    }
  }

  // 社交类 - 使用DeepSeek
  if (socialScore >= 2) {
    return {
      primaryProvider: 'deepseek',
      reason: '社交话题，DeepSeek中文社交建议更自然',
      alternatives: ['gemini', 'groq', 'ollama'],
      priority: 'accuracy',
      category: 'social',
    }
  }

  // 简短对话 - 优先使用Groq（响应速度最快）
  if (isShortMessage && quickScore >= 1) {
    return {
      primaryProvider: 'groq',
      reason: '简短对话，Groq响应速度最快',
      alternatives: ['deepseek', 'gemini', 'ollama'],
      priority: 'speed',
      category: 'quick',
    }
  }

  // 中文对话 - 默认使用DeepSeek
  const hasChinese = /[\u4e00-\u9fff]/.test(text)
  if (hasChinese) {
    return {
      primaryProvider: 'deepseek',
      reason: '中文对话，DeepSeek中文能力最优',
      alternatives: ['gemini', 'groq', 'ollama'],
      priority: 'general',
      category: 'general',
    }
  }

  return {
    primaryProvider: 'deepseek',
    reason: '通用对话，默认使用DeepSeek',
    alternatives: ['gemini', 'groq', 'ollama'],
    priority: 'general',
    category: 'general',
  }
}

function countMatches(text: string, keywords: string[]): number {
  return keywords.filter(keyword => text.includes(keyword)).length
}
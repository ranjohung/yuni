'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Sparkles, ArrowLeft, Check, Star, Zap, MessageCircle } from 'lucide-react'

const AVATARS = ['💝', '🌸', '🌙', '⭐', '🦋', '🌈', '🍀', '🎀', '💎', '🐰', '🦄', '🍭', '🌺', '🍎', '🐱', '🐶']
const CORE_TYPES = [
  { value: 'empathetic', label: '共情型', desc: '温柔体贴，善于倾听', icon: '❤️' },
  { value: 'supportive', label: '支持型', desc: '坚定可靠，给予力量', icon: '💪' },
  { value: 'playful', label: '活泼型', desc: '开朗活泼，充满活力', icon: '✨' },
  { value: 'wisdom', label: '智慧型', desc: '成熟稳重，富有见解', icon: '🧠' },
]

const BACKGROUND_STORIES = [
  { id: 'childhood', label: '青梅竹马', desc: '从小一起长大的好朋友', icon: '🏠' },
  { id: 'school', label: '校园邂逅', desc: '在校园里偶然相遇', icon: '🎓' },
  { id: 'work', label: '职场同事', desc: '工作中认识的伙伴', icon: '💼' },
  { id: 'online', label: '网络相遇', desc: '在虚拟世界中相识', icon: '🌐' },
]

interface PersonalitySlider {
  key: string
  label: string
  min: number
  max: number
  step: number
  value: number
}

export default function CreatePartnerPage() {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('💝')
  const [coreType, setCoreType] = useState('empathetic')
  const [backgroundStory, setBackgroundStory] = useState('childhood')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [personality, setPersonality] = useState<PersonalitySlider[]>([
    { key: 'openness', label: '开放性', min: 0, max: 100, step: 5, value: 70 },
    { key: 'conscientiousness', label: '责任心', min: 0, max: 100, step: 5, value: 60 },
    { key: 'extraversion', label: '外向性', min: 0, max: 100, step: 5, value: 50 },
    { key: 'agreeableness', label: '宜人性', min: 0, max: 100, step: 5, value: 80 },
    { key: 'neuroticism', label: '情绪稳定性', min: 0, max: 100, step: 5, value: 30 },
  ])

  const router = useRouter()

  const handleSliderChange = (key: string, value: number) => {
    setPersonality(prev => prev.map(item => 
      item.key === key ? { ...item, value } : item
    ))
  }

  const getPersonalityDescription = () => {
    const avg = personality.reduce((sum, p) => sum + p.value, 0) / personality.length
    if (avg >= 70) return '性格开朗，善于与人交往'
    if (avg >= 50) return '性格温和，平易近人'
    return '性格内敛，善于思考'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim()) {
      setError('请输入伴侣名称')
      return
    }

    setIsLoading(true)

    const personalityData = personality.reduce((acc, item) => {
      acc[item.key] = item.value / 100
      return acc
    }, {} as Record<string, number>)

    try {
      const response = await fetch('/api/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          avatar,
          coreType,
          personality: JSON.stringify(personalityData),
          title: BACKGROUND_STORIES.find(s => s.id === backgroundStory)?.label || '新朋友',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '创建失败')
      } else {
        setShowSuccess(true)
        setTimeout(() => {
          router.push('/partner')
        }, 2000)
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-200">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">创建成功！</h2>
          <p className="text-gray-500">你的新伴侣已就绪，快去和TA聊天吧~</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-lg mx-auto p-4 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">创建新伴侣</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">选择一个头像</p>
            <div className="flex flex-wrap justify-center gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                    avatar === emoji
                      ? 'ring-2 ring-primary-500 ring-offset-2 scale-110 bg-primary-50'
                      : 'hover:scale-105 hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">伴侣名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="给你的伴侣起个名字"
              maxLength={12}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">最多12个字符</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">关系背景</label>
            <div className="grid grid-cols-2 gap-2">
              {BACKGROUND_STORIES.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setBackgroundStory(story.id)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    backgroundStory === story.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{story.icon}</span>
                    <span className="font-medium text-sm">{story.label}</span>
                  </div>
                  <div className="text-xs opacity-80 mt-1">{story.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">核心类型</label>
            <div className="grid grid-cols-2 gap-2">
              {CORE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setCoreType(type.value)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    coreType === type.value
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span className="font-medium text-sm">{type.label}</span>
                  </div>
                  <div className="text-xs opacity-80 mt-1">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">性格倾向</label>
            <div className="space-y-3">
              {personality.map((item) => (
                <div key={item.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="text-primary-500 font-medium">{item.value}</span>
                  </div>
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={item.value}
                    onChange={(e) => handleSliderChange(item.key, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-primary-50 rounded-lg">
              <p className="text-xs text-primary-600">
                <Star className="w-3 h-3 inline mr-1" />
                {getPersonalityDescription()}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-xl hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                创建伴侣
              </>
            )}
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">关于伴侣</p>
                <p className="text-xs text-gray-500 mt-1">
                  每个伴侣都有独特的性格和喜好，随着你们的互动，你会逐渐了解他们的内心世界。
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">提升好感度</p>
                <p className="text-xs text-gray-500 mt-1">
                  经常聊天、送礼物和互动训练可以增加好感度，解锁更多专属内容。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">真实对话</p>
                <p className="text-xs text-gray-500 mt-1">
                  你的伴侣会根据性格和喜好做出不同的回应，体验真实的社交互动。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
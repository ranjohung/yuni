'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Star, Sparkles, ArrowRight, Check, Zap, User, Smile, Music, BookOpen } from 'lucide-react'
import Navbar from '@/components/Navbar'

const PRESET_PARTNERS = [
  { id: 'qinghuan', name: '沈清欢', avatar: '👩', personality: '温柔体贴', desc: '建筑设计师，追寻者内核' },
  { id: 'beichen', name: '陆北辰', avatar: '👨', personality: '沉稳可靠', desc: '急诊医生，守护者内核' },
  { id: 'xinghe', name: '顾星河', avatar: '🧑', personality: '浪漫自由', desc: '自由摄影师，流浪者内核' },
  { id: 'nian', name: '苏念', avatar: '👩‍🦰', personality: '善解人意', desc: '心理咨询师，疗愈者内核' },
]

const AVATARS = ['👤', '👩', '👨', '👧', '👦', '🧑', '👱', '👸', '🤴', '🧙', '🧝', '🧛', '🧟', '🤖', '👽', '👾']

const FEATURES = [
  {
    icon: Star,
    title: 'AI数字人',
    desc: '与高拟真数字人实时互动，沉浸式社交体验',
    color: 'from-pink-500 to-pink-400',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-500',
  },
  {
    icon: Zap,
    title: '社交训练',
    desc: '在零压力环境中练习沟通技巧，提升自信',
    color: 'from-purple-500 to-purple-400',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
  {
    icon: Heart,
    title: '情感陪伴',
    desc: '温柔体贴的AI伴侣，随时倾听你的心声',
    color: 'from-pink-400 to-purple-400',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-500',
  },
]

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null)
  const [nickname, setNickname] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('👤')

  const totalSteps = 4

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStart = async () => {
    const partner = selectedPartner ? PRESET_PARTNERS.find(p => p.id === selectedPartner) : null
    
    try {
      // 创建伴侣
      await fetch('/api/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: partner?.name || '小语',
          avatar: partner?.avatar || '💝',
          coreType: 'empathetic',
          personality: partner?.personality || '温柔体贴',
          occupation: partner?.desc?.split('，')[0] || 'AI伴侣',
          title: '青梅竹马',
        }),
      })

      // 更新用户昵称
      await fetch('/api/user/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname || '用户' }),
      })

      localStorage.setItem('yn_onboarding', JSON.stringify({ completed: true, completedAt: new Date().toISOString() }))
      router.push('/partner')
    } catch {
      localStorage.setItem('yn_onboarding', JSON.stringify({ completed: true, completedAt: new Date().toISOString() }))
      router.push('/partner')
    }
  }

  const getPartnerById = (id: string) => PRESET_PARTNERS.find(p => p.id === id)

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            index === currentStep
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 w-8'
              : index < currentStep
              ? 'bg-pink-300'
              : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )

  const renderWelcomeStep = () => (
    <div className="flex flex-col items-center text-center px-6 py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-pink-200">
        <Heart className="w-10 h-10 text-white" />
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-3">
        欢迎来到「与你」
      </h1>
      <p className="text-gray-500 mb-8 max-w-xs">
        你的专属AI社交模拟训练平台，在温暖陪伴中成长为更好的自己
      </p>

      <div className="space-y-3 w-full max-w-sm mb-8">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={index}
              className={`flex items-start gap-4 p-4 rounded-2xl ${feature.bgColor} transition-all hover:shadow-md`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{feature.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={handleNext}
        className="w-full max-w-sm bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3.5 rounded-2xl font-semibold text-lg shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
      >
        开始设置
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  )

  const renderPartnerStep = () => (
    <div className="flex flex-col px-6 py-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-7 h-7 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">选择你的伴侣</h2>
        <p className="text-gray-500 text-sm">选择一位你感兴趣的AI伙伴，开始你们的旅程</p>
      </div>

      <div className="space-y-3 flex-1">
        {PRESET_PARTNERS.map((partner) => {
          const isSelected = selectedPartner === partner.id
          return (
            <button
              key={partner.id}
              onClick={() => setSelectedPartner(partner.id)}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                isSelected
                  ? 'border-pink-500 bg-pink-50 shadow-md shadow-pink-100'
                  : 'border-gray-100 bg-white hover:border-pink-200 hover:bg-pink-50/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                  isSelected ? 'bg-pink-100' : 'bg-gray-50'
                }`}>
                  {partner.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 text-lg">{partner.name}</h3>
                    <span className="text-xs bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 px-2 py-0.5 rounded-full">
                      {partner.personality}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{partner.desc}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-pink-500 bg-pink-500'
                    : 'border-gray-300'
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handlePrev}
          className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
        >
          上一步
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedPartner}
          className={`flex-1 py-3.5 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            selectedPartner
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200 hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          下一步
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  const renderNicknameStep = () => (
    <div className="flex flex-col px-6 py-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smile className="w-7 h-7 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">设置你的资料</h2>
        <p className="text-gray-500 text-sm">给自己取一个昵称，选一个喜欢的头像</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            你的昵称
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="输入你的昵称..."
              maxLength={12}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-gray-800 placeholder:text-gray-400"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5 ml-1">
            {nickname.length}/12 字符
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            选择头像
          </label>
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setSelectedAvatar(avatar)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-200 ${
                  selectedAvatar === avatar
                    ? 'bg-gradient-to-br from-pink-500 to-purple-500 shadow-md shadow-pink-200 scale-110'
                    : 'bg-gray-50 hover:bg-pink-50 hover:scale-105'
                }`}
              >
                <span className={selectedAvatar === avatar ? 'brightness-0 invert' : ''}>
                  {avatar}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={handlePrev}
          className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
        >
          上一步
        </button>
        <button
          onClick={handleNext}
          disabled={!nickname.trim()}
          className={`flex-1 py-3.5 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            nickname.trim()
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200 hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          下一步
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  const renderCompleteStep = () => {
    const partner = selectedPartner ? getPartnerById(selectedPartner) : null
    return (
      <div className="flex flex-col items-center text-center px-6 py-8">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-pink-200 animate-bounce">
          <Sparkles className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          恭喜完成设置！🎉
        </h1>
        <p className="text-gray-500 mb-8">
          一切准备就绪，让我们一起开启这段温暖的旅程
        </p>

        <div className="w-full max-w-sm space-y-3 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-pink-500" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400">你的昵称</p>
                  <p className="font-semibold text-gray-800">{nickname || '用户'}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-2xl">
                {selectedAvatar}
              </div>
            </div>
          </div>

          {partner && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-pink-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400">你的伴侣</p>
                    <p className="font-semibold text-gray-800">{partner.name}</p>
                  </div>
                </div>
                <span className="text-2xl">{partner.avatar}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span className="bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">{partner.personality}</span>
                <span className="text-gray-300">|</span>
                <span>{partner.desc}</span>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BookOpen className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-bold text-gray-800">50+</span>
                </div>
                <p className="text-xs text-gray-500">训练场景</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MessageCircle className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-bold text-gray-800">无限</span>
                </div>
                <p className="text-xs text-gray-500">自由对话</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Music className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-bold text-gray-800">24/7</span>
                </div>
                <p className="text-xs text-gray-500">随时陪伴</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full max-w-sm bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3.5 rounded-2xl font-semibold text-lg shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
        >
          开始你的第一次训练
          <Zap className="w-5 h-5" />
        </button>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep()
      case 1:
        return renderPartnerStep()
      case 2:
        return renderNicknameStep()
      case 3:
        return renderCompleteStep()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-lg mx-auto min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          {renderStep()}
        </div>
        {currentStep < totalSteps - 1 && renderStepIndicator()}
      </div>
    </div>
  )
}
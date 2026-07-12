'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import { Heart, MessageCircle, Gift, Settings, Plus, Trash2, CheckCircle2, Edit3, ArrowRight, Camera, Sparkles, Calendar, AlertTriangle, Zap, Clock, Shield, XCircle } from 'lucide-react'

interface Partner {
  id: number
  name: string
  avatar: string
  coreType: string
  personality: string
  occupation: string
  title: string
  isActive: boolean
  preferences: { preferenceType: string; preferenceDetail: string; revealed: boolean }[]
  moments: string
  createdAt: string
  affection: number
}

const CORE_TYPE_LABELS: Record<string, string> = {
  empathetic: '共情型',
  supportive: '支持型',
  playful: '活泼型',
  wisdom: '智慧型',
  ISTJ: '实干家',
  ISFJ: '守护者',
  INFJ: '倡导者',
  INTJ: '建筑师',
}

export default function PartnerPage() {
  const { data: session, status } = useSession()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [affection, setAffection] = useState(65)

  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchPartners()
      fetchHomeData()
    }
  }, [status])

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partner')
      const data = await response.json()
      if (Array.isArray(data)) {
        setPartners(data)
        setSelectedPartner(data.find(p => p.isActive) || data[0] || null)
      }
    } catch (err) {
      console.error('Failed to fetch partners:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchHomeData = async () => {
    try {
      const response = await fetch('/api/user/home-data')
      const data = await response.json()
      if (data?.affection !== undefined) {
        setAffection(data.affection)
      }
    } catch (err) {
      console.error('Failed to fetch home data:', err)
    }
  }

  const handleSwitchPartner = async (partnerId: number) => {
    try {
      const response = await fetch('/api/partner/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      })

      if (response.ok) {
        await fetchPartners()
        router.push('/chat')
      }
    } catch (err) {
      console.error('Failed to switch partner:', err)
    }
  }

  const handleDeletePartner = async (partnerId: number) => {
    if (!confirm('确定要删除这个伴侣吗？')) return

    setIsDeleting(partnerId)
    try {
      const response = await fetch(`/api/partner?id=${partnerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchPartners()
      }
    } catch (err) {
      console.error('Failed to delete partner:', err)
    } finally {
      setIsDeleting(null)
    }
  }

  const getRevealedPreferences = (prefs: Partner['preferences']) => {
    return prefs.filter(p => p.revealed)
  }

  const getUnrevealedCount = (prefs: Partner['preferences']) => {
    return prefs.filter(p => !p.revealed).length
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar currentPage="partner" />
      <div className="max-w-lg mx-auto p-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">我的伴侣</h1>
          <button
            onClick={() => router.push('/partner/create')}
            className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-medium rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>

        {selectedPartner && (
          <div className="bg-gradient-to-br from-primary-500 to-secondary-600 rounded-3xl p-6 text-white shadow-lg mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                {selectedPartner.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-xl">{selectedPartner.name}</h3>
                  {selectedPartner.isActive && (
                    <span className="px-2 py-0.5 bg-white/20 text-xs rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      当前
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm mb-2">{selectedPartner.title} · {selectedPartner.occupation}</p>
                <p className="text-white/70 text-xs">{selectedPartner.personality}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/80">亲密度</span>
                <span>{affection}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className={`h-3 rounded-full transition-all duration-500 ${affection < 30 ? 'bg-red-400' : affection < 60 ? 'bg-yellow-400' : 'bg-white'}`} style={{ width: `${affection}%` }} />
              </div>
            </div>

            {affection < 50 && (
              <div className={`mt-4 p-4 rounded-xl ${affection < 30 ? 'bg-red-500/30' : 'bg-yellow-500/20'} backdrop-blur-sm`}>
                <div className="flex items-center gap-2 mb-2">
                  {affection < 30 ? (
                    <XCircle className="w-5 h-5 text-red-300" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-300" />
                  )}
                  <span className={`font-bold ${affection < 30 ? 'text-red-200' : 'text-yellow-200'}`}>
                    {affection < 30 ? '关系危机' : '关系冷淡'}
                  </span>
                </div>
                <p className="text-white/80 text-sm mb-3">
                  {affection < 30 ? '伴侣对你的好感度已经很低了，如果不及时采取行动，你们的关系可能会破裂。' : '伴侣感觉有些孤单，快多陪陪TA吧！'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => router.push('/chat')}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
                  >
                    <MessageCircle className="w-3 h-3" />
                    主动聊天
                  </button>
                  <button
                    onClick={() => router.push('/gifts')}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
                  >
                    <Gift className="w-3 h-3" />
                    送礼物
                  </button>
                  <button
                    onClick={() => router.push('/training')}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
                  >
                    <Zap className="w-3 h-3" />
                    互动训练
                  </button>
                </div>
              </div>
            )}

            {affection >= 80 && (
              <div className="mt-4 p-4 bg-green-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-green-300" />
                  <span className="font-bold text-green-200">亲密无间</span>
                </div>
                <p className="text-white/80 text-sm">
                  你们的关系非常好！继续保持互动，解锁更多专属回忆吧~
                </p>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => router.push('/chat')}
                className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                聊天
              </button>
              <button
                onClick={() => router.push('/gifts')}
                className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Gift className="w-4 h-4" />
                送礼物
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className={`bg-white rounded-2xl shadow-sm p-4 transition-all cursor-pointer ${
                selectedPartner?.id === partner.id ? 'ring-2 ring-primary-500' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedPartner(partner)}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-3xl">
                    {partner.avatar}
                  </div>
                  {partner.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{partner.name}</h3>
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full">
                      {CORE_TYPE_LABELS[partner.coreType] || partner.coreType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {partner.occupation} · {partner.personality}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(partner.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push('/chat') }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeletePartner(partner.id) }}
                    disabled={isDeleting === partner.id || partners.length <= 1}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors disabled:opacity-30"
                  >
                    {isDeleting === partner.id ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500" />
                    )}
                  </button>
                </div>
              </div>

              {partner.moments && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">{partner.moments}</p>
                  </div>
                </div>
              )}

              {selectedPartner?.id === partner.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSwitchPartner(partner.id) }}
                      className="flex flex-col items-center gap-1 p-2 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary-500" />
                      <span className="text-xs text-gray-600">设为当前</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push('/chat') }}
                      className="flex flex-col items-center gap-1 p-2 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-secondary-500" />
                      <span className="text-xs text-gray-600">发消息</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push('/gifts') }}
                      className="flex flex-col items-center gap-1 p-2 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
                    >
                      <Gift className="w-5 h-5 text-pink-500" />
                      <span className="text-xs text-gray-600">送礼物</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation() }}
                      className="flex flex-col items-center gap-1 p-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <Camera className="w-5 h-5 text-blue-500" />
                      <span className="text-xs text-gray-600">合影</span>
                    </button>
                  </div>

                  {getRevealedPreferences(partner.preferences).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">已发现的喜好</p>
                      <div className="flex flex-wrap gap-2">
                        {getRevealedPreferences(partner.preferences).map((pref, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded-full flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {pref.preferenceDetail}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {partners.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">还没有伴侣</p>
            <button
              onClick={() => router.push('/partner/create')}
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              创建第一个伴侣
            </button>
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">伴侣小贴士</h2>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4">
              <Heart className="w-8 h-8 text-primary-500 mb-2" />
              <p className="text-sm font-medium text-gray-700">提升好感度</p>
              <p className="text-xs text-gray-500 mt-1">经常聊天和送礼物可以增加好感度</p>
            </div>
            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-4">
              <Gift className="w-8 h-8 text-secondary-500 mb-2" />
              <p className="text-sm font-medium text-gray-700">发现喜好</p>
              <p className="text-xs text-gray-500 mt-1">了解伴侣的喜好能送出更贴心的礼物</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

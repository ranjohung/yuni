'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Heart, Search, Lock, Unlock, Sparkles, ArrowLeft, Star, Music, Coffee, BookOpen, Palette, MapPin, Dog } from 'lucide-react'

interface PreferenceItem {
  id: number
  type: string
  detail?: string
  hint?: string
  revealedAt?: string
  canReveal?: boolean
}

interface PartnerInfo {
  id: number
  name: string
  avatar: string
}

interface Stats {
  total: number
  revealed: number
  canRevealMore: boolean
  nextRevealAt: number
  affectionScore: number
}

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; bgColor: string; iconColor: string }> = {
  food: { icon: Coffee, label: '美食偏好', bgColor: 'bg-orange-50', iconColor: 'text-orange-500' },
  hobby: { icon: Heart, label: '兴趣爱好', bgColor: 'bg-green-50', iconColor: 'text-green-500' },
  music: { icon: Music, label: '音乐品味', bgColor: 'bg-purple-50', iconColor: 'text-purple-500' },
  color: { icon: Palette, label: '颜色偏好', bgColor: 'bg-pink-50', iconColor: 'text-pink-500' },
  place: { icon: MapPin, label: '喜欢的地方', bgColor: 'bg-blue-50', iconColor: 'text-blue-500' },
  animal: { icon: Dog, label: '喜欢的动物', bgColor: 'bg-yellow-50', iconColor: 'text-yellow-500' },
}

export default function PreferencePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [partner, setPartner] = useState<PartnerInfo | null>(null)
  const [revealedPrefs, setRevealedPrefs] = useState<PreferenceItem[]>([])
  const [hiddenPrefs, setHiddenPrefs] = useState<PreferenceItem[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, revealed: 0, canRevealMore: false, nextRevealAt: 50, affectionScore: 0 })
  const [loading, setLoading] = useState(true)
  const [revealingId, setRevealingId] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/preference')
      const data = await response.json()
      if (data.success) {
        setPartner(data.partner)
        setRevealedPrefs(data.preferences.revealed)
        setHiddenPrefs(data.preferences.hidden)
        setStats(data.stats)
      }
    } catch (err) {
      console.error('获取喜好信息失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReveal = async (preferenceId: number) => {
    setRevealingId(preferenceId)
    try {
      const response = await fetch('/api/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferenceId }),
      })
      if (response.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('揭示喜好失败:', err)
    } finally {
      setRevealingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${year}年${month}月${day}日 ${hours}:${minutes}`
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const affectionScore = stats.affectionScore
  const nextThreshold = stats.nextRevealAt
  const progressPercent = Math.min(100, nextThreshold > 0 ? (affectionScore / nextThreshold) * 100 : 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <Navbar currentPage="preference" />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">伴侣喜好</h1>
        </div>

        {/* 伴侣信息 + 好感度进度 */}
        {partner && (
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-6 text-white shadow-lg mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                {partner.avatar}
              </div>
              <div>
                <h2 className="font-bold text-lg">{partner.name}</h2>
                <p className="text-white/80 text-sm">探索她的内心世界</p>
              </div>
            </div>

            {/* 好感度进度条 */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  好感度
                </span>
                <span className="text-white font-medium">{affectionScore}分</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-white/60 text-xs mt-2">
                每50分好感度可揭示一个新喜好
                {stats.revealed < 5 && stats.total > 0 && (
                  <> · 还需 {Math.max(0, nextThreshold - affectionScore)} 分可揭示下一个</>
                )}
              </p>
            </div>
          </div>
        )}

        {/* 探索进度统计 */}
        {stats.total > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <span className="font-medium text-gray-700">探索进度</span>
              </div>
              <span className="text-sm text-gray-500">
                <span className="text-pink-500 font-bold">{stats.revealed}</span>
                /{stats.total}
                {' '}已揭示
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(stats.revealed / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 已揭示的喜好 */}
        {revealedPrefs.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Unlock className="w-5 h-5 text-green-500" />
              已揭示的喜好
            </h3>
            <div className="space-y-3">
              {revealedPrefs.map((pref) => {
                const config = TYPE_CONFIG[pref.type] || { icon: Heart, label: pref.type, bgColor: 'bg-gray-50', iconColor: 'text-gray-500' }
                const Icon = config.icon
                return (
                  <div key={pref.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">{config.label}</span>
                        </div>
                        <p className="text-gray-800 font-medium mt-1 truncate">{pref.detail}</p>
                        {pref.revealedAt && (
                          <p className="text-xs text-gray-400 mt-1">{formatDate(pref.revealedAt)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 待揭示的喜好 */}
        {hiddenPrefs.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              待揭示的喜好
            </h3>
            <div className="space-y-3">
              {hiddenPrefs.map((pref) => {
                const config = TYPE_CONFIG[pref.type] || { icon: Heart, label: pref.type, bgColor: 'bg-gray-50', iconColor: 'text-gray-500' }
                const Icon = config.icon
                const canReveal = pref.canReveal && stats.canRevealMore
                return (
                  <div key={pref.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-dashed border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 opacity-60`}>
                        <Icon className={`w-6 h-6 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-400">{config.label}</span>
                        </div>
                        <p className="text-gray-400 font-medium mt-1 truncate">{pref.hint || '???'}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {canReveal ? (
                          <button
                            onClick={() => handleReveal(pref.id)}
                            disabled={revealingId === pref.id}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            {revealingId === pref.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                揭示
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="text-center">
                            <Lock className="w-5 h-5 text-gray-300 mx-auto" />
                            <p className="text-xs text-gray-400 mt-1 whitespace-nowrap">
                              需要好感度{nextThreshold}/50
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {revealedPrefs.length === 0 && hiddenPrefs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-pink-400" />
            </div>
            <p className="text-gray-500 mb-2">暂无喜好信息</p>
            <p className="text-gray-400 text-sm">和伴侣多交流，慢慢发现她的喜好</p>
          </div>
        )}
      </div>
    </div>
  )
}
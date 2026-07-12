'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Gift, Coins, Star, Heart, ShoppingCart, ChevronRight, Sparkles } from 'lucide-react'

interface User {
  points: number
}

interface GiftItem {
  id: number
  name: string
  category?: string
  tier: number
  pricePoints: number
  affectionMin: number
  affectionMax: number
}

interface GiftRecord {
  id: number
  giftId: number
  gift?: { name: string }
  affectionChange: number
  createdAt: Date
}

interface Partner {
  id: number
  name: string
  avatar: string
}

export default function GiftsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [giftItems, setGiftItems] = useState<GiftItem[]>([])
  const [giftRecords, setGiftRecords] = useState<GiftRecord[]>([])
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status !== 'authenticated') {
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [userRes, giftsRes, recordsRes, partnerRes] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/gifts/list'),
        fetch('/api/gifts/history'),
        fetch('/api/partner'),
      ])

      const userData = await userRes.json()
      const giftsData = await giftsRes.json()
      const recordsData = await recordsRes.json()
      const partnersData = await partnerRes.json()

      if (userData.user) {
        setUser(userData.user)
      }
      if (Array.isArray(giftsData)) {
        setGiftItems(giftsData)
      }
      if (Array.isArray(recordsData)) {
        setGiftRecords(recordsData.map((r: GiftRecord) => ({ ...r, createdAt: new Date(r.createdAt) })))
      }
      if (Array.isArray(partnersData)) {
        setPartner(partnersData.find((p: Partner) => p.id) || null)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendGift = async (giftId: number) => {
    const gift = giftItems.find(g => g.id === giftId)
    if (!user || !gift || user.points < gift.pricePoints) return

    try {
      const response = await fetch('/api/gifts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId }),
      })

      const data = await response.json()

      if (response.ok) {
        fetchData()
      } else {
        alert(data.error || '送礼失败')
      }
    } catch (err) {
      console.error('Failed to send gift:', err)
    }
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
      <Navbar currentPage="gifts" />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                {partner?.avatar ? (
                  <span className="text-2xl">{partner.avatar}</span>
                ) : (
                  <span className="text-2xl">💝</span>
                )}
              </div>
              <div>
                <h2 className="font-bold text-lg">{partner?.name || '你的伴侣'}</h2>
                <p className="text-white/80 text-sm">送TA一份心意</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Coins className="w-5 h-5" />
                <span className="font-bold text-xl">{user?.points || 0}</span>
              </div>
              <p className="text-white/60 text-xs">积分</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h3 className="font-bold text-gray-800">推荐礼物</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {giftItems.slice(0, 4).map((gift) => (
              <div
                key={gift.id}
                className="bg-gray-50 rounded-xl p-4 text-center hover:bg-primary-50 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-primary-500" />
                </div>
                <p className="font-medium text-gray-800 text-sm">{gift.name}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Coins className="w-3 h-3 text-primary-500" />
                  <span className="text-primary-500 font-medium">{gift.pricePoints}</span>
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Heart className="w-3 h-3 text-red-500" />
                  <span className="text-gray-500 text-xs">+{gift.affectionMin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">全部礼物</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">分类</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="space-y-3">
            {giftItems.map((gift) => (
              <div
                key={gift.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                  <Gift className="w-7 h-7 text-primary-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-800">{gift.name}</h4>
                    {gift.tier > 1 && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded-full">
                        <Star className="w-3 h-3 inline mr-1" />
                        {gift.tier}星
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    好感度 +{gift.affectionMin}~{gift.affectionMax}
                  </p>
                </div>
                <button
                  onClick={() => handleSendGift(gift.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    (user?.points || 0) >= gift.pricePoints
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={(user?.points || 0) < gift.pricePoints}
                >
                  <span className="flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    {gift.pricePoints}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-primary-500" />
            <h3 className="font-bold text-gray-800">送礼记录</h3>
          </div>
          {giftRecords.length > 0 ? (
            <div className="space-y-3">
              {giftRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{record.gift?.name}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">+{record.affectionChange}</p>
                    <p className="text-gray-500 text-xs">好感度</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>暂无送礼记录</p>
              <p className="text-sm mt-1">送份礼物给你的伴侣吧</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

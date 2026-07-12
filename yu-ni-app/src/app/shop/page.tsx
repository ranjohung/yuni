'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { ShoppingBag, Coins, Star, Lock, Sparkles, Package, Ticket, Wrench, FlaskConical } from 'lucide-react'

interface ShopItem {
  id: number
  name: string
  description: string
  icon: string
  type: string
  effect: string
  pricePoints: number
  rarity: string
  category: string
}

interface InventoryItem {
  id: number
  itemId: number
  quantity: number
  item: ShopItem
}

const CATEGORIES = [
  { id: 'all', name: '全部', icon: '📦' },
  { id: 'consumables', name: '消耗品', icon: '🧪' },
  { id: 'tools', name: '工具', icon: '🔧' },
  { id: 'tickets', name: '券类', icon: '🎫' },
  { id: 'bundles', name: '礼包', icon: '🎁' },
]

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-100 text-gray-600',
  rare: 'bg-blue-100 text-blue-600',
  epic: 'bg-purple-100 text-purple-600',
  legendary: 'bg-yellow-100 text-yellow-600',
}

const RARITY_LABELS: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
}

export default function ShopPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<ShopItem[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [userPoints, setUserPoints] = useState(0)
  const [currentCategory, setCurrentCategory] = useState('all')
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchData()
    }
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [itemsRes, inventoryRes, userRes] = await Promise.all([
        fetch('/api/shop/list'),
        fetch('/api/inventory'),
        fetch('/api/user/me'),
      ])
      const itemsData = await itemsRes.json()
      const inventoryData = await inventoryRes.json()
      const userData = await userRes.json()

      if (Array.isArray(itemsData)) setItems(itemsData)
      if (Array.isArray(inventoryData)) setInventory(inventoryData)
      if (userData.user) setUserPoints(userData.user.points || 0)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (itemId: number) => {
    const item = items.find(i => i.id === itemId)
    if (!item || userPoints < item.pricePoints) return

    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })
      const data = await response.json()
      if (response.ok) {
        alert(data.message)
        fetchData()
      } else {
        alert(data.error)
      }
    } catch (err) {
      console.error('Failed to purchase:', err)
    }
  }

  const handleUseItem = async (itemId: number) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })
      const data = await response.json()
      if (response.ok) {
        alert(data.message)
        fetchData()
      } else {
        alert(data.error)
      }
    } catch (err) {
      console.error('Failed to use item:', err)
    }
  }

  const filteredItems = currentCategory === 'all' 
    ? items 
    : items.filter(item => item.category === currentCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar currentPage="shop" />

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">道具商店</h2>
                <p className="text-white/80 text-sm">购买道具提升体验</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Coins className="w-5 h-5" />
                <span className="font-bold text-xl">{userPoints}</span>
              </div>
              <p className="text-white/60 text-xs">积分</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'shop' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              商店
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'inventory' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              背包
              {inventory.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {inventory.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'shop' && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCurrentCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                      currentCategory === cat.id
                        ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="text-xs font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center text-xl">
                      {item.icon}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${RARITY_COLORS[item.rarity]}`}>
                      {RARITY_LABELS[item.rarity]}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                  <button
                    onClick={() => handlePurchase(item.id)}
                    className={`w-full mt-3 py-2 rounded-xl font-medium text-sm transition-all ${
                      userPoints >= item.pricePoints
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={userPoints < item.pricePoints}
                  >
                    {item.pricePoints > 0 ? (
                      <span className="flex items-center justify-center gap-1">
                        <Coins className="w-3 h-3" />
                        {item.pricePoints}
                      </span>
                    ) : (
                      '免费领取'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-3">
            {inventory.length > 0 ? (
              inventory.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center text-xl">
                    {inv.item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800">{inv.item.name}</h4>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        x{inv.quantity}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{inv.item.description}</p>
                  </div>
                  <button
                    onClick={() => handleUseItem(inv.itemId)}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-medium rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all"
                  >
                    使用
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">背包空空如也</p>
                <p className="text-gray-400 text-sm mt-1">去商店看看吧</p>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all"
                >
                  去购物
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
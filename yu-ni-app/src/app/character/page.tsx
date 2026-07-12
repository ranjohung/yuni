'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Palette, Plus, Edit, Trash2, Check, Sparkles, Heart } from 'lucide-react'

interface CustomCharacter {
  id: number
  name: string
  avatar: string
  style: string
  personality: string
  colorScheme: string
  background: string
  isActive: boolean
  createdAt: string
}

const AVATARS = ['👤', '👩', '👨', '👧', '👦', '🧑', '👱', '👸', '🤴', '🧙', '🧝', '🧛', '🧟', '🤖', '👽', '👾']

const COLOR_SCHEMES = [
  { id: 'indigo', name: '靛蓝', gradient: 'from-indigo-500 to-purple-500' },
  { id: 'pink', name: '粉色', gradient: 'from-pink-500 to-rose-500' },
  { id: 'teal', name: '青绿', gradient: 'from-teal-500 to-cyan-500' },
  { id: 'orange', name: '橙色', gradient: 'from-orange-500 to-amber-500' },
  { id: 'green', name: '绿色', gradient: 'from-green-500 to-emerald-500' },
  { id: 'red', name: '红色', gradient: 'from-red-500 to-rose-500' },
]

const BACKGROUNDS = [
  { id: 'gradient', name: '渐变' },
  { id: 'solid', name: '纯色' },
  { id: 'pattern', name: '图案' },
  { id: 'photo', name: '照片' },
]

const STYLES = [
  { id: 'cute', name: '可爱' },
  { id: 'elegant', name: '优雅' },
  { id: 'cool', name: '酷炫' },
  { id: 'professional', name: '专业' },
  { id: 'casual', name: '休闲' },
]

export default function CharacterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [characters, setCharacters] = useState<CustomCharacter[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    avatar: '👤',
    colorScheme: 'indigo',
    background: 'gradient',
    style: 'cute',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchCharacters()
    }
  }, [session, status, router])

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/character')
      const data = await response.json()
      if (data.success && data.characters) {
        setCharacters(data.characters)
      }
    } catch (err) {
      console.error('Failed to fetch characters:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newCharacter.name) {
      alert('请输入角色名称')
      return
    }

    try {
      const response = await fetch('/api/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCharacter),
      })
      const data = await response.json()
      if (response.ok) {
        alert('角色创建成功')
        setShowCreate(false)
        setNewCharacter({ name: '', avatar: '👤', colorScheme: 'indigo', background: 'gradient', style: 'cute' })
        fetchCharacters()
      } else {
        alert(data.error)
      }
    } catch (err) {
      console.error('Failed to create character:', err)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const getColorScheme = (id: string) => {
    return COLOR_SCHEMES.find(c => c.id === id) || COLOR_SCHEMES[0]
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
      <Navbar currentPage="character" />

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">角色定制</h2>
              <p className="text-white/80 text-sm">打造专属你的伴侣形象</p>
            </div>
          </div>
        </div>

        {!showCreate ? (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">我的角色</h3>
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">创建角色</span>
                </button>
              </div>
            </div>

            {characters.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {characters.map((char) => {
                  const scheme = getColorScheme(char.colorScheme)
                  return (
                    <div
                      key={char.id}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className={`h-24 bg-gradient-to-br ${scheme.gradient} relative`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-5xl">{char.avatar}</span>
                        </div>
                        {char.isActive && (
                          <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                            <Check className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-800">{char.name}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {scheme.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {STYLES.find(s => s.id === char.style)?.name}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-2">{formatDate(char.createdAt)}</p>
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-all">
                            <Edit className="w-3 h-3 inline mr-1" />
                            编辑
                          </button>
                          <button className="flex-1 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-all">
                            <Trash2 className="w-3 h-3 inline mr-1" />
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">暂无自定义角色</p>
                <p className="text-gray-400 text-sm mt-1">创建一个属于你的专属角色吧</p>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-5 mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-gray-800">角色定制提示</h3>
              </div>
              <p className="text-gray-600 text-sm">
                通过自定义角色系统，你可以创建多个不同风格的伴侣形象。每个角色都有独特的外观和性格，选择最适合你的那一个！
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-800">创建新角色</h3>
              <button
                onClick={() => {
                  setShowCreate(false)
                  setNewCharacter({ name: '', avatar: '👤', colorScheme: 'indigo', background: 'gradient', style: 'cute' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">角色预览</label>
              <div className={`h-32 bg-gradient-to-br ${getColorScheme(newCharacter.colorScheme).gradient} rounded-2xl flex items-center justify-center`}>
                <span className="text-6xl">{newCharacter.avatar}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">角色名称</label>
              <input
                type="text"
                value={newCharacter.name}
                onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                placeholder="输入角色名称"
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">选择头像</label>
              <div className="grid grid-cols-8 gap-2">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setNewCharacter({ ...newCharacter, avatar })}
                    className={`text-2xl p-2 rounded-lg transition-all ${
                      newCharacter.avatar === avatar
                        ? 'bg-primary-100 ring-2 ring-primary-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">配色方案</label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_SCHEMES.map((scheme) => (
                  <button
                    key={scheme.id}
                    onClick={() => setNewCharacter({ ...newCharacter, colorScheme: scheme.id })}
                    className={`py-3 rounded-xl transition-all ${
                      newCharacter.colorScheme === scheme.id
                        ? `bg-gradient-to-r ${scheme.gradient} text-white ring-2 ring-offset-2 ring-gray-300`
                        : `bg-gradient-to-r ${scheme.gradient} opacity-50`
                    }`}
                  >
                    <span className="text-sm font-medium">{scheme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">风格类型</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setNewCharacter({ ...newCharacter, style: style.id })}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      newCharacter.style === style.id
                        ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-secondary-600 transition-all"
            >
              创建角色
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
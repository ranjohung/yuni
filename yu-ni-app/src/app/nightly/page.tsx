'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Moon, Plus, Check, Trash2, ArrowLeft, Clock, Play, Star, Heart, Sparkles, MessageCircle } from 'lucide-react'

interface Greeting {
  id: number
  content: string
  isPlayed: boolean
  partnerName: string
  partnerAvatar: string
  createdAt: string
}

interface Stats {
  todayCount: number
  totalCount: number
  playedCount: number
}

export default function NightlyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [greetings, setGreetings] = useState<Greeting[]>([])
  const [stats, setStats] = useState<Stats>({ todayCount: 0, totalCount: 0, playedCount: 0 })
  const [loading, setLoading] = useState(true)
  const [showInput, setShowInput] = useState(false)
  const [inputContent, setInputContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [playingId, setPlayingId] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status !== 'authenticated') {
      return
    }

    fetchGreetings()
  }, [session, status, router])

  const fetchGreetings = async () => {
    try {
      const response = await fetch('/api/nightly/list')
      const result = await response.json()
      if (result.success) {
        setGreetings(result.greetings || [])
        setStats({
          todayCount: result.todayCount || 0,
          totalCount: result.totalCount || 0,
          playedCount: result.playedCount || 0,
        })
      }
    } catch (error) {
      console.error('获取晚安计划失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!inputContent.trim()) return
    setSubmitting(true)
    try {
      const response = await fetch('/api/nightly/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputContent.trim() }),
      })
      const result = await response.json()
      if (result.success) {
        setShowInput(false)
        setInputContent('')
        fetchGreetings()
      }
    } catch (error) {
      console.error('创建晚安计划失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePlay = async (id: number) => {
    setPlayingId(id)
    try {
      const response = await fetch(`/api/nightly/${id}`, { method: 'PUT' })
      const result = await response.json()
      if (result.success) {
        setGreetings(prev =>
          prev.map(g => (g.id === id ? { ...g, isPlayed: true } : g))
        )
        setStats(prev => ({
          ...prev,
          playedCount: prev.playedCount + 1,
        }))
      }
    } catch (error) {
      console.error('播放失败:', error)
    } finally {
      setPlayingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (deletingId === id) return
    setDeletingId(id)
    try {
      const response = await fetch(`/api/nightly/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        setGreetings(prev => prev.filter(g => g.id !== id))
        setStats(prev => ({
          ...prev,
          totalCount: prev.totalCount - 1,
          playedCount: prev.playedCount - (greetings.find(g => g.id === id)?.isPlayed ? 1 : 0),
        }))
      }
    } catch (error) {
      console.error('删除失败:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}月${day}日 ${hours}:${minutes}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">晚安计划</h1>
            <p className="text-xs text-gray-500">每晚一句温柔的问候</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-5 text-white shadow-lg mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm text-white/90">晚安统计</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.todayCount}</p>
              <p className="text-xs text-white/80 mt-1">今日</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.totalCount}</p>
              <p className="text-xs text-white/80 mt-1">总次数</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.playedCount}</p>
              <p className="text-xs text-white/80 mt-1">已播放</p>
            </div>
          </div>
        </div>

        {/* 创建按钮 */}
        <button
          onClick={() => setShowInput(true)}
          className="w-full py-3.5 bg-white rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center gap-2 text-indigo-500 font-medium hover:bg-indigo-50 transition-all mb-6"
        >
          <Plus className="w-5 h-5" />
          写下晚安问候
        </button>

        {/* 创建输入弹窗 */}
        {showInput && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg mx-auto p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">新的晚安问候</h3>
                <button
                  onClick={() => {
                    setShowInput(false)
                    setInputContent('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              <textarea
                value={inputContent}
                onChange={e => setInputContent(e.target.value)}
                placeholder="写下你想对 TA 说的晚安..."
                className="w-full h-32 p-4 bg-gray-50 rounded-xl text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                maxLength={200}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">{inputContent.length}/200</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowInput(false)
                      setInputContent('')
                    }}
                    className="px-5 py-2.5 text-gray-500 font-medium rounded-xl hover:bg-gray-100 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!inputContent.trim() || submitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        确认发送
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 晚安计划列表 */}
        {greetings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">还没有晚安问候</h3>
            <p className="text-gray-500 text-sm mb-6">
              点击上方按钮，写下第一句晚安问候<br />
              让每晚的温柔陪伴 TA 入梦
            </p>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                温馨入梦
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Star className="w-3.5 h-3.5 text-indigo-400" />
                每日一句
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <MessageCircle className="w-3.5 h-3.5 text-purple-400" />
                甜蜜陪伴
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {greetings.map(greeting => (
              <div
                key={greeting.id}
                className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* 头像 */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                    {greeting.partnerAvatar ? (
                      <img
                        src={greeting.partnerAvatar}
                        alt={greeting.partnerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      greeting.partnerName?.charAt(0) || 'TA'
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* 头部信息 */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-sm">{greeting.partnerName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          greeting.isPlayed
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {greeting.isPlayed ? (
                            <><Check className="w-3 h-3" />已播放</>
                          ) : (
                            <><Clock className="w-3 h-3" />未播放</>
                          )}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(greeting.createdAt)}
                      </span>
                    </div>

                    {/* 晚安内容 */}
                    <p className="text-gray-600 text-sm leading-relaxed mt-2">
                      {greeting.content}
                    </p>

                    {/* 底部操作栏 */}
                    <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-50">
                      {!greeting.isPlayed && (
                        <button
                          onClick={() => handlePlay(greeting.id)}
                          disabled={playingId === greeting.id}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium rounded-full hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all"
                        >
                          {playingId === greeting.id ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                          播放晚安
                        </button>
                      )}
                      {greeting.isPlayed && (
                        <span className="flex items-center gap-1 text-xs text-green-500 px-3 py-1 bg-green-50 rounded-full">
                          <Play className="w-3 h-3" />
                          已播放
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(greeting.id)}
                        disabled={deletingId === greeting.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs rounded-full transition-all disabled:opacity-50"
                      >
                        {deletingId === greeting.id ? (
                          <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Navbar currentPage="nightly" />
    </div>
  )
}
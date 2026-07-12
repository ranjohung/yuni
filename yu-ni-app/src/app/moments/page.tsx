'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import {
  Heart, Image, Send, Sparkles, Trash2, ArrowLeft, Clock,
  RefreshCw, Plus, Smile, Camera, Hash, MessageCircle, X,
} from 'lucide-react'

interface MomentUser {
  name: string
  avatar: string
}

interface Moment {
  id: number
  content: string
  images: string[]
  likes: number
  comments: number
  tags: string
  isAuto: boolean
  user: MomentUser
  createdAt: string
}

interface Stats {
  total: number
  thisWeek: number
  totalLikes: number
}

const TAG_OPTIONS = ['日常', '情感', '成长', '生活', '学习']

const TAG_COLORS: Record<string, string> = {
  '日常': 'bg-blue-100 text-blue-600',
  '情感': 'bg-pink-100 text-pink-600',
  '成长': 'bg-green-100 text-green-600',
  '生活': 'bg-orange-100 text-orange-600',
  '学习': 'bg-purple-100 text-purple-600',
}

export default function MomentsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [moments, setMoments] = useState<Moment[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  // 发布弹窗
  const [showModal, setShowModal] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [selectedTag, setSelectedTag] = useState('日常')
  const [publishing, setPublishing] = useState(false)

  // 生成
  const [generating, setGenerating] = useState(false)

  // 删除确认
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  // 本地点赞
  const [likedSet, setLikedSet] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (authStatus === 'authenticated') {
      fetchMoments()
    }
  }, [authStatus, router])

  const fetchMoments = async () => {
    try {
      const res = await fetch('/api/moments')
      const data = await res.json()
      if (data.success) {
        setMoments(data.moments || [])
        setStats(data.stats || null)
      }
    } catch (err) {
      console.error('获取动态失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!newContent.trim()) return
    setPublishing(true)
    try {
      const res = await fetch('/api/moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent.trim(), tags: selectedTag }),
      })
      const data = await res.json()
      if (data.success) {
        setMoments((prev) => [data.moment, ...prev])
        if (stats) {
          setStats({ ...stats, total: stats.total + 1, thisWeek: stats.thisWeek + 1 })
        }
        setShowModal(false)
        setNewContent('')
        setSelectedTag('日常')
      }
    } catch (err) {
      console.error('发布动态失败:', err)
    } finally {
      setPublishing(false)
    }
  }

  const handleGenerate = async () => {
    if (generating) return
    setGenerating(true)
    try {
      const res = await fetch('/api/moments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      })
      const data = await res.json()
      if (data.success) {
        setMoments((prev) => [data.moment, ...prev])
        if (stats) {
          setStats({ ...stats, total: stats.total + 1, thisWeek: stats.thisWeek + 1 })
        }
      } else {
        alert(data.error || '生成失败')
      }
    } catch (err) {
      console.error('生成动态失败:', err)
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/moments?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setMoments((prev) => prev.filter((m) => m.id !== id))
        if (stats) {
          const deleted = moments.find((m) => m.id === id)
          setStats({
            ...stats,
            total: stats.total - 1,
            totalLikes: deleted ? stats.totalLikes - deleted.likes : stats.totalLikes,
          })
        }
      }
    } catch (err) {
      console.error('删除动态失败:', err)
    }
    setDeleteConfirmId(null)
  }

  const handleLike = (id: number) => {
    if (likedSet.has(id)) return
    setLikedSet((prev) => new Set(prev).add(id))
    setMoments((prev) =>
      prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m))
    )
    if (stats) {
      setStats({ ...stats, totalLikes: stats.totalLikes + 1 })
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMinutes < 1) return '刚刚'
    if (diffMinutes < 60) return `${diffMinutes}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`

    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}月${day}日 ${hours}:${minutes}`
  }

  const getTagColor = (tag: string) => {
    return TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'
  }

  // 加载状态
  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <Navbar currentPage="moments" />

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* 顶部 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">朋友圈</h1>
            <p className="text-sm text-gray-500">分享你的生活点滴</p>
          </div>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-4 h-4 text-pink-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-500">总动态</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.thisWeek}</p>
              <p className="text-xs text-gray-500">本周</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalLikes}</p>
              <p className="text-xs text-gray-500">点赞数</p>
            </div>
          </div>
        )}

        {/* 操作栏 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" />
            发布动态
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center justify-center gap-2 py-3 px-5 bg-white text-gray-700 rounded-xl text-sm font-medium shadow-sm hover:shadow-md border border-gray-100 hover:border-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-pink-500" />
            )}
            自动生成
            <span className="text-xs text-gray-400">每日3次</span>
          </button>
        </div>

        {/* 动态列表 */}
        <div className="space-y-4">
          {moments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-pink-400" />
              </div>
              <p className="text-gray-500 font-medium text-lg">还没有动态</p>
              <p className="text-gray-400 text-sm mt-1">发布你的第一条朋友圈，记录生活中的美好瞬间</p>
              <div className="flex flex-col gap-2 mt-6">
                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  发布第一条动态
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-6 py-2.5 bg-white text-gray-600 rounded-xl text-sm font-medium border border-gray-200 hover:border-pink-300 transition-all"
                >
                  让AI帮你生成一条
                </button>
              </div>
            </div>
          ) : (
            moments.map((moment) => {
              const isLiked = likedSet.has(moment.id)
              return (
                <div
                  key={moment.id}
                  className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all"
                >
                  {/* 头部：用户信息 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm">
                      {moment.user.avatar || moment.user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800 truncate">
                          {moment.user.name}
                        </span>
                        {moment.isAuto && (
                          <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 rounded-full font-medium whitespace-nowrap">
                            🤖 AI生成
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(moment.createdAt)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(moment.tags)}`}>
                          <Hash className="w-2.5 h-2.5 mr-0.5" />
                          {moment.tags}
                        </span>
                      </div>
                    </div>
                    {/* 删除按钮 */}
                    <button
                      onClick={() => setDeleteConfirmId(moment.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 删除确认 */}
                  {deleteConfirmId === moment.id && (
                    <div className="mb-3 p-3 bg-red-50 rounded-xl flex items-center justify-between">
                      <span className="text-sm text-red-600">确定删除这条动态？</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(moment.id)}
                          className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          确认
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs px-3 py-1.5 bg-white text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 内容文字 */}
                  <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                    {moment.content}
                  </p>

                  {/* 底部：点赞和评论 */}
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => handleLike(moment.id)}
                      disabled={isLiked}
                      className={`flex items-center gap-1.5 text-sm transition-all ${
                        isLiked
                          ? 'text-red-500'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`}
                      />
                      <span>{moment.likes}</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                      <MessageCircle className="w-4 h-4" />
                      <span>{moment.comments}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 发布弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg mx-auto p-6 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">发布动态</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 标签选择 */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-pink-500" />
                选择标签
              </label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedTag === tag
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 文本输入 */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-pink-500" />
                想说点什么
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="分享你的心情、想法或生活点滴..."
                className="w-full p-4 bg-gray-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 min-h-[140px]"
                maxLength={500}
              />
              <div className="text-right mt-1">
                <span className="text-xs text-gray-400">{newContent.length}/500</span>
              </div>
            </div>

            {/* 发布按钮 */}
            <button
              onClick={handlePublish}
              disabled={publishing || !newContent.trim()}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                publishing || !newContent.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90 shadow-lg'
              }`}
            >
              {publishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  发布中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  发布动态
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 滑入动画样式 */}
      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @media (min-width: 640px) {
          @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        }
      `}</style>
    </div>
  )
}
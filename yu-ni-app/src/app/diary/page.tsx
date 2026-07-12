'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import {
  BookOpen, Plus, Edit2, Trash2, ArrowLeft, Clock,
  Smile, TrendingUp, BarChart3, Save, X,
} from 'lucide-react'

interface DiaryEntry {
  id: string
  emotionTag: string
  content: string
  insight?: string
  createdAt: string
}

interface EmotionTag {
  id: string
  label: string
  icon: string
  color: string
}

interface EmotionDistribution extends EmotionTag {
  count: number
}

interface Stats {
  total: number
  thisWeek: number
  emotionDistribution: EmotionDistribution[]
}

const EMOTION_TAGS = [
  { id: 'happy', label: '开心', icon: '😊', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'sad', label: '难过', icon: '😢', color: 'bg-blue-100 text-blue-600' },
  { id: 'neutral', label: '平静', icon: '😐', color: 'bg-gray-100 text-gray-600' },
  { id: 'anxious', label: '焦虑', icon: '😰', color: 'bg-orange-100 text-orange-600' },
  { id: 'angry', label: '生气', icon: '😠', color: 'bg-red-100 text-red-600' },
  { id: 'excited', label: '兴奋', icon: '🤩', color: 'bg-pink-100 text-pink-600' },
  { id: 'grateful', label: '感恩', icon: '🙏', color: 'bg-green-100 text-green-600' },
  { id: 'tired', label: '疲惫', icon: '😴', color: 'bg-purple-100 text-purple-600' },
]

export default function DiaryPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()

  // 视图状态
  const [view, setView] = useState<'list' | 'edit'>('list')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 数据
  const [diaries, setDiaries] = useState<DiaryEntry[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  // 编辑状态
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedEmotion, setSelectedEmotion] = useState('happy')
  const [content, setContent] = useState('')
  const [insight, setInsight] = useState('')

  // 删除确认
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (authStatus === 'authenticated') {
      fetchDiaries()
    }
  }, [authStatus, router])

  const fetchDiaries = async () => {
    try {
      const res = await fetch('/api/diary')
      const data = await res.json()
      if (data.success) {
        setDiaries(data.diaries || [])
        setStats(data.stats || null)
      }
    } catch (err) {
      console.error('获取日记失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setEditingId(null)
    setSelectedEmotion('happy')
    setContent('')
    setInsight('')
    setView('edit')
  }

  const handleEdit = (diary: DiaryEntry) => {
    setEditingId(diary.id)
    setSelectedEmotion(diary.emotionTag)
    setContent(diary.content)
    setInsight(diary.insight || '')
    setView('edit')
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/diary/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setDiaries((prev) => prev.filter((d) => d.id !== id))
      }
    } catch (err) {
      console.error('删除日记失败:', err)
    }
    setDeleteConfirmId(null)
  }

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const body = {
        emotionTag: selectedEmotion,
        content: content.trim(),
        insight: insight.trim() || undefined,
      }

      let res: Response
      if (editingId) {
        res = await fetch(`/api/diary/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/diary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      const data = await res.json()
      if (data.success) {
        setView('list')
        fetchDiaries()
      }
    } catch (err) {
      console.error('保存日记失败:', err)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}月${day}日 ${hours}:${minutes}`
  }

  const getEmotionTag = (id: string) => {
    return EMOTION_TAGS.find((e) => e.id === id) || EMOTION_TAGS[2]
  }

  const getContentSummary = (text: string) => {
    if (!text) return ''
    return text.length > 50 ? text.slice(0, 50) + '...' : text
  }

  // 加载状态
  if (authStatus === 'loading' || (loading && view === 'list')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 列表视图
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
        <Navbar currentPage="diary" />

        <div className="max-w-lg mx-auto px-4 py-6 pb-24">
          {/* 顶部 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">情绪日记</h1>
              <p className="text-sm text-gray-500">记录每日心情与感悟</p>
            </div>
          </div>

          {/* 统计卡片 */}
          {stats && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                <p className="text-xs text-gray-500">总日记</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.thisWeek}</p>
                <p className="text-xs text-gray-500">本周</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-4 h-4 text-pink-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.emotionDistribution.length}</p>
                <p className="text-xs text-gray-500">情绪种类</p>
              </div>
            </div>
          )}

          {/* 情绪分布 */}
          {stats && stats.emotionDistribution.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-yellow-500" />
                情绪分布
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats.emotionDistribution.map((item) => (
                  <span
                    key={item.id}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${item.color}`}
                  >
                    {item.icon} {item.label} {item.count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 日记列表 */}
          <div className="space-y-3">
            {diaries.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">还没有情绪日记</p>
                <p className="text-gray-400 text-sm mt-1">记录今天的心情，开始你的情绪旅程</p>
                <button
                  onClick={handleCreateNew}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  写第一篇日记
                </button>
              </div>
            ) : (
              diaries.map((diary) => {
                const tag = getEmotionTag(diary.emotionTag)
                return (
                  <div
                    key={diary.id}
                    className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tag.color}`}>
                          {tag.icon} {tag.label}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(diary.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(diary)}
                          className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deleteConfirmId === diary.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(diary.id)}
                              className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              确认
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(diary.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed">
                      {getContentSummary(diary.content)}
                    </p>

                    {diary.insight && (
                      <div className="mt-2 pt-2 border-t border-gray-50">
                        <p className="text-xs text-gray-500">
                          💡 {diary.insight.length > 30 ? diary.insight.slice(0, 30) + '...' : diary.insight}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* 新建日记按钮 */}
          {diaries.length > 0 && (
            <button
              onClick={handleCreateNew}
              className="fixed bottom-24 right-1/2 translate-x-[calc(theme('maxWidth.lg')/2-2rem)] w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
            >
              <Plus className="w-7 h-7" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // 编辑视图
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">返回</span>
          </button>
          <span className="text-sm text-gray-400">
            {editingId ? '编辑日记' : '新建日记'}
          </span>
        </div>

        {/* 情绪标签选择 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-yellow-500" />
            今天的心情
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {EMOTION_TAGS.map((emotion) => (
              <button
                key={emotion.id}
                onClick={() => setSelectedEmotion(emotion.id)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  selectedEmotion === emotion.id
                    ? 'bg-yellow-50 ring-2 ring-yellow-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{emotion.icon}</span>
                <span className="text-xs">{emotion.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 内容输入 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            记录今天的心情
          </h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今天发生了什么？你的感受如何？"
            className="w-full p-4 bg-gray-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 min-h-[180px]"
          />
        </div>

        {/* 洞察输入 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            今天的感悟或收获
            <span className="text-xs text-gray-400 font-normal">（可选）</span>
          </h3>
          <textarea
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            placeholder="今天有什么新的认识或收获？"
            className="w-full p-4 bg-gray-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
          />
        </div>

        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            saving || !content.trim()
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:opacity-90 shadow-lg'
          }`}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              保存日记
            </>
          )}
        </button>
      </div>
    </div>
  )
}
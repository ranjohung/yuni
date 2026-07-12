'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Brain, Heart, BookOpen, ChevronRight, Smile, Frown, Meh, Angry, Cloud, Sun } from 'lucide-react'

interface MentalHealthTest {
  id: number
  title: string
  description: string
  type: string
  questions: string
}

interface MentalHealthArticle {
  id: number
  title: string
  content: string
  category: string
  tags: string
}

interface DailyMood {
  id: number
  mood: string
  intensity: number
  note: string
  createdAt: string
}

const MOOD_OPTIONS = [
  { id: 'happy', label: '开心', icon: '😊', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'sad', label: '难过', icon: '😢', color: 'bg-blue-100 text-blue-600' },
  { id: 'neutral', label: '平静', icon: '😐', color: 'bg-gray-100 text-gray-600' },
  { id: 'anxious', label: '焦虑', icon: '😰', color: 'bg-orange-100 text-orange-600' },
  { id: 'angry', label: '生气', icon: '😠', color: 'bg-red-100 text-red-600' },
  { id: 'excited', label: '兴奋', icon: '🤩', color: 'bg-pink-100 text-pink-600' },
]

const TEST_TYPE_LABELS: Record<string, string> = {
  anxiety: '焦虑测试',
  depression: '抑郁测试',
  stress: '压力测试',
}

export default function MentalHealthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tests, setTests] = useState<MentalHealthTest[]>([])
  const [articles, setArticles] = useState<MentalHealthArticle[]>([])
  const [moods, setMoods] = useState<DailyMood[]>([])
  const [activeTab, setActiveTab] = useState<'mood' | 'tests' | 'articles'>('mood')
  const [selectedMood, setSelectedMood] = useState('')
  const [moodNote, setMoodNote] = useState('')
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
      const [testsRes, articlesRes, moodsRes] = await Promise.all([
        fetch('/api/mentalhealth/tests'),
        fetch('/api/mentalhealth/articles'),
        fetch('/api/mentalhealth/mood'),
      ])
      const testsData = await testsRes.json()
      const articlesData = await articlesRes.json()
      const moodsData = await moodsRes.json()

      if (Array.isArray(testsData)) setTests(testsData)
      if (Array.isArray(articlesData)) setArticles(articlesData)
      if (moodsData.success && Array.isArray(moodsData.moods)) setMoods(moodsData.moods)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitMood = async () => {
    if (!selectedMood) return

    try {
      const response = await fetch('/api/mentalhealth/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selectedMood, intensity: 5, note: moodNote }),
      })
      const data = await response.json()
      if (response.ok) {
        alert(data.message)
        fetchData()
        setSelectedMood('')
        setMoodNote('')
      }
    } catch (err) {
      console.error('Failed to submit mood:', err)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const getMoodIcon = (mood: string) => {
    const option = MOOD_OPTIONS.find(m => m.id === mood)
    return option?.icon || '😐'
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
      <Navbar currentPage="mentalhealth" />

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="bg-gradient-to-br from-teal-500 to-green-500 rounded-3xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">心理健康</h2>
              <p className="text-white/80 text-sm">关注心灵，关爱自己</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('mood')}
              className={`flex-1 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'mood' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Heart className="w-4 h-4" />
              每日心情
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex-1 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'tests' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Brain className="w-4 h-4" />
              心理测试
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex-1 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'articles' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              知识库
            </button>
          </div>
        </div>

        {activeTab === 'mood' && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
              <h3 className="font-bold text-gray-800 mb-4">今天心情如何？</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`p-4 rounded-xl transition-all flex flex-col items-center gap-2 ${
                      selectedMood === mood.id
                        ? `${mood.color} ring-2 ring-offset-2`
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{mood.icon}</span>
                    <span className="text-sm font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="写下今天的心情日记..."
                className="w-full p-3 bg-gray-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
              />
              <button
                onClick={handleSubmitMood}
                disabled={!selectedMood}
                className={`w-full mt-4 py-3 rounded-xl font-medium transition-all ${
                  selectedMood
                    ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white hover:from-teal-600 hover:to-green-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                记录心情
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">近期心情</h3>
              {moods.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {moods.map((mood) => (
                    <div
                      key={mood.id}
                      className="flex-shrink-0 w-16 bg-gray-50 rounded-xl p-3 text-center"
                    >
                      <span className="text-2xl">{getMoodIcon(mood.mood)}</span>
                      <p className="text-xs text-gray-500 mt-2">{formatDate(mood.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">暂无心情记录</p>
                  <p className="text-gray-400 text-sm mt-1">开始记录你的心情吧</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-4">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-green-100 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-teal-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800">{test.title}</h4>
                      <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-600 rounded-full">
                        {TEST_TYPE_LABELS[test.type]}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{test.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-teal-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{article.title}</h4>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{article.content}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {article.tags?.split(',').map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
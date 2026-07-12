'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import {
  Brain, Plus, ArrowLeft, ArrowRight, CheckCircle,
  AlertTriangle, Lightbulb, Clock, List, BarChart3,
  TrendingUp, Target, Trash2,
} from 'lucide-react'

interface CBTRecord {
  id: string
  situation?: string
  thought?: string
  emotions?: string
  emotionIntensityBefore?: number
  evidenceFor?: string
  evidenceAgainst?: string
  alternativeThought?: string
  emotionIntensityAfter?: number
  detectedDistortions?: string
  status: number // 0=未开始 1=情境完成 2=想法完成 3=情绪完成 4=证据完成 5=已完成
  createdAt: string
  savedAt?: string
  completedAt?: string
}

interface Distortion {
  type: string
  description: string
  suggestion: string
}

const EMOTION_OPTIONS = [
  { id: 'anxious', label: '焦虑', emoji: '😰' },
  { id: 'frustrated', label: '沮丧', emoji: '😞' },
  { id: 'angry', label: '愤怒', emoji: '😠' },
  { id: 'fearful', label: '恐惧', emoji: '😨' },
  { id: 'hurt', label: '委屈', emoji: '😢' },
  { id: 'happy', label: '开心', emoji: '😊' },
  { id: 'calm', label: '平静', emoji: '😌' },
]

const STATUS_LABELS: Record<number, string> = {
  0: '未开始',
  1: '情境完成',
  2: '想法完成',
  3: '情绪完成',
  4: '证据完成',
  5: '已完成',
}

const STATUS_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-500',
  1: 'bg-blue-100 text-blue-600',
  2: 'bg-purple-100 text-purple-600',
  3: 'bg-orange-100 text-orange-600',
  4: 'bg-yellow-100 text-yellow-600',
  5: 'bg-green-100 text-green-600',
}

const STEP_TITLES = ['情境', '想法', '情绪', '证据', '替代想法']

export default function CBTPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()

  // 视图状态
  const [view, setView] = useState<'list' | 'edit'>('list')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 记录列表
  const [records, setRecords] = useState<CBTRecord[]>([])

  // 编辑状态
  const [currentStep, setCurrentStep] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [situation, setSituation] = useState('')
  const [thought, setThought] = useState('')
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [intensityBefore, setIntensityBefore] = useState(5)
  const [evidenceFor, setEvidenceFor] = useState('')
  const [evidenceAgainst, setEvidenceAgainst] = useState('')
  const [alternativeThought, setAlternativeThought] = useState('')
  const [intensityAfter, setIntensityAfter] = useState(5)

  // 认知扭曲检测
  const [distortions, setDistortions] = useState<Distortion[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisDone, setAnalysisDone] = useState(false)

  // 删除确认
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (authStatus === 'authenticated') {
      fetchRecords()
    }
  }, [authStatus, router])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/cbt/records')
      const data = await res.json()
      if (Array.isArray(data)) {
        setRecords(data)
      }
    } catch (err) {
      console.error('获取CBT记录失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setEditingId(null)
    setCurrentStep(0)
    setSituation('')
    setThought('')
    setSelectedEmotions([])
    setIntensityBefore(5)
    setEvidenceFor('')
    setEvidenceAgainst('')
    setAlternativeThought('')
    setIntensityAfter(5)
    setDistortions([])
    setAnalysisDone(false)
    setView('edit')
  }

  const handleContinueEdit = (record: CBTRecord) => {
    setEditingId(record.id)
    setCurrentStep(record.status >= 5 ? 0 : record.status)
    setSituation(record.situation || '')
    setThought(record.thought || '')
    setSelectedEmotions(record.emotions ? record.emotions.split(',') : [])
    setIntensityBefore(record.emotionIntensityBefore || 5)
    setEvidenceFor(record.evidenceFor || '')
    setEvidenceAgainst(record.evidenceAgainst || '')
    setAlternativeThought(record.alternativeThought || '')
    setIntensityAfter(record.emotionIntensityAfter || 5)
    setDistortions(record.detectedDistortions ? JSON.parse(record.detectedDistortions) : [])
    setAnalysisDone(!!record.detectedDistortions)
    setView('edit')
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/cbt/records/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id))
      }
    } catch (err) {
      console.error('删除记录失败:', err)
    }
    setDeleteConfirmId(null)
  }

  const handleAnalyzeThought = async () => {
    if (!thought.trim()) return
    setAnalyzing(true)
    try {
      const res = await fetch('/api/cbt/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thought, situation }),
      })
      const data = await res.json()
      if (data.success && data.distortions) {
        setDistortions(data.distortions)
      }
      setAnalysisDone(true)
    } catch (err) {
      console.error('分析想法失败:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  useEffect(() => {
    if (currentStep === 1 && thought.trim() && !analysisDone && !analyzing) {
      const timer = setTimeout(() => {
        handleAnalyzeThought()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [thought, currentStep])

  const handleNextStep = async () => {
    // 如果是步骤0->1（情境完成），保存到后端
    if (currentStep === 0 && editingId) {
      await saveCurrentProgress(1)
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const toggleEmotion = (id: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }

  const saveCurrentProgress = async (status: number): Promise<string | null> => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        situation,
        thought,
        emotions: selectedEmotions.join(','),
        emotionIntensityBefore: intensityBefore,
        evidenceFor,
        evidenceAgainst,
        alternativeThought,
        emotionIntensityAfter: intensityAfter,
        detectedDistortions: distortions.length > 0 ? JSON.stringify(distortions) : undefined,
        status,
      }

      if (status === 5) {
        body.completedAt = new Date().toISOString()
      }

      let res: Response
      if (editingId) {
        res = await fetch(`/api/cbt/records/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/cbt/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      const data = await res.json()
      if (res.ok) {
        if (!editingId && data.id) {
          setEditingId(data.id)
        }
        return data.id || editingId
      }
      return null
    } catch (err) {
      console.error('保存失败:', err)
      return null
    } finally {
      setSaving(false)
    }
  }

  const handleFinish = async () => {
    const id = await saveCurrentProgress(5)
    if (id) {
      setView('list')
      fetchRecords()
    }
  }

  const handleSaveAndBack = async () => {
    await saveCurrentProgress(currentStep === 4 ? 4 : currentStep + 1)
    setView('list')
    fetchRecords()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${month}月${day}日 ${hour}:${minute}`
  }

  const getSituationSummary = (text: string) => {
    if (!text) return '未填写'
    return text.length > 20 ? text.slice(0, 20) + '...' : text
  }

  // 加载状态
  if (authStatus === 'loading' || (loading && view === 'list')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 列表视图
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Navbar currentPage="cbt" />

        <div className="max-w-lg mx-auto px-4 py-6 pb-24">
          {/* 头部 */}
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-6 text-white shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">CBT思维记录</h2>
                <p className="text-white/80 text-sm">认知行为疗法 · 记录思维模式</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{records.length}</p>
                <p className="text-xs text-white/70">总记录</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{records.filter((r) => r.status === 5).length}</p>
                <p className="text-xs text-white/70">已完成</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{records.filter((r) => r.status > 0 && r.status < 5).length}</p>
                <p className="text-xs text-white/70">进行中</p>
              </div>
            </div>
          </div>

          {/* 记录列表 */}
          <div className="space-y-3">
            {records.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">暂无CBT记录</p>
                <p className="text-gray-400 text-sm mt-1">开始记录你的思维模式吧</p>
              </div>
            ) : (
              records.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[record.status]}`}>
                        {STATUS_LABELS[record.status]}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(record.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {deleteConfirmId === record.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(record.id)}
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
                          onClick={() => setDeleteConfirmId(record.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-500">情境</p>
                    <p className="text-gray-800">{getSituationSummary(record.situation || '')}</p>
                  </div>

                  {record.status < 5 ? (
                    <button
                      onClick={() => handleContinueEdit(record)}
                      className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      继续填写
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        已完成
                        {record.completedAt && ` · ${formatDate(record.completedAt)}`}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 新建记录按钮 */}
          <button
            onClick={handleCreateNew}
            className="fixed bottom-24 right-1/2 translate-x-[calc(theme('maxWidth.lg')/2-2rem)] w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>
      </div>
    )
  }

  // 编辑视图
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (currentStep > 0) {
                handleSaveAndBack()
              } else {
                setView('list')
              }
            }}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">返回</span>
          </button>
          <span className="text-sm text-gray-400">
            {currentStep + 1} / 5
          </span>
        </div>

        {/* 步骤进度条 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            {STEP_TITLES.map((title, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    index < currentStep
                      ? 'bg-primary-500 text-white'
                      : index === currentStep
                      ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-300'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    index === currentStep ? 'text-primary-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  {title}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* 步骤内容 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          {currentStep === 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-800 text-lg">步骤 1：描述情境</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                请描述触发你负面情绪的具体事件或场景
              </p>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="例如：今天在工作汇报时，我说错了一个数据，领导当场指出了我的错误..."
                className="w-full p-4 bg-gray-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[200px]"
              />
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-800 text-lg">步骤 2：记录想法</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                当时你脑子里闪过了什么想法？写下来，我会帮你分析
              </p>
              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="例如：我又搞砸了，大家肯定觉得我很无能..."
                className="w-full p-4 bg-gray-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[150px]"
              />

              {/* 分析中 */}
              {analyzing && (
                <div className="mt-4 flex items-center gap-2 text-primary-500 text-sm">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span>正在分析认知扭曲...</span>
                </div>
              )}

              {/* 认知扭曲检测结果 */}
              {analysisDone && distortions.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>检测到 {distortions.length} 种认知扭曲</span>
                  </div>
                  {distortions.map((d, index) => (
                    <div
                      key={index}
                      className="bg-orange-50 border border-orange-200 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-orange-700 text-sm">{d.type}</p>
                          <p className="text-orange-600 text-xs mt-0.5">{d.description}</p>
                          <p className="text-gray-600 text-xs mt-2 bg-white/60 rounded-lg p-2">
                            💡 {d.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {analysisDone && distortions.length === 0 && (
                <div className="mt-4 flex items-center gap-2 text-green-600 text-sm bg-green-50 rounded-xl p-3">
                  <CheckCircle className="w-4 h-4" />
                  <span>未检测到明显的认知扭曲，你的思维模式很健康！</span>
                </div>
              )}

              {!analysisDone && thought.trim() && !analyzing && (
                <button
                  onClick={handleAnalyzeThought}
                  className="mt-4 w-full py-2.5 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors"
                >
                  分析认知扭曲
                </button>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-800 text-lg">步骤 3：识别情绪</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                你当时感受到了哪些情绪？选择所有适用的
              </p>

              {/* 情绪标签 */}
              <div className="flex flex-wrap gap-2 mb-6">
                {EMOTION_OPTIONS.map((emotion) => (
                  <button
                    key={emotion.id}
                    onClick={() => toggleEmotion(emotion.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedEmotions.includes(emotion.id)
                        ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-300'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-1.5">{emotion.emoji}</span>
                    {emotion.label}
                  </button>
                ))}
              </div>

              {/* 强度滑块 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">情绪强度</span>
                  <span className="text-lg font-bold text-primary-600">{intensityBefore}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensityBefore}
                  onChange={(e) => setIntensityBefore(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>很轻微</span>
                  <span>中等</span>
                  <span>非常强烈</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <List className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-800 text-lg">步骤 4：寻找证据</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                客观地分析支持和不支持你想法的事实依据
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  支持该想法的证据
                </label>
                <textarea
                  value={evidenceFor}
                  onChange={(e) => setEvidenceFor(e.target.value)}
                  placeholder="有哪些事实支持你的这个想法？"
                  className="w-full p-4 bg-green-50 border border-green-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  反对该想法的证据
                </label>
                <textarea
                  value={evidenceAgainst}
                  onChange={(e) => setEvidenceAgainst(e.target.value)}
                  placeholder="有哪些事实表明你的想法可能不完全正确？"
                  className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-800 text-lg">步骤 5：替代想法</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                基于上面的证据，写下更平衡、更客观的想法
              </p>

              <textarea
                value={alternativeThought}
                onChange={(e) => setAlternativeThought(e.target.value)}
                placeholder="例如：虽然我说错了数据，但这只是汇报中的一个小失误，其他同事也有过类似情况。我可以从中吸取教训，下次做得更好。"
                className="w-full p-4 bg-gray-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[150px]"
              />

              {/* 后测强度滑块 */}
              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">现在情绪强度</span>
                  <span className="text-lg font-bold text-primary-600">{intensityAfter}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensityAfter}
                  onChange={(e) => setIntensityAfter(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>很轻微</span>
                  <span>中等</span>
                  <span>非常强烈</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between mt-4 gap-3">
          {currentStep > 0 ? (
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              上一步
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              onClick={handleNextStep}
              disabled={
                (currentStep === 0 && !situation.trim()) ||
                (currentStep === 1 && !thought.trim()) ||
                saving
              }
              className={`flex items-center gap-1 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                ((currentStep === 0 && !situation.trim()) ||
                  (currentStep === 1 && !thought.trim()) ||
                  saving)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:opacity-90'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  下一步
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving || !alternativeThought.trim()}
              className={`flex items-center gap-1 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                saving || !alternativeThought.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  完成
                </>
              )}
            </button>
          )}
        </div>

        {/* 保存进度提示 */}
        <div className="mt-3 text-center">
          <button
            onClick={handleSaveAndBack}
            disabled={saving}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
          >
            保存进度并返回
          </button>
        </div>
      </div>
    </div>
  )
}
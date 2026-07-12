'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Heart, Plus, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Lightbulb, MessageCircle, Send, List, Eye, Smile, Target, Trash2 } from 'lucide-react'

interface NVCRecord {
  id: string
  observation?: string
  observationValid?: boolean
  observationFeedback?: string
  feeling?: string
  need?: string
  request?: string
  requestValid?: boolean
  requestFeedback?: string
  fullSentence?: string
  qualityScore?: number
  status: number // 0=未开始 1=观察完成 2=感受完成 3=需要完成 4=请求完成 5=已完成
  createdAt: string
  savedAt?: string
  completedAt?: string
}

const FEELING_OPTIONS = [
  '受伤', '难过', '生气', '委屈', '失望', '孤独', '焦虑', '害怕',
  '开心', '满足', '感动', '温暖', '疲惫', '压力', '尴尬', '无助',
  '被忽视', '被尊重', '被理解', '被接纳',
]

const NEED_OPTIONS = [
  '被尊重', '被理解', '被接纳', '被认可', '安全', '信任', '自主',
  '平等', '诚实', '陪伴', '支持', '倾听', '空间', '合作', '意义',
  '成长', '休息', '自由', '表达', '参与',
]

const STATUS_LABELS: Record<number, string> = {
  0: '未开始',
  1: '观察完成',
  2: '感受完成',
  3: '需要完成',
  4: '请求完成',
  5: '已完成',
}

const STATUS_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-600',
  1: 'bg-blue-100 text-blue-600',
  2: 'bg-purple-100 text-purple-600',
  3: 'bg-orange-100 text-orange-600',
  4: 'bg-teal-100 text-teal-600',
  5: 'bg-green-100 text-green-600',
}

const STEP_LABELS = ['观察', '感受', '需要', '请求']

export default function NVCPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // 视图切换
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list')

  // 记录列表
  const [records, setRecords] = useState<NVCRecord[]>([])
  const [listLoading, setListLoading] = useState(true)

  // 编辑状态
  const [currentStep, setCurrentStep] = useState(0)
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  // 表单字段
  const [observation, setObservation] = useState('')
  const [observationValid, setObservationValid] = useState<boolean | null>(null)
  const [observationFeedback, setObservationFeedback] = useState('')
  const [observationSuggestion, setObservationSuggestion] = useState('')
  const [feeling, setFeeling] = useState('')
  const [need, setNeed] = useState('')
  const [request, setRequest] = useState('')
  const [requestValid, setRequestValid] = useState<boolean | null>(null)
  const [requestFeedback, setRequestFeedback] = useState('')
  const [requestSuggestion, setRequestSuggestion] = useState('')
  const [saving, setSaving] = useState(false)

  // 删除确认
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchRecords()
    }
  }, [session, status, router])

  const fetchRecords = async () => {
    setListLoading(true)
    try {
      const res = await fetch('/api/nvc/records')
      const data = await res.json()
      if (Array.isArray(data)) {
        setRecords(data)
      }
    } catch (err) {
      console.error('获取NVC记录失败:', err)
    } finally {
      setListLoading(false)
    }
  }

  const handleAnalyze = async (step: string, input: string) => {
    try {
      const res = await fetch('/api/nvc/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, input }),
      })
      const data = await res.json()
      return data
    } catch {
      return { success: false, valid: true, feedback: '分析服务暂时不可用' }
    }
  }

  const handleObservationBlur = async () => {
    if (!observation.trim()) return
    setEditLoading(true)
    const result = await handleAnalyze('observation', observation)
    setObservationValid(result.valid)
    setObservationFeedback(result.feedback || '')
    setObservationSuggestion(result.suggestion || '')
    setEditLoading(false)
  }

  const handleFeelingChange = async (val: string) => {
    setFeeling(val)
    if (val.trim()) {
      setEditLoading(true)
      const result = await handleAnalyze('feeling', val)
      setEditLoading(false)
    }
  }

  const handleNeedChange = async (val: string) => {
    setNeed(val)
    if (val.trim()) {
      setEditLoading(true)
      const result = await handleAnalyze('need', val)
      setEditLoading(false)
    }
  }

  const handleRequestBlur = async () => {
    if (!request.trim()) return
    setEditLoading(true)
    const result = await handleAnalyze('request', request)
    setRequestValid(result.valid)
    setRequestFeedback(result.feedback || '')
    setRequestSuggestion(result.suggestion || '')
    setEditLoading(false)
  }

  const getFullSentence = () => {
    const parts: string[] = []
    if (observation.trim()) parts.push(`当你${observation.trim()}`)
    if (feeling.trim()) parts.push(`我感到${feeling.trim()}`)
    if (need.trim()) parts.push(`因为我需要${need.trim()}`)
    if (request.trim()) parts.push(`你愿意${request.trim()}吗？`)
    return parts.length > 0 ? parts.join('，') + '。' : ''
  }

  const handleCreateNew = () => {
    resetForm()
    setCurrentRecordId(null)
    setCurrentStep(0)
    setViewMode('edit')
  }

  const handleContinueEdit = (record: NVCRecord) => {
    setObservation(record.observation || '')
    setObservationValid(record.observationValid ?? null)
    setObservationFeedback(record.observationFeedback || '')
    setFeeling(record.feeling || '')
    setNeed(record.need || '')
    setRequest(record.request || '')
    setRequestValid(record.requestValid ?? null)
    setRequestFeedback(record.requestFeedback || '')
    setCurrentRecordId(record.id)
    setCurrentStep(record.status >= 4 ? 3 : record.status)
    setViewMode('edit')
  }

  const handleViewDetail = (record: NVCRecord) => {
    setObservation(record.observation || '')
    setObservationValid(record.observationValid ?? null)
    setObservationFeedback(record.observationFeedback || '')
    setFeeling(record.feeling || '')
    setNeed(record.need || '')
    setRequest(record.request || '')
    setRequestValid(record.requestValid ?? null)
    setRequestFeedback(record.requestFeedback || '')
    setCurrentRecordId(record.id)
    setCurrentStep(4)
    setViewMode('edit')
  }

  const handleDeleteRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/nvc/records/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setRecords(prev => prev.filter(r => r.id !== id))
      }
    } catch (err) {
      console.error('删除记录失败:', err)
    }
    setDeleteConfirmId(null)
  }

  const resetForm = () => {
    setObservation('')
    setObservationValid(null)
    setObservationFeedback('')
    setObservationSuggestion('')
    setFeeling('')
    setNeed('')
    setRequest('')
    setRequestValid(null)
    setRequestFeedback('')
    setRequestSuggestion('')
    setCurrentStep(0)
    setCurrentRecordId(null)
  }

  const handleSaveRecord = async (saveStatus: number) => {
    setSaving(true)
    try {
      const fullSentence = getFullSentence()
      const body: Record<string, unknown> = {
        status: saveStatus,
        observation: observation || undefined,
        observationValid: observationValid ?? undefined,
        observationFeedback: observationFeedback || undefined,
        feeling: feeling || undefined,
        need: need || undefined,
        request: request || undefined,
        requestValid: requestValid ?? undefined,
        requestFeedback: requestFeedback || undefined,
        fullSentence: fullSentence || undefined,
      }

      if (saveStatus === 5) {
        body.completedAt = new Date().toISOString()
      }

      let res
      if (currentRecordId) {
        res = await fetch(`/api/nvc/records/${currentRecordId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/nvc/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (res.ok) {
        const data = await res.json()
        if (!currentRecordId) {
          setCurrentRecordId(data.id)
        }
        await fetchRecords()
      }
    } catch (err) {
      console.error('保存记录失败:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleNextStep = () => {
    // 保存当前步骤进度
    if (currentStep === 0) {
      handleSaveRecord(1)
    } else if (currentStep === 1) {
      handleSaveRecord(2)
    } else if (currentStep === 2) {
      handleSaveRecord(3)
    }
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleComplete = async () => {
    await handleSaveRecord(5)
    setViewMode('list')
  }

  const handleSendToRecord = async () => {
    const currentStatus = currentStep === 3 ? 4 : currentStep + 1
    await handleSaveRecord(currentStatus)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 加载中
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 未登录
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Navbar currentPage="nvc" />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
        {/* 头部标题 */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">非暴力沟通</h2>
                <p className="text-white/80 text-sm">观察 · 感受 · 需要 · 请求</p>
              </div>
            </div>
            {viewMode === 'edit' && (
              <button
                onClick={() => setViewMode('list')}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-2 transition-all"
              >
                <List className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 记录列表视图 */}
        {viewMode === 'list' && (
          <>
            {/* 新建按钮 */}
            <button
              onClick={handleCreateNew}
              className="w-full bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all flex items-center justify-center gap-2 text-green-600 font-medium border-2 border-dashed border-green-200 hover:border-green-400"
            >
              <Plus className="w-5 h-5" />
              新建NVC记录
            </button>

            {/* 记录列表 */}
            {listLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : records.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">暂无NVC记录</p>
                <p className="text-gray-400 text-sm mt-1">点击上方按钮开始你的第一次非暴力沟通练习</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[record.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[record.status] || '未知'}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(record.createdAt)}</span>
                    </div>

                    {record.fullSentence ? (
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-3">
                        {record.fullSentence}
                      </p>
                    ) : (
                      <div className="text-gray-400 text-sm mb-3 space-y-1">
                        {record.observation && <p>观察：{record.observation}</p>}
                        {record.feeling && <p>感受：{record.feeling}</p>}
                        {record.need && <p>需要：{record.need}</p>}
                        {record.request && <p>请求：{record.request}</p>}
                        {!record.observation && !record.feeling && !record.need && !record.request && (
                          <p className="italic">暂无内容</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {record.status < 5 ? (
                        <button
                          onClick={() => handleContinueEdit(record)}
                          className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
                        >
                          继续填写
                        </button>
                      ) : (
                        <button
                          onClick={() => handleViewDetail(record)}
                          className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
                        >
                          查看详情
                        </button>
                      )}
                      <div className="relative">
                        <button
                          onClick={() => setDeleteConfirmId(deleteConfirmId === record.id ? null : record.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {deleteConfirmId === record.id && (
                          <div className="absolute right-0 bottom-full mb-2 bg-white rounded-xl shadow-lg border p-3 z-10 w-48">
                            <p className="text-sm text-gray-600 mb-2">确定删除这条记录？</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeleteRecord(record.id)}
                                className="flex-1 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-all"
                              >
                                删除
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-all"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 引导编辑视图 */}
        {viewMode === 'edit' && (
          <>
            {/* 步骤指示器 */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                {STEP_LABELS.map((label, index) => (
                  <div key={index} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          index < currentStep
                            ? 'bg-green-500 text-white'
                            : index === currentStep
                            ? 'bg-green-500 text-white ring-4 ring-green-100'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {index < currentStep ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-xs mt-1.5 font-medium ${
                          index <= currentStep ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {index < STEP_LABELS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 transition-all ${
                          index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 步骤1：观察 */}
            {currentStep === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-5 h-5 text-green-500" />
                  <h3 className="font-bold text-gray-800">步骤1：观察</h3>
                </div>
                <p className="text-sm text-gray-500">描述你观察到的具体事实，不加评价</p>

                <textarea
                  value={observation}
                  onChange={(e) => {
                    setObservation(e.target.value)
                    if (observationValid !== null) {
                      setObservationValid(null)
                      setObservationFeedback('')
                      setObservationSuggestion('')
                    }
                  }}
                  onBlur={handleObservationBlur}
                  placeholder="例如：当你提高音量说话时 / 当你没有回复我的消息时"
                  className="w-full p-4 bg-gray-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px]"
                  rows={4}
                />

                {editLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    验证中...
                  </div>
                )}

                {observationValid === true && !editLoading && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-700">{observationFeedback}</p>
                    </div>
                  </div>
                )}

                {observationValid === false && !editLoading && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-700">{observationFeedback}</p>
                      </div>
                    </div>
                    {observationSuggestion && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
                        <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-amber-700 whitespace-pre-line">{observationSuggestion}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 步骤2：感受 */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Smile className="w-5 h-5 text-green-500" />
                  <h3 className="font-bold text-gray-800">步骤2：感受</h3>
                </div>
                <p className="text-sm text-gray-500">选择或描述你当下的感受</p>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">选择感受词</label>
                  <div className="flex flex-wrap gap-2">
                    {FEELING_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleFeelingChange(opt)}
                        className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                          feeling === opt
                            ? 'bg-green-500 text-white shadow-sm'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">或自由输入</label>
                  <input
                    value={feeling}
                    onChange={(e) => handleFeelingChange(e.target.value)}
                    placeholder="输入你的感受..."
                    className="w-full p-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {editLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    验证中...
                  </div>
                )}
              </div>
            )}

            {/* 步骤3：需要 */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5 text-green-500" />
                  <h3 className="font-bold text-gray-800">步骤3：需要</h3>
                </div>
                <p className="text-sm text-gray-500">选择你内心深处的需要</p>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">选择需要词</label>
                  <div className="flex flex-wrap gap-2">
                    {NEED_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleNeedChange(opt)}
                        className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                          need === opt
                            ? 'bg-green-500 text-white shadow-sm'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {editLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    验证中...
                  </div>
                )}
              </div>
            )}

            {/* 步骤4：请求 */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Send className="w-5 h-5 text-green-500" />
                  <h3 className="font-bold text-gray-800">步骤4：请求</h3>
                </div>
                <p className="text-sm text-gray-500">提出具体可行的请求</p>

                <textarea
                  value={request}
                  onChange={(e) => {
                    setRequest(e.target.value)
                    if (requestValid !== null) {
                      setRequestValid(null)
                      setRequestFeedback('')
                      setRequestSuggestion('')
                    }
                  }}
                  onBlur={handleRequestBlur}
                  placeholder="例如：你愿意下次先用平和的语气和我说吗？"
                  className="w-full p-4 bg-gray-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                  rows={3}
                />

                {editLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    验证中...
                  </div>
                )}

                {requestValid === true && !editLoading && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">{requestFeedback}</p>
                  </div>
                )}

                {requestValid === false && !editLoading && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-700">{requestFeedback}</p>
                      </div>
                    </div>
                    {requestSuggestion && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
                        <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-amber-700 whitespace-pre-line">{requestSuggestion}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 完整句子预览 */}
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-bold text-gray-800">完整句子预览</h3>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 min-h-[60px]">
                {getFullSentence() ? (
                  <p className="text-gray-700 leading-relaxed">{getFullSentence()}</p>
                ) : (
                  <p className="text-gray-400 italic">填写各步骤内容后，这里将自动生成完整NVC句子</p>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevStep}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  上一步
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      下一步
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <div className="flex-1 flex gap-3">
                  <button
                    onClick={handleSendToRecord}
                    disabled={saving}
                    className="flex-1 py-3 bg-white border-2 border-green-500 text-green-600 rounded-xl font-medium hover:bg-green-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        保存到记录
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={saving}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        完成
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
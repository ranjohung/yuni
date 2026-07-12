'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import {
  BarChart3,
  TrendingUp,
  ArrowLeft,
  Clock,
  Award,
  Star,
  Heart,
  Target,
  Sparkles,
  RefreshCw,
  Brain,
  MessageCircle,
  CheckCircle,
} from 'lucide-react'

interface ReportScores {
  avgScore: number
  completedCount: number
  totalTraining: number
  scoreTrend: number[]
}

interface Report {
  id: number
  weekNumber: number
  year: number
  trainingCount: number
  scores: ReportScores | null
  improvements: string
  recommendation: string
  partnerMessage: string
  createdAt: string
}

export default function ReportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchReports()
    }
  }, [session, status, router])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/report')
      const data = await res.json()
      if (data.success) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error('获取报告失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    try {
      setGenerating(true)
      const res = await fetch('/api/report', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setReports((prev) => [data.report, ...prev])
        setSelectedReport(data.report)
      } else {
        alert(data.error || '生成报告失败')
      }
    } catch (error) {
      console.error('生成报告失败:', error)
      alert('生成报告失败，请稍后重试')
    } finally {
      setGenerating(false)
    }
  }

  const canGenerateThisWeek = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const weekNumber = Math.ceil(
      (now.getTime() - new Date(currentYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
    )
    return !reports.some((r) => r.year === currentYear && r.weekNumber === weekNumber)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <Navbar currentPage="growth" />
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-24">
          <button
            onClick={() => setSelectedReport(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回列表</span>
          </button>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">第{selectedReport.weekNumber}周报告</h2>
                <p className="text-white/80 text-sm">{selectedReport.year}年</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {selectedReport.scores?.totalTraining ?? selectedReport.trainingCount}
              </p>
              <p className="text-xs text-gray-400 mt-1">训练次数</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {selectedReport.scores?.completedCount ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">完成次数</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-cyan-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {selectedReport.scores?.avgScore ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">平均得分</p>
            </div>
          </div>

          {selectedReport.scores?.scoreTrend && selectedReport.scores.scoreTrend.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-gray-800">得分趋势</h3>
              </div>
              <div className="flex items-end gap-2 h-32">
                {selectedReport.scores.scoreTrend.map((score, index) => {
                  const height = Math.max((score / 100) * 100, 8)
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-gray-500">{Math.round(score)}</span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-cyan-400 transition-all"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-gray-400">第{index + 1}次</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-gray-800">改进建议</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{selectedReport.improvements}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-gray-800">推荐训练</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{selectedReport.recommendation}</p>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl p-5 shadow-sm border border-pink-100">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              <h3 className="font-bold text-gray-800">伴侣寄语</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{selectedReport.partnerMessage}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Navbar currentPage="growth" />
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-24">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">每周报告</h1>
            <p className="text-sm text-gray-400">追踪你的每周进步</p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-300" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">暂无报告</h3>
            <p className="text-gray-400 text-sm mb-6">
              完成训练后，每周会自动生成一份成长报告，帮你了解自己的进步情况。
            </p>
            <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-400" />
                完成社交训练
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-cyan-400" />
                与伴侣进行沟通
              </span>
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                查看每周成长报告
              </span>
            </div>
            {canGenerateThisWeek() && (
              <button
                onClick={generateReport}
                disabled={generating}
                className="mt-6 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl py-3 font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    生成本周报告
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">第{report.weekNumber}周报告</h3>
                        <p className="text-xs text-gray-400">{report.year}年</p>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-300 rotate-180" />
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Target className="w-4 h-4 text-blue-400" />
                      {report.scores?.totalTraining ?? report.trainingCount}次训练
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Star className="w-4 h-4 text-amber-400" />
                      {report.scores?.avgScore ?? 0}分
                    </span>
                    <span className="flex items-center gap-1 text-gray-400 ml-auto">
                      <Clock className="w-4 h-4" />
                      {new Date(report.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {canGenerateThisWeek() && (
              <button
                onClick={generateReport}
                disabled={generating}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl py-3 font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    生成本周报告
                  </>
                )}
              </button>
            )}

            {!canGenerateThisWeek() && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  本周报告已生成
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
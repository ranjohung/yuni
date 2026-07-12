'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Clock, ChevronLeft, ChevronRight, Calendar, MessageCircle, Sparkles } from 'lucide-react'

interface HistorySession {
  id: number
  partnerName: string
  partnerAvatar: string
  preview: string
  messageCount: number
  createdAt: string
}

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export default function TimeTravelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [history, setHistory] = useState<HistorySession[]>([])
  const [selectedSession, setSelectedSession] = useState<HistorySession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchHistory()
    }
  }, [session, status, router])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/chat/history')
      const data = await response.json()
      if (data.success && data.history) {
        setHistory(data.history)
      }
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/chat/history?sessionId=${sessionId}`)
      const data = await response.json()
      if (data.success && data.messages) {
        setMessages(data.messages)
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }

  const handleSelectSession = (session: HistorySession) => {
    setSelectedSession(session)
    fetchMessages(session.id)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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
      <Navbar currentPage="timetravel" />

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">时空穿梭</h2>
              <p className="text-white/80 text-sm">回顾与TA的美好时光</p>
            </div>
          </div>
        </div>

        {!selectedSession ? (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-800">历史会话</h3>
                <span className="text-xs text-gray-400 ml-auto">{history.length} 个会话</span>
              </div>

              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center text-xl">
                        {session.partnerAvatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800">{session.partnerName}</h4>
                          <span className="text-xs text-gray-400">{formatDate(session.createdAt)}</span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1 line-clamp-1">{session.preview}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MessageCircle className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{session.messageCount} 条消息</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">暂无历史记录</p>
                  <p className="text-gray-400 text-sm mt-1">开始你的第一次对话吧</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-gray-800">时光机提示</h3>
              </div>
              <p className="text-gray-600 text-sm">
                通过时空穿梭，你可以回顾与伴侣的每一次对话。每一段回忆都是你们关系成长的见证，珍惜每一次交流的机会。
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center text-lg">
                {selectedSession.partnerAvatar}
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{selectedSession.partnerName}</h4>
                <p className="text-xs text-gray-400">{formatDate(selectedSession.createdAt)}</p>
              </div>
            </div>

            <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                        {new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">暂无消息</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
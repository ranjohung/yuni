'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import { Send, Mic, Smile, Paperclip, ArrowLeft } from 'lucide-react'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

interface Partner {
  id: number
  name: string
  avatar: string
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [partner, setPartner] = useState<Partner | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchMessages()
    }
  }, [status])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/chat')
      const data = await response.json()

      if (data.error) {
        console.error('Failed to fetch messages:', data.error)
        return
      }

      if (data.partner) {
        setPartner(data.partner)
      }

      if (data.messages) {
        setMessages(data.messages.map((msg: Message) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        })))
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputValue }),
      })

      const data = await response.json()

      if (data.error) {
        console.error('Failed to send message:', data.error)
        return
      }

      if (data.userMessage) {
        setMessages((prev) => [...prev, {
          ...data.userMessage,
          createdAt: new Date(data.userMessage.createdAt),
        }])
      }

      if (data.assistantMessage) {
        setTimeout(() => {
          setMessages((prev) => [...prev, {
            ...data.assistantMessage,
            createdAt: new Date(data.assistantMessage.createdAt),
          }])
        }, 500)
      }

      setInputValue('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col">
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
            <span className="text-xl">{partner?.avatar || '💝'}</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800">{partner?.name || '伴侣'}</h1>
            <p className="text-xs text-green-500">在线</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-4 pb-24">
        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">{partner?.avatar || '💝'}</span>
              </div>
              <p className="text-lg font-medium">开始你的对话</p>
              <p className="text-sm mt-2">与{partner?.name || '你的伴侣'}聊聊吧</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${msg.role === 'user'
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
                    }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-gray-400'
                      }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4 bg-white rounded-2xl shadow-lg p-3">
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all">
              <Paperclip className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all">
              <Smile className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入消息..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />

            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all">
              <Mic className="w-5 h-5" />
            </button>

            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Navbar currentPage="chat" />
    </div>
  )
}

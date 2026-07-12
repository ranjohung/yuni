'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, RotateCcw, ArrowLeft, Heart } from 'lucide-react'

interface Partner {
  id: number
  name: string
  avatar: string
  affection: number
  isActive: boolean
}

export default function VoiceCallPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [partner, setPartner] = useState<Partner | null>(null)
  const [isCallActive, setIsCallActive] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [showReport, setShowReport] = useState(false)
  const [hangupReason, setHangupReason] = useState('')
  const [affectionChange, setAffectionChange] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPartnerHangup, setIsPartnerHangup] = useState(false)
  const [isCallEnding, setIsCallEnding] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hangupTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchPartnerData()
    }
  }, [status, router])

  const fetchPartnerData = async () => {
    try {
      const response = await fetch('/api/partner')
      const data = await response.json()
      if (Array.isArray(data)) {
        const activePartner = data.find((p: Partner) => p.isActive) || data[0]
        if (activePartner) {
          setPartner(activePartner)
        } else {
          setPartner({
            id: 0,
            name: '伴侣',
            avatar: '💝',
            affection: 50,
            isActive: false,
          })
        }
      }
    } catch (err) {
      console.error('Failed to fetch partner:', err)
    } finally {
      setLoading(false)
    }
  }

  // Call timer
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isCallActive])

  // Simulated partner hang-up logic
  useEffect(() => {
    if (isCallActive && partner && !isCallEnding) {
      if (partner.affection < 15) {
        const timeout = setTimeout(() => {
          handlePartnerHangup('好感度过低，伴侣不愿继续通话')
        }, 2000)
        hangupTimerRef.current = timeout
      } else {
        const randomDelay = 5000 + Math.random() * 5000
        const timeout = setTimeout(() => {
          const reasons = [
            '伴侣有事先离开了',
            '信号不太好，通话断开了',
            '伴侣觉得今天的对话有些尴尬',
            '伴侣收到了其他消息提醒',
          ]
          const reason = reasons[Math.floor(Math.random() * reasons.length)]
          handlePartnerHangup(reason)
        }, randomDelay)
        hangupTimerRef.current = timeout
      }
    }
    return () => {
      if (hangupTimerRef.current) clearTimeout(hangupTimerRef.current)
    }
  }, [isCallActive, partner, isCallEnding])

  const handlePartnerHangup = (reason: string) => {
    setIsCallEnding(true)
    setIsCallActive(false)
    setIsPartnerHangup(true)
    setHangupReason(reason)
    const change = partner && partner.affection < 15
      ? -5
      : -(Math.floor(Math.random() * 3) + 1)
    setAffectionChange(change)
    setTimeout(() => {
      setShowReport(true)
    }, 1500)
  }

  const handleHangup = () => {
    setIsCallEnding(true)
    setIsCallActive(false)
    setIsPartnerHangup(false)
    setHangupReason('你结束了通话')
    const change = partner ? Math.floor(Math.random() * 3) + 1 : 0
    setAffectionChange(change)
    setTimeout(() => {
      setShowReport(true)
    }, 1500)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleTimeTravel = () => {
    setShowReport(false)
    router.push('/timetravel')
  }

  const handleCallAgain = () => {
    setShowReport(false)
    setIsCallEnding(false)
    setCallDuration(0)
    setIsCallActive(true)
    setIsPartnerHangup(false)
    setHangupReason('')
    setAffectionChange(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex flex-col">
      {/* Top bar */}
      <div className="px-4 py-3">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <div className="max-w-lg mx-auto w-full flex flex-col items-center">
          {/* Partner avatar with pulse effect */}
          <div className="relative mb-8">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl relative z-10 ${
              isCallActive
                ? 'bg-gradient-to-br from-primary-400 to-secondary-400 shadow-lg shadow-primary-500/30'
                : 'bg-gradient-to-br from-gray-600 to-gray-500'
            }`}>
              {partner?.avatar || '💝'}
            </div>
            {isCallActive && (
              <>
                <div className="absolute inset-0 w-32 h-32 rounded-full animate-ping bg-primary-400/30 z-0" />
                <div className="absolute -inset-4 w-40 h-40 rounded-full animate-pulse bg-primary-500/10 z-0" style={{ animationDelay: '0.5s' }} />
                <div className="absolute -inset-8 w-48 h-48 rounded-full animate-pulse bg-secondary-500/10 z-0" style={{ animationDelay: '1s' }} />
              </>
            )}
          </div>

          {/* Partner name */}
          <h1 className="text-2xl font-bold text-white mb-2">
            {partner?.name || '伴侣'}
          </h1>

          {/* Call status */}
          <div className="flex items-center gap-2 mb-10">
            {isCallActive ? (
              <>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm">通话中</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-red-400 rounded-full" />
                <span className="text-red-400 text-sm">已挂断</span>
              </>
            )}
          </div>

          {/* Call duration */}
          <div className="text-white/60 text-sm font-mono mb-12">
            {formatDuration(callDuration)}
          </div>

          {/* Call buttons */}
          <div className="flex items-center gap-6">
            {/* Mute button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              disabled={!isCallActive}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isMuted
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              } ${!isCallActive ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Speaker button */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              disabled={!isCallActive}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isSpeakerOn
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              } ${!isCallActive ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>

            {/* Hangup button */}
            <button
              onClick={handleHangup}
              disabled={!isCallActive}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isCallActive
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600'
                  : 'bg-gray-600 text-white/40 cursor-not-allowed'
              }`}
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">通话分析报告</h2>
            </div>

            {/* Hangup reason */}
            <div className="bg-white/80 rounded-2xl p-4 mb-3 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">挂断原因</p>
              <p className="text-gray-800 font-medium">{hangupReason}</p>
            </div>

            {/* Suggestions */}
            <div className="bg-white/80 rounded-2xl p-4 mb-3 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">改进建议</p>
              <p className="text-gray-800 text-sm">
                {isPartnerHangup
                  ? partner && partner.affection < 15
                    ? '好感度过低，建议多聊天、送礼物提升好感度后再尝试通话'
                    : '通话时间较短，可以尝试寻找共同话题，延长通话时间'
                  : '主动结束通话也是一种礼貌，继续保持良好的沟通习惯'}
              </p>
            </div>

            {/* Affection change */}
            <div className="bg-white/80 rounded-2xl p-4 mb-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">好感度变化</p>
              <div className="flex items-center gap-2">
                <span className="text-gray-800 font-medium">
                  {partner?.affection || 50}%
                </span>
                <span className={`text-sm font-medium ${affectionChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {affectionChange >= 0 ? '+' : ''}{affectionChange}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, (partner?.affection || 50) + affectionChange))}%` }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleTimeTravel}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                时空穿梭
              </button>
              <button
                onClick={handleCallAgain}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all shadow-md"
              >
                <Phone className="w-4 h-4" />
                重新通话
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
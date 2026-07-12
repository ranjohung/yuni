'use client'

import { useState, useEffect, useCallback } from 'react'
import { SessionProvider } from 'next-auth/react'
import { Clock, Coffee, AlertCircle } from 'lucide-react'

interface SessionWrapperProps {
  children: React.ReactNode
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
  const [showAntiAddictionModal, setShowAntiAddictionModal] = useState(false)
  const [onlineMinutes, setOnlineMinutes] = useState(0)

  const resetOnlineTime = useCallback(() => {
    localStorage.setItem('yn_online_start', new Date().toISOString())
    setOnlineMinutes(0)
    setShowAntiAddictionModal(false)
  }, [])

  useEffect(() => {
    const startTime = localStorage.getItem('yn_online_start')
    if (startTime) {
      const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000)
      setOnlineMinutes(elapsed)
    } else {
      localStorage.setItem('yn_online_start', new Date().toISOString())
    }

    const interval = setInterval(() => {
      setOnlineMinutes((prev) => {
        const newTime = prev + 1
        if (newTime >= 120 && newTime % 120 === 0) {
          setShowAntiAddictionModal(true)
        }
        return newTime
      })
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <SessionProvider>
      {children}

      {showAntiAddictionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">休息一下吧</h3>
              <p className="text-gray-500 mb-2">
                您已经连续使用了 {Math.floor(onlineMinutes / 60)} 小时 {onlineMinutes % 60} 分钟
              </p>
              <p className="text-gray-400 text-sm mb-6">
                长时间使用可能会影响您的身心健康，请适当休息后再继续使用
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowAntiAddictionModal(false)}
                  className="py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <Coffee className="w-4 h-4" />
                  稍后提醒
                </button>
                <button
                  onClick={resetOnlineTime}
                  className="py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  开始休息
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SessionProvider>
  )
}

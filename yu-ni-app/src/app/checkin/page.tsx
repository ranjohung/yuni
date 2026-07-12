'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Calendar, Check, Gift, Star } from 'lucide-react'

export default function CheckInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [checkedIn, setCheckedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status !== 'authenticated') {
      return
    }

    const fetchCheckInStatus = async () => {
      try {
        const response = await fetch('/api/user/checkin-status')
        const result = await response.json()
        setCheckedIn(result.checkedIn || false)
        setStreak(result.streak || 0)
      } catch (error) {
        console.error('Failed to fetch checkin status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCheckInStatus()
  }, [session, status, router])

  const handleCheckIn = async () => {
    try {
      const response = await fetch('/api/user/checkin', { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        setCheckedIn(true)
        setStreak(result.streak || streak + 1)
      }
    } catch (error) {
      console.error('Checkin failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar currentPage="checkin" />

      <div className="max-w-lg mx-auto px-4 py-8 pb-24">
        <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${checkedIn ? 'bg-green-100' : 'bg-gradient-to-br from-primary-400 to-secondary-400'}`}>
            {checkedIn ? (
              <Check className="w-12 h-12 text-green-500" />
            ) : (
              <Calendar className="w-12 h-12 text-white" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {checkedIn ? '今日已签到' : '每日签到'}
          </h1>
          <p className="text-gray-500 mb-6">
            {checkedIn ? '明天再来签到吧！' : '签到获得好感度和积分奖励'}
          </p>

          <div className="flex justify-center gap-6 mb-8">
            <div className="bg-primary-50 rounded-xl p-4">
              <Star className="w-6 h-6 text-primary-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">连续签到</p>
              <p className="text-xl font-bold text-primary-500">{streak} 天</p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-4">
              <Gift className="w-6 h-6 text-secondary-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">今日奖励</p>
              <p className="text-xl font-bold text-secondary-500">+10 好感度</p>
            </div>
          </div>

          {!checkedIn && (
            <button
              onClick={handleCheckIn}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all shadow-lg"
            >
              立即签到
            </button>
          )}

          {checkedIn && (
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-green-600 font-medium">🎉 签到成功！获得 10 好感度</p>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">签到奖励规则</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">每日签到</span>
              <span className="font-medium text-primary-500">+10 好感度</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">连续签到 3 天</span>
              <span className="font-medium text-primary-500">+50 积分</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">连续签到 7 天</span>
              <span className="font-medium text-primary-500">+100 积分 + 神秘礼物</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

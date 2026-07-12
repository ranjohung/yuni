'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import {
  Share2, Gift, Trophy, Copy, Check, Users,
  ChevronRight, Medal, Crown, Star, Sparkles,
  ArrowLeft, Clock, RefreshCw
} from 'lucide-react'

interface InviteCode {
  code: string
  createdAt: string
  invitedCount: number
}

interface RewardRule {
  count: number
  points: number
  tickets: number
  label: string
  achieved: boolean
  claimed: boolean
}

interface RewardsData {
  invitedCount: number
  totalPoints: number
  totalTickets: number
  rewards: RewardRule[]
  nextReward: RewardRule | null
}

interface HistoryItem {
  id: number
  code: string
  status: string
  inviteeName: string | null
  createdAt: string
}

interface HistoryData {
  history: HistoryItem[]
  stats: { total: number; completed: number; pending: number }
}

interface LeaderboardEntry {
  rank: number
  userId: number
  name: string
  avatar: string
  count: number
  isMe: boolean
}

const RANK_BADGES: Record<number, { icon: string; color: string }> = {
  1: { icon: '👑', color: 'bg-yellow-100 text-yellow-600' },
  2: { icon: '🥈', color: 'bg-gray-100 text-gray-500' },
  3: { icon: '🥉', color: 'bg-orange-100 text-orange-500' },
}

export default function InvitePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'invite' | 'rewards' | 'history' | 'leaderboard'>('invite')
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null)
  const [rewards, setRewards] = useState<RewardsData | null>(null)
  const [history, setHistory] = useState<HistoryData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchAll()
    }
  }, [session, status, router])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [codeRes, rewardsRes, historyRes, leaderboardRes] = await Promise.all([
        fetch('/api/invite/code'),
        fetch('/api/invite/rewards'),
        fetch('/api/invite/history'),
        fetch('/api/invite/leaderboard'),
      ])
      const codeData = await codeRes.json()
      const rewardsData = await rewardsRes.json()
      const historyData = await historyRes.json()
      const leaderboardData = await leaderboardRes.json()

      if (codeData.success) setInviteCode(codeData)
      if (rewardsData.success) setRewards(rewardsData)
      if (historyData.success) setHistory(historyData)
      if (leaderboardData.success) setLeaderboard(leaderboardData.leaderboard || [])
    } catch (err) {
      console.error('Failed to fetch invite data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!inviteCode?.code) return
    try {
      await navigator.clipboard.writeText(inviteCode.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = inviteCode.code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    const shareUrl = `https://yuni.app/register?code=${inviteCode?.code}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: '与你 - AI社交模拟训练',
          text: `和我一起使用「与你」提升社交能力吧！我的邀请码：${inviteCode?.code}`,
          url: shareUrl,
        })
      } catch { /* user cancelled */ }
    } else {
      handleCopy()
    }
  }

  const handleClaimReward = async (count: number) => {
    setClaiming(count)
    try {
      const res = await fetch('/api/invite/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardCount: count }),
      })
      const data = await res.json()
      if (res.ok) {
        alert(data.message)
        fetchAll()
      } else {
        alert(data.error)
      }
    } catch {
      alert('领取失败，请重试')
    } finally {
      setClaiming(null)
    }
  }

  const handleRefreshCode = async () => {
    try {
      const res = await fetch('/api/invite/code', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setInviteCode(prev => prev ? { ...prev, code: data.code } : { code: data.code, createdAt: new Date().toISOString(), invitedCount: 0 })
      }
    } catch {
      alert('刷新失败，请重试')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const tabs = [
    { id: 'invite' as const, label: '邀请', icon: Share2 },
    { id: 'rewards' as const, label: '奖励', icon: Gift },
    { id: 'history' as const, label: '记录', icon: Users },
    { id: 'leaderboard' as const, label: '排行', icon: Trophy },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-lg mx-auto pb-24 px-4">
        {/* Header */}
        <div className="pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">邀请好友</h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">邀请好友加入，双方都能获得奖励</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-2xl shadow-sm p-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'invite' && (
          <div className="space-y-4">
            {/* Invite Code Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">分享邀请码</h2>
              <p className="text-gray-500 text-sm mb-6">
                {inviteCode?.invitedCount || 0} 位好友已通过你的邀请加入
              </p>

              {/* Code Display */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="text-3xl font-bold tracking-[0.3em] text-green-600 mb-3">
                  {inviteCode?.code || '------'}
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    分享
                  </button>
                </div>
              </div>

              {/* Refresh Code */}
              <button
                onClick={handleRefreshCode}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mx-auto transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                刷新邀请码
              </button>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">邀请规则</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 text-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                  <div>
                    <p className="text-gray-800 font-medium">分享邀请码</p>
                    <p className="text-gray-500 text-sm">将你的专属邀请码分享给好友</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 text-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                  <div>
                    <p className="text-gray-800 font-medium">好友注册</p>
                    <p className="text-gray-500 text-sm">好友在注册时填写你的邀请码</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 text-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                  <div>
                    <p className="text-gray-800 font-medium">双方获得奖励</p>
                    <p className="text-gray-500 text-sm">你获得积分和穿梭券，好友获得新人礼包</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <Gift className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">已邀请</p>
                  <p className="text-2xl font-bold text-gray-800">{rewards?.invitedCount || 0} 人</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-green-600 font-bold text-lg">{rewards?.totalPoints || 0}</p>
                  <p className="text-gray-500 text-xs">已得积分</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-emerald-600 font-bold text-lg">{rewards?.totalTickets || 0}</p>
                  <p className="text-gray-500 text-xs">已得穿梭券</p>
                </div>
              </div>
            </div>

            {/* Reward Milestones */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">奖励里程碑</h3>
              <div className="space-y-3">
                {rewards?.rewards.map((rule) => (
                  <div
                    key={rule.count}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      rule.claimed
                        ? 'border-green-200 bg-green-50'
                        : rule.achieved
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {rule.claimed ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : rule.achieved ? (
                          <Sparkles className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="font-medium text-gray-800">{rule.label}</span>
                      </div>
                      {rule.claimed ? (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">已领取</span>
                      ) : rule.achieved ? (
                        <button
                          onClick={() => handleClaimReward(rule.count)}
                          disabled={claiming === rule.count}
                          className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-colors disabled:opacity-50"
                        >
                          {claiming === rule.count ? '领取中...' : '领取'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">未达成</span>
                      )}
                    </div>
                    <div className="flex gap-3 text-sm text-gray-500">
                      <span>+{rule.points} 积分</span>
                      <span>+{rule.tickets} 穿梭券</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-gray-800">{history?.stats.total || 0}</p>
                <p className="text-gray-500 text-xs mt-1">总邀请</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{history?.stats.completed || 0}</p>
                <p className="text-gray-500 text-xs mt-1">已注册</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{history?.stats.pending || 0}</p>
                <p className="text-gray-500 text-xs mt-1">待注册</p>
              </div>
            </div>

            {/* History List */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">邀请记录</h3>
              {history?.history.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">暂无邀请记录</p>
                  <p className="text-gray-400 text-sm">分享邀请码给好友吧</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history?.history.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                        {item.inviteeName?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium truncate">{item.inviteeName || '等待注册'}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {item.status === 'completed' ? '已注册' : '待注册'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            {/* My Rank */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-sm">你的排名</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {leaderboard.find(u => u.isMe)?.rank
                      ? `第 ${leaderboard.find(u => u.isMe)?.rank} 名`
                      : '暂无排名'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">邀请人数</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {leaderboard.find(u => u.isMe)?.count || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">邀请排行榜</h3>
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">暂无排行榜数据</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.slice(0, 20).map((entry) => {
                    const badge = RANK_BADGES[entry.rank]
                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          entry.isMe ? 'bg-green-50 ring-1 ring-green-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Rank */}
                        <div className="w-8 text-center">
                          {badge ? (
                            <span className="text-xl">{badge.icon}</span>
                          ) : (
                            <span className="text-sm font-medium text-gray-400">{entry.rank}</span>
                          )}
                        </div>
                        {/* Avatar & Name */}
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                          {entry.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 font-medium truncate">
                            {entry.name}
                            {entry.isMe && <span className="text-xs text-green-500 ml-1">(你)</span>}
                          </p>
                        </div>
                        {/* Count */}
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-bold text-gray-700">{entry.count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Navbar currentPage="invite" />
    </div>
  )
}

function Lock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
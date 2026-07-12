'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Users, Trophy, Clock, Star, ChevronRight, Lock, Award, Calendar, Target, Heart } from 'lucide-react'

interface TrainingData {
  affectionScore: number
  scenes: Array<{
    id: number
    name: string
    description: string
    difficulty: number
    stage: number
    unlockAffection: number
    category: string
    icon: string
    time: string
    reward: string
  }>
  trainingRecords: Array<{
    id: number
    sceneId: number
    status: number
  }>
}

interface TrainingHistory {
  id: number
  sceneName: string
  score: number
  date: string
  affectionGain: number
  status: string
}

interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  unlocked: boolean
  date: string
}

const CATEGORIES = [
  { id: 'icebreak', name: '破冰', icon: '☕', color: 'bg-blue-100 text-blue-600' },
  { id: 'dating', name: '约会', icon: '💕', color: 'bg-pink-100 text-pink-600' },
  { id: 'workplace', name: '职场', icon: '💼', color: 'bg-orange-100 text-orange-600' },
  { id: 'social', name: '社交', icon: '👥', color: 'bg-green-100 text-green-600' },
]

const MOCK_HISTORY: TrainingHistory[] = [
  { id: 1, sceneName: '咖啡厅破冰', score: 85, date: '7月8日 15:30', affectionGain: 5, status: 'completed' },
  { id: 2, sceneName: '兴趣社群自我介绍', score: 72, date: '7月7日 20:15', affectionGain: 8, status: 'completed' },
  { id: 3, sceneName: '咖啡厅破冰', score: 68, date: '7月6日 18:00', affectionGain: 5, status: 'completed' },
  { id: 4, sceneName: '兴趣社群自我介绍', score: 90, date: '7月5日 21:00', affectionGain: 12, status: 'completed' },
  { id: 5, sceneName: '咖啡厅破冰', score: 78, date: '7月4日 19:30', affectionGain: 5, status: 'completed' },
]

const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: '初次训练', description: '完成第一次社交训练', icon: '🌟', unlocked: true, date: '7月4日' },
  { id: 2, name: '坚持不懈', description: '连续训练3天', icon: '🔥', unlocked: true, date: '7月6日' },
  { id: 3, name: '社交达人', description: '累计训练10次', icon: '👑', unlocked: false, date: '' },
  { id: 4, name: '完美表现', description: '获得一次满分', icon: '💎', unlocked: false, date: '' },
  { id: 5, name: '全能选手', description: '完成所有场景训练', icon: '🏆', unlocked: false, date: '' },
  { id: 6, name: '魅力四射', description: '累计好感度达到500', icon: '💖', unlocked: false, date: '' },
]

export default function TrainingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<TrainingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentCategory, setCurrentCategory] = useState('icebreak')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      const fetchData = async () => {
        try {
          const response = await fetch('/api/training/scenes')
          const result = await response.json()
          setData(result)
        } catch (error) {
          console.error('Failed to fetch training data:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    }
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentAffection = data?.affectionScore || 0
  const filteredScenes = data?.scenes?.filter(s => s.category === currentCategory) || []
  const completedCount = data?.scenes?.filter(s => {
    const record = data?.trainingRecords?.find(r => r.sceneId === s.id)
    return record?.status === 1
  }).length || 0
  const unlockedAchievements = MOCK_ACHIEVEMENTS.filter(a => a.unlocked).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar currentPage="training" />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">社交场景训练</h2>
              <p className="text-gray-500 text-sm">提升你的社交能力</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-primary-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary-500">{MOCK_HISTORY.length}</p>
              <p className="text-gray-500 text-sm">累计训练</p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-secondary-500">{completedCount}/{data?.scenes?.length || 0}</p>
              <p className="text-gray-500 text-sm">完成进度</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{unlockedAchievements}</p>
              <p className="text-gray-500 text-sm">获得徽章</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-3">场景分类</h3>
          <div className="flex justify-around">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCurrentCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  currentCategory === cat.id
                    ? `${cat.color} ring-2 ring-offset-1 ring-gray-200`
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span className="text-xs font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">场景列表</h3>
            <span className="text-xs text-gray-400">{filteredScenes.length} 个场景</span>
          </div>
          <div className="space-y-3">
            {filteredScenes.map((scene) => {
              const isUnlocked = currentAffection >= scene.unlockAffection
              const userRecord = data?.trainingRecords?.find((r) => r.sceneId === scene.id)
              const isCompleted = userRecord?.status === 1

              const handleClick = () => {
                if (isUnlocked) {
                  router.push(`/training/${scene.id}`)
                }
              }

              return (
                <div
                  key={scene.id}
                  onClick={handleClick}
                  className={`relative rounded-xl p-4 transition-all ${
                    isUnlocked
                      ? 'bg-white border border-gray-200 hover:border-primary-300 hover:shadow-md cursor-pointer'
                      : 'bg-gray-100 opacity-60'
                  }`}
                >
                  {!isUnlocked && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${
                        isCompleted
                          ? 'bg-green-100 text-green-500'
                          : isUnlocked
                          ? 'bg-primary-100 text-primary-500'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Trophy className="w-6 h-6" />
                      ) : (
                        <span>{scene.icon}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{scene.name}</h4>
                      <p className="text-gray-500 text-sm mt-1">{scene.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          难度 {scene.difficulty}星
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {scene.time}
                        </span>
                        <span className="text-xs px-2 py-1 bg-pink-50 text-pink-600 rounded-full flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {scene.reward}
                        </span>
                      </div>
                    </div>
                    {!isUnlocked && (
                      <span className="text-xs text-gray-400 mt-1">需要好感度 {scene.unlockAffection}</span>
                    )}
                    {isUnlocked && (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">训练记录</h3>
            <span className="text-xs text-primary-500 flex items-center gap-1">
              查看全部
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          <div className="space-y-3">
            {MOCK_HISTORY.slice(0, 3).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{record.sceneName}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {record.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-sm ${
                    record.score >= 80 ? 'text-green-500' : record.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {record.score}分
                  </span>
                  <span className="text-xs text-pink-500 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    +{record.affectionGain}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">成就徽章</h3>
            <span className="text-xs text-primary-500 flex items-center gap-1">
              查看全部
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {MOCK_ACHIEVEMENTS.map((achievement) => (
              <div
                key={achievement.id}
                className={`rounded-xl p-3 text-center ${
                  achievement.unlocked ? 'bg-white border border-gray-200' : 'bg-gray-100 opacity-50'
                }`}
              >
                <div className={`text-3xl mb-2 ${!achievement.unlocked ? 'grayscale' : ''}`}>
                  {achievement.icon}
                </div>
                <p className="font-medium text-gray-800 text-xs">{achievement.name}</p>
                {achievement.unlocked && (
                  <p className="text-xs text-green-500 mt-1">{achievement.date}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary-100 to-secondary-100 rounded-2xl p-5">
          <h3 className="font-bold text-gray-800 mb-3">训练小贴士</h3>
          <p className="text-gray-600 text-sm">
            每个场景都是一次成长的机会。不要担心失败，每次尝试都会让你变得更好。完成训练可以获得好感度奖励，解锁更多场景！
          </p>
        </div>
      </div>
    </div>
  )
}

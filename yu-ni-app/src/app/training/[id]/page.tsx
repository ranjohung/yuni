'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { ArrowLeft, Heart, Star, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface TrainingRound {
  ai: string
  options: Array<{
    text: string
    quality: 'good' | 'safe' | 'bad'
    affection: number
    response: string
  }>
}

interface TrainingScene {
  id: number
  title: string
  icon: string
  description: string
  difficulty: number
  time: string
  reward: string
  rounds: TrainingRound[]
}

const TRAINING_SCENES: Record<number, TrainingScene> = {
  1: {
    id: 1,
    title: '咖啡厅破冰',
    icon: '☕',
    description: '从环境开启话题，学习轻松聊天',
    difficulty: 1,
    time: '8分钟',
    reward: '+5',
    rounds: [
      {
        ai: '这家店的拿铁很出名，你平时喜欢喝什么？',
        options: [
          { text: '我更喜欢美式', quality: 'safe', affection: 3, response: '美式也很不错，清爽不甜腻~' },
          { text: '你推荐的这个听起来不错，我试试', quality: 'good', affection: 8, response: '太好了！这家的拉花也很精致哦。' },
          { text: '我不喝咖啡', quality: 'bad', affection: -2, response: '那店里还有其他饮品，我帮你看看？' }
        ]
      },
      {
        ai: '周末一般怎么过？',
        options: [
          { text: '宅家休息', quality: 'safe', affection: 3, response: '宅家也很舒服呢~' },
          { text: '最近在学做咖啡，还挺有意思的', quality: 'good', affection: 8, response: '哇，好厉害！下次一定要尝尝你做的~' },
          { text: '没什么', quality: 'bad', affection: -2, response: '...那下次我带你去一个有趣的地方吧？' }
        ]
      },
      {
        ai: '我最近在看一本书，特别有意思...',
        options: [
          { text: '什么书？', quality: 'good', affection: 8, response: '是《小王子》哦，每次读都有不同的感受。' },
          { text: '是吗', quality: 'safe', affection: 2, response: '嗯，讲的是关于成长和爱的故事。' },
          { text: '哦', quality: 'bad', affection: -3, response: '...好吧。那我们换个话题？' }
        ]
      }
    ]
  },
  2: {
    id: 2,
    title: '兴趣社群自我介绍',
    icon: '🎤',
    description: '自信表达，展现个人魅力',
    difficulty: 2,
    time: '10分钟',
    reward: '+8',
    rounds: [
      {
        ai: '欢迎加入！简单介绍一下自己吧~',
        options: [
          { text: '大家好，我平时喜欢看书', quality: 'safe', affection: 3, response: '欢迎！喜欢什么类型的书呢？' },
          { text: '大家好！我叫小雨，喜欢心理学和文学~', quality: 'good', affection: 8, response: '哇，心理学！以后可以多交流~' },
          { text: '嗯', quality: 'bad', affection: -2, response: '别紧张，随便说说就好~' }
        ]
      },
      {
        ai: '你最喜欢的一本书是什么？',
        options: [
          { text: '《百年孤独》', quality: 'safe', affection: 3, response: '经典之作！魔幻现实主义的巅峰~' },
          { text: '《被讨厌的勇气》！让我学会了课题分离', quality: 'good', affection: 8, response: '太棒了！阿德勒心理学很治愈呢~' },
          { text: '没有', quality: 'bad', affection: -2, response: '可以慢慢找，总会遇到喜欢的~' }
        ]
      },
      {
        ai: '加入社群有什么期待吗？',
        options: [
          { text: '想认识更多书友', quality: 'safe', affection: 3, response: '一定可以的！我们经常组织线下活动~' },
          { text: '希望能提升自己的表达能力', quality: 'good', affection: 8, response: '这个想法太好了！每周都有分享会~' },
          { text: '随便看看', quality: 'bad', affection: -2, response: '没关系，慢慢了解~' }
        ]
      }
    ]
  },
  3: {
    id: 3,
    title: '初次约会开场白',
    icon: '💕',
    description: '给对方留下好印象',
    difficulty: 2,
    time: '12分钟',
    reward: '+10',
    rounds: [
      {
        ai: '今天天气真不错，你平时周末都喜欢做什么？',
        options: [
          { text: '我喜欢看电影', quality: 'safe', affection: 3, response: '电影爱好者！最近有什么好看的推荐吗？' },
          { text: '我喜欢户外运动，比如爬山和跑步', quality: 'good', affection: 8, response: '哇，我也喜欢！下次可以一起去爬山~' },
          { text: '没什么特别的', quality: 'bad', affection: -2, response: '...那今天我带你去个好玩的地方吧。' }
        ]
      },
      {
        ai: '对了，你是怎么知道这家餐厅的？',
        options: [
          { text: '朋友推荐的', quality: 'safe', affection: 3, response: '看来你的朋友很有品味呢~' },
          { text: '我在网上看到评价很好，就想来试试', quality: 'good', affection: 8, response: '你很细心呢，谢谢你为今天做的准备~' },
          { text: '随便选的', quality: 'bad', affection: -2, response: '...好吧，希望不会让你失望。' }
        ]
      },
      {
        ai: '你觉得今天的约会怎么样？',
        options: [
          { text: '挺好的', quality: 'safe', affection: 3, response: '那就好~' },
          { text: '很开心！希望下次还能一起出来', quality: 'good', affection: 10, response: '我也是！期待下次见面~' },
          { text: '一般般', quality: 'bad', affection: -3, response: '抱歉让你失望了...' }
        ]
      }
    ]
  },
  4: {
    id: 4,
    title: '约会话题延伸',
    icon: '💬',
    description: '深入交流，增进了解',
    difficulty: 3,
    time: '10分钟',
    reward: '+8',
    rounds: [
      {
        ai: '我发现你对艺术很感兴趣？',
        options: [
          { text: '是的，我喜欢看画展', quality: 'safe', affection: 3, response: '艺术能让人心情平静呢~' },
          { text: '是的！我从小就学画画，你怎么知道的？', quality: 'good', affection: 8, response: '从你的气质就能看出来，很有艺术感~' },
          { text: '一般吧', quality: 'bad', affection: -2, response: '好吧...' }
        ]
      },
      {
        ai: '如果可以去任何地方旅行，你想去哪里？',
        options: [
          { text: '日本', quality: 'safe', affection: 3, response: '日本的樱花很美呢~' },
          { text: '我想去冰岛看极光！一直是我的梦想', quality: 'good', affection: 8, response: '太棒了！极光真的很美，希望有一天能一起去~' },
          { text: '没想过', quality: 'bad', affection: -2, response: '可以慢慢想想~' }
        ]
      },
      {
        ai: '你觉得什么样的关系最理想？',
        options: [
          { text: '互相尊重吧', quality: 'safe', affection: 3, response: '是的，尊重很重要~' },
          { text: '我觉得是互相理解和支持，一起成长', quality: 'good', affection: 10, response: '说得真好！这也是我向往的~' },
          { text: '不知道', quality: 'bad', affection: -2, response: '...嗯。' }
        ]
      }
    ]
  },
  5: {
    id: 5,
    title: '职场会议发言',
    icon: '💼',
    description: '在会议中自信表达观点',
    difficulty: 2,
    time: '8分钟',
    reward: '+6',
    rounds: [
      {
        ai: '小李，你对这个方案有什么看法？',
        options: [
          { text: '我觉得方案挺好的', quality: 'safe', affection: 3, response: '谢谢你的认可~' },
          { text: '方案整体不错，但在预算方面可能需要再优化一下', quality: 'good', affection: 8, response: '很有见地！具体说说你的想法？' },
          { text: '没意见', quality: 'bad', affection: -2, response: '好吧...' }
        ]
      },
      {
        ai: '那你有什么具体的建议吗？',
        options: [
          { text: '可以考虑缩减非必要开支', quality: 'safe', affection: 3, response: '这个方向不错~' },
          { text: '我整理了几个优化方案，主要从人力成本和资源调配两方面入手', quality: 'good', affection: 10, response: '准备得很充分！请详细讲讲~' },
          { text: '暂时没想到', quality: 'bad', affection: -3, response: '好吧，那我们继续讨论其他的。' }
        ]
      }
    ]
  },
  6: {
    id: 6,
    title: '向领导汇报工作',
    icon: '📊',
    description: '清晰专业地展示工作成果',
    difficulty: 3,
    time: '10分钟',
    reward: '+8',
    rounds: [
      {
        ai: '这周工作进展怎么样？',
        options: [
          { text: '还行', quality: 'safe', affection: 3, response: '还行？具体说说~' },
          { text: '这周完成了三个核心任务，效率提升了20%', quality: 'good', affection: 10, response: '很不错！继续保持~' },
          { text: '一般', quality: 'bad', affection: -2, response: '遇到什么困难了吗？' }
        ]
      },
      {
        ai: '下个月的目标是什么？',
        options: [
          { text: '完成项目交付', quality: 'safe', affection: 3, response: '这是基本要求~' },
          { text: '我计划提前一周完成项目，并优化流程提高效率', quality: 'good', affection: 10, response: '很有挑战性！我相信你能做到~' },
          { text: '还没想好', quality: 'bad', affection: -3, response: '要尽快制定计划啊。' }
        ]
      }
    ]
  },
  7: {
    id: 7,
    title: '朋友聚会活跃气氛',
    icon: '👥',
    description: '让聚会更有趣',
    difficulty: 2,
    time: '8分钟',
    reward: '+5',
    rounds: [
      {
        ai: '今天聚会感觉有点冷清，你有什么好主意吗？',
        options: [
          { text: '不如玩个游戏吧', quality: 'safe', affection: 3, response: '好主意！玩什么呢？' },
          { text: '我来带大家玩个有趣的小游戏，保证热闹起来', quality: 'good', affection: 8, response: '太棒了！交给你了~' },
          { text: '不知道', quality: 'bad', affection: -2, response: '好吧...' }
        ]
      },
      {
        ai: '大家好像不太熟，怎么让气氛更融洽？',
        options: [
          { text: '让大家自我介绍一下吧', quality: 'safe', affection: 3, response: '可以试试~' },
          { text: '我来组织个破冰游戏，让大家快速熟悉起来', quality: 'good', affection: 10, response: '你真会调动气氛！' },
          { text: '顺其自然吧', quality: 'bad', affection: -2, response: '好吧...' }
        ]
      }
    ]
  },
  8: {
    id: 8,
    title: '处理冲突与分歧',
    icon: '⚖️',
    description: '学会理性沟通解决问题',
    difficulty: 4,
    time: '10分钟',
    reward: '+8',
    rounds: [
      {
        ai: '你觉得这个方案应该这样做，但我认为那样更好...',
        options: [
          { text: '那按你的来吧', quality: 'safe', affection: 3, response: '那好吧...' },
          { text: '我们各自说说理由，一起分析哪个更合适', quality: 'good', affection: 10, response: '这才是解决问题的态度！' },
          { text: '你不懂', quality: 'bad', affection: -5, response: '...我很受伤。' }
        ]
      },
      {
        ai: '我觉得你对我的方案有偏见...',
        options: [
          { text: '我没有', quality: 'safe', affection: 2, response: '希望如此...' },
          { text: '我理解你的感受，但我是就事论事，我们可以一起优化', quality: 'good', affection: 10, response: '谢谢你的理解，我们一起努力~' },
          { text: '随便你怎么想', quality: 'bad', affection: -5, response: '...算了。' }
        ]
      }
    ]
  }
}

interface ChatMessage {
  type: 'ai' | 'user'
  content: string
  quality?: 'good' | 'safe' | 'bad'
}

export default function TrainingDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const sceneId = parseInt(params.id as string)

  const [currentScene, setCurrentScene] = useState<TrainingScene | null>(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [totalScore, setTotalScore] = useState(0)
  const [totalAffection, setTotalAffection] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    const scene = TRAINING_SCENES[sceneId]
    if (scene) {
      setCurrentScene(scene)
      setChatMessages([{ type: 'ai', content: scene.rounds[0].ai }])
      setCurrentRound(0)
      setTotalScore(0)
      setTotalAffection(0)
      setIsFinished(false)
      setFeedback('')
    } else {
      router.push('/training')
    }
  }, [sceneId, status, router])

  const handleSelectOption = (option: { text: string; quality: 'good' | 'safe' | 'bad'; affection: number; response: string }) => {
    if (!currentScene || isFinished) return

    const newMessages: ChatMessage[] = [
      ...chatMessages,
      { type: 'user', content: option.text, quality: option.quality },
      { type: 'ai', content: option.response }
    ]

    setChatMessages(newMessages)

    const maxScore = currentScene.rounds.length * 100 / 3
    let scoreGain = 0
    switch (option.quality) {
      case 'good':
        scoreGain = 100 / 3
        break
      case 'safe':
        scoreGain = 60 / 3
        break
      case 'bad':
        scoreGain = 20 / 3
        break
    }

    setTotalScore(prev => Math.min(maxScore, prev + scoreGain))
    setTotalAffection(prev => prev + option.affection)

    if (currentRound < currentScene.rounds.length - 1) {
      setTimeout(() => {
        setCurrentRound(prev => prev + 1)
      }, 500)
    } else {
      setTimeout(() => {
        setIsFinished(true)
        const finalScore = Math.round(totalScore + scoreGain)
        if (finalScore >= 90) {
          setFeedback('太棒了！你的社交能力很强~')
        } else if (finalScore >= 60) {
          setFeedback('表现不错！继续加油~')
        } else {
          setFeedback('别灰心，多练习几次就会越来越好的！')
        }
      }, 500)
    }
  }

  const handleBack = () => {
    router.push('/training')
  }

  const handleRetry = () => {
    if (currentScene) {
      setChatMessages([{ type: 'ai', content: currentScene.rounds[0].ai }])
      setCurrentRound(0)
      setTotalScore(0)
      setTotalAffection(0)
      setIsFinished(false)
      setFeedback('')
    }
  }

  if (!currentScene) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar currentPage="training" />

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 mb-4 hover:text-primary-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回训练列表</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center text-2xl">
              {currentScene.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800">{currentScene.title}</h1>
              <p className="text-gray-500 text-sm mt-1">{currentScene.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  难度 {currentScene.difficulty}星
                </span>
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {currentScene.time}
                </span>
                <span className="text-xs px-2 py-1 bg-pink-50 text-pink-600 rounded-full flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {currentScene.reward}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>进度</span>
              <span>{currentRound + 1} / {currentScene.rounds.length}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 transition-all duration-300"
                style={{ width: `${((currentRound + 1) / currentScene.rounds.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4 min-h-[300px]">
          <div className="space-y-4">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'ai' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.type === 'ai'
                      ? 'bg-gradient-to-br from-primary-50 to-secondary-50 text-gray-800 rounded-tl-none'
                      : message.quality === 'good'
                      ? 'bg-green-100 text-green-800 rounded-tr-none'
                      : message.quality === 'bad'
                      ? 'bg-red-100 text-red-800 rounded-tr-none'
                      : 'bg-primary-500 text-white rounded-tr-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.type === 'user' && message.quality && (
                    <div className="flex items-center gap-1 mt-2">
                      {message.quality === 'good' && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          优秀
                        </span>
                      )}
                      {message.quality === 'safe' && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <AlertCircle className="w-3 h-3" />
                          一般
                        </span>
                      )}
                      {message.quality === 'bad' && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <XCircle className="w-3 h-3" />
                          不太合适
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isFinished && currentScene.rounds[currentRound] && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-medium text-gray-800 mb-3">选择你的回应</h3>
            <div className="space-y-3">
              {currentScene.rounds[currentRound].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectOption(option)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
                >
                  <p className="text-gray-800 text-sm">{option.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {option.affection > 0 && (
                      <span className="text-xs text-pink-500 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        +{option.affection}
                      </span>
                    )}
                    {option.affection < 0 && (
                      <span className="text-xs text-red-500 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {option.affection}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isFinished && (
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">训练完成！</h2>
            <p className="text-gray-600 mb-4">{feedback}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4">
                <p className="text-3xl font-bold text-primary-500">{Math.round(totalScore)}</p>
                <p className="text-gray-500 text-sm">得分</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="text-3xl font-bold text-pink-500">{totalAffection > 0 ? `+${totalAffection}` : totalAffection}</p>
                <p className="text-gray-500 text-sm">好感度</p>
              </div>
            </div>

            <button
              onClick={handleRetry}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              再练一次
            </button>

            <button
              onClick={handleBack}
              className="w-full py-3 mt-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              返回训练列表
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
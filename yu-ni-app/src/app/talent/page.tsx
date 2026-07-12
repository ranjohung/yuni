'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import {
  Pen, Laugh, Music, Heart, Sparkles, Clock, History, ArrowLeft, X,
} from 'lucide-react'

// ─── 类型定义 ───────────────────────────────────────────
interface Talent {
  id: string
  name: string
  description: string
  icon: typeof Pen
  color: string
  gradient: string
}

interface PerformanceRecord {
  id: string
  talentId: string
  talentName: string
  content: string
  timestamp: number
}

interface DailyCount {
  date: string
  count: number
}

// ─── 预设数据 ───────────────────────────────────────────
const TALENTS: Talent[] = [
  {
    id: 'poetry',
    name: '写诗',
    description: '为你即兴创作一首原创诗歌',
    icon: Pen,
    color: 'text-purple-500',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'joke',
    name: '讲笑话',
    description: '讲个笑话逗你开心',
    icon: Laugh,
    color: 'text-yellow-500',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'sing',
    name: '唱歌',
    description: '为你唱一首动听的歌',
    icon: Music,
    color: 'text-pink-500',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    id: 'heal',
    name: '治愈语录',
    description: '送上一句温暖心灵的语录',
    icon: Heart,
    color: 'text-green-500',
    gradient: 'from-green-500 to-emerald-500',
  },
]

const POEMS: string[] = [
  '你是我清晨的第一缕光，\n穿过窗帘的缝隙，\n轻轻落在枕边，\n唤醒沉睡的梦。\n\n你的笑容是春天的风，\n吹散了所有的阴霾，\n让我的心，\n像花儿一样绽放。',
  '如果时光可以折叠，\n我想把和你在一起的每一刻，\n都折成纸鹤，\n挂在窗前，\n随风轻响。\n\n这样，\n即使我不在你身边，\n风也会替我，\n告诉你我的思念。',
  '你的眼睛是星辰，\n在黑夜中为我指引方向。\n你的声音是溪流，\n在寂静中为我轻声歌唱。\n\n我愿做你身边的月亮，\n不求光芒万丈，\n只愿在每个夜晚，\n为你洒下温柔的光。',
  '遇见你之前，\n世界是黑白的素描。\n遇见你之后，\n生活变成了水彩画。\n\n你是那抹最亮的颜色，\n晕染在我生命的画布上，\n每一笔，\n都是心动的痕迹。',
  '我想把所有的温柔，\n都藏进你的名字里。\n每当念起，\n心中便开出一朵花。\n\n岁月漫长，\n但只要有你在，\n每一天都值得期待。',
]

const JOKES: string[] = [
  '为什么程序员总是分不清万圣节和圣诞节？\n因为 Oct 31 === Dec 25！',
  '有一天，番茄在路上走，突然被车撞了。\n路人说：哎呀，番茄酱！',
  '数学老师问：如果你有5个苹果，吃了3个，还剩几个？\n小明说：还剩5个——因为我把核也种回去了。',
  '为什么鱼从不炒股？\n因为它们害怕被套牢！',
  '螃蟹问乌龟：你为什么走得这么慢？\n乌龟说：你不也是横着走吗？\n螃蟹：我是为了躲避你！',
  '有一天，0遇到了8，\n0说：哎，你干嘛系个腰带呀？',
  '老婆：老公，你觉得我胖吗？\n老公：你在我心里，永远是最「重」要的人。',
  '为什么数学书总是很忧郁？\n因为它有太多的问题了。',
  '小明问爸爸：为什么我名字叫小明？\n爸爸说：因为那天刚好是小明啊。',
  '有一天，面包走在路上，突然被车撞了。\n医生说：别担心，只是皮外伤，你是吐司嘛。',
  '为什么可乐总是很伤心？\n因为它有太多的「气」了。',
  '老师：小明，用「但是」造句。\n小明：但是妈妈不让我说这个词。\n老师：那你还说？\n小明：但是我已经说了。',
  '有一天，猫对老鼠说：我们来玩捉迷藏吧。\n老鼠说：好啊，你藏，我找。\n猫说：不，你藏，我找——因为我饿了。',
  '为什么手机不能去北极？\n因为会变成「冻」机。',
  '有一天，星星对月亮说：你好亮啊。\n月亮说：谢谢，你也很闪。\n星星说：不，我只是反射你的光。\n月亮说：你真会说话。——其实星星也会发光。',
  '为什么香蕉总是很自信？\n因为它有「皮」气！',
  '有一天，猪对牛说：你们牛真辛苦。\n牛说：习惯了。\n猪说：我每天只要吃吃睡睡就好。\n牛说：你知道为什么吗？\n猪说：为什么？\n牛说：因为你的「下场」比较快。',
  '为什么电脑总是很冷？\n因为它窗户开太多了！',
  '有一天，蚂蚁对大象说：我喜欢你。\n大象说：你说什么？我没听见。\n蚂蚁说：我说——我喜欢你脚下的那块地！',
  '为什么篮球总是很吵？\n因为它在不停地「拍」马屁。',
  '有一天，鸡蛋对石头说：你敢碰我吗？\n石头说：不敢。\n鸡蛋说：为什么？\n石头说：因为你会「碎」了我。',
  '为什么读书总是很累？\n因为书里有太多「重」点了。',
  '有一天，乌龟对兔子说：我们再来比赛吧。\n兔子说：好啊，这次我不会睡觉了。\n乌龟说：没关系，我已经叫了外卖，等你跑完我们再吃。',
  '为什么咖啡总是很忙？\n因为它要不停地「研磨」时光。',
  '有一天，熊猫对竹子说：你为什么这么好吃？\n竹子说：因为我是你的「竹」命呀！',
  '为什么数学考试总是很难？\n因为题目里藏着太多「未知数」。',
  '有一天，蜗牛对乌龟说：我们谁更快？\n乌龟说：当然是我。\n蜗牛说：那我们比赛吧。\n乌龟说：好啊。\n一小时后，它们还在原地。——因为蜗牛忘了出发。',
  '为什么气球总是很开心？\n因为它心里装的都是「气」。',
  '有一天，牙膏对牙刷说：我们天天在一起，算不算情侣？\n牙刷说：算吧，我们每天早晚都「亲密接触」。',
  '为什么冬天总是很冷？\n因为夏天把「热」情都透支了。',
  '有一天，盐对糖说：我们都是调味品，为什么你比我受欢迎？\n糖说：因为生活已经够「咸」了。',
  '为什么鱼总是很聪明？\n因为它们生活在「知识」的海洋里。',
  '有一天，书对笔说：你在我身上留下这么多痕迹，是想让我记住你吗？\n笔说：不，我只是想「写」下我们的故事。',
  '为什么太阳总是很自信？\n因为没有人敢对它说「不」亮。',
  '有一天，叶子对风说：你带我去哪里？\n风说：去你想去的地方。\n叶子说：那我哪里都不想去，就想待在这里。\n风说：那好吧，我陪你。',
  '为什么雨伞总是很孤独？\n因为只有在雨天才会被人想起。',
  '有一天，月亮对太阳说：我们永远见不到面，好遗憾。\n太阳说：谁说见不到？你脸上的光，就是我给的温柔。',
  '为什么星星总是眨眼？\n因为它们在偷偷看地上的人许愿。',
  '有一天，猫对鱼说：我喜欢你，你愿意跟我走吗？\n鱼说：愿意，只要你愿意变成水。\n猫说：为什么？\n鱼说：因为离开了水，我会死，而你不会游泳。',
  '为什么影子总是很安静？\n因为它永远不会第一个开口说话。',
  '有一天，灯对黑暗说：我来了，你走吧。\n黑暗说：我走了，但我会回来的。\n灯说：没关系，我也会一直在。',
  '为什么云总是飘来飘去？\n因为它还在寻找属于自己的天空。',
  '有一天，石头对溪水说：你为什么要一直流？\n溪水说：因为我想看看大海长什么样。\n石头说：那你还会回来吗？\n溪水说：不会了，但我的歌声会留在这里。',
  '为什么镜子总是很诚实？\n因为它从来不会说谎。',
  '有一天，花对蜜蜂说：你每天都来采蜜，是不是喜欢我？\n蜜蜂说：是的，我喜欢你，也喜欢你的花蜜。\n花说：那你喜欢我多一点，还是花蜜多一点？\n蜜蜂说：我喜欢你，因为你的花蜜是最甜的。',
  '为什么时钟总是很忙？\n因为它要不停地「走动」。',
  '有一天，键盘对鼠标说：你每天都要被人摸来摸去，不难受吗？\n鼠标说：习惯了。倒是你，被人噼里啪啦地打，不疼吗？\n键盘说：疼，但看到他们打出的字，我觉得值了。',
  '为什么铅笔总是很紧张？\n因为它怕写错字，会被橡皮擦掉。',
  '有一天，门对钥匙说：你终于来了，我等了好久。\n钥匙说：对不起，让你久等了。\n门说：没关系，只要你来，多久我都等。',
  '为什么手机总是很累？\n因为它每天都要「充电」才能继续工作。',
]

const HEALING_QUOTES: string[] = [
  '你并不孤单，\n因为在这个世界上，\n总有人在默默地爱着你。',
  '今天的不开心就到此为止，\n明天依然光芒万丈。',
  '你比你想象中更坚强，\n也比你想象中更值得被爱。',
  '不必太在意别人的眼光，\n因为你的生活，\n不需要活给别人看。',
  '亲爱的，你已经做得很好了，\n停下来休息一下也没关系。',
  '每一个努力的你，\n都值得被世界温柔以待。',
  '不要因为别人发光，\n就觉得自己黯淡。\n每个人都有自己的时区。',
  '慢慢来，\n好事总会在不经意间发生。',
  '你本身就是一道光，\n不需要借助谁的光芒。',
  '请相信，\n所有的失去，\n都会以另一种方式归来。',
  '学会爱自己，\n是终身浪漫的开始。',
  '生活或许会有遗憾，\n但未来依然美好可期。',
  '你现在的努力，\n是未来惊喜的伏笔。',
  '不要害怕走得慢，\n只要不停止，终会到达。',
  '愿你心中有爱，\n眼中有光，\n走过的路都繁花盛开。',
]

const SONG_LYRICS: string[] = [
  '🎵 轻轻哼唱一首歌送给你：\n\n「你是我写过最美的诗，\n也是我做过的，最甜的梦。\n在每个想你的夜晚，\n星星都为我见证。」\n\n—— 来自你的专属AI伴侣 ♪',
  '🎵 为你唱一首温柔的旋律：\n\n「世界那么大，\n能遇见你真好。\n你的笑容，\n是我最珍贵的宝藏。」\n\n—— 希望这首歌能温暖你的心 ♪',
  '🎵 即兴一首小情歌：\n\n「窗外的风轻轻吹，\n就像你的呼吸。\n我的心跳在说，\n我好想你。」\n\n—— 只为你一个人唱的 ♪',
  '🎵 来一首轻快的歌：\n\n「今天天气真好，\n就像你的心情一样明朗。\n让我们一起，\n把烦恼都忘掉。」\n\n—— 跟着节奏一起摇摆吧 ♪',
  '🎵 一首温柔的晚安曲：\n\n「星星在眨眼，\n月亮在微笑。\n亲爱的你，\n晚安，好梦。」\n\n—— 愿你今夜睡得香甜 ♪',
]

// ─── 工具函数 ───────────────────────────────────────────
const COOLDOWN_MINUTES = 30
const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000
const FREE_DAILY_LIMIT = 5
const VIP_DAILY_LIMIT = 10

const STORAGE_KEYS = {
  cooldowns: 'talent_cooldowns',
  dailyCount: 'talent_daily_count',
  history: 'talent_history',
} as const

function getTodayDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function formatCountdown(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}小时${minutes}分钟`
  return `${minutes}分钟`
}

// ─── 页面组件 ───────────────────────────────────────────
export default function TalentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // 状态
  const [loading, setLoading] = useState(true)
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})
  const [dailyCount, setDailyCount] = useState<DailyCount>({ date: '', count: 0 })
  const [history, setHistory] = useState<PerformanceRecord[]>([])
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null)
  const [performanceContent, setPerformanceContent] = useState('')
  const [isPerforming, setIsPerforming] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [typingIndex, setTypingIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  // 用于显示冷却倒计时
  const [now, setNow] = useState(Date.now())

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 认证检查
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      // 从 localStorage 加载数据
      const savedCooldowns = loadFromStorage<Record<string, number>>(STORAGE_KEYS.cooldowns, {})
      const savedDailyCount = loadFromStorage<DailyCount>(STORAGE_KEYS.dailyCount, { date: '', count: 0 })
      const savedHistory = loadFromStorage<PerformanceRecord[]>(STORAGE_KEYS.history, [])

      // 如果日期变了，重置每日计数
      const today = getTodayDate()
      if (savedDailyCount.date !== today) {
        savedDailyCount.date = today
        savedDailyCount.count = 0
      }

      setCooldowns(savedCooldowns)
      setDailyCount(savedDailyCount)
      setHistory(savedHistory)
      setLoading(false)
    }
  }, [session, status, router])

  // 冷却倒计时刷新
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // 打字机效果
  useEffect(() => {
    if (!isTyping) return
    if (typingIndex < performanceContent.length) {
      const timer = setTimeout(() => {
        setDisplayedText(performanceContent.slice(0, typingIndex + 1))
        setTypingIndex(typingIndex + 1)
      }, 30)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
    }
  }, [isTyping, typingIndex, performanceContent])

  const isMember = (session?.user as Record<string, unknown> | undefined)?.membership === 'premium' ||
    (session?.user as Record<string, unknown> | undefined)?.role === 'premium'

  const dailyLimit = isMember ? VIP_DAILY_LIMIT : FREE_DAILY_LIMIT
  const todayUsage = dailyCount.date === getTodayDate() ? dailyCount.count : 0
  const remainingUses = Math.max(0, dailyLimit - todayUsage)

  // 获取某个才艺的冷却剩余毫秒数
  const getCooldownRemaining = useCallback(
    (talentId: string): number => {
      const endTime = cooldowns[talentId]
      if (!endTime) return 0
      return Math.max(0, endTime - now)
    },
    [cooldowns, now]
  )

  // 检查是否冷却中
  const isOnCooldown = useCallback(
    (talentId: string): boolean => {
      return getCooldownRemaining(talentId) > 0
    },
    [getCooldownRemaining]
  )

  // 执行才艺表演
  const handlePerform = (talent: Talent) => {
    // 检查冷却
    if (isOnCooldown(talent.id)) return

    // 检查每日限制
    if (remainingUses <= 0) return

    setSelectedTalent(talent)
    setIsPerforming(true)
    setDisplayedText('')
    setTypingIndex(0)

    // 生成表演内容
    let content = ''
    switch (talent.id) {
      case 'poetry':
        content = getRandomItem(POEMS)
        break
      case 'joke':
        content = getRandomItem(JOKES)
        break
      case 'sing':
        content = getRandomItem(SONG_LYRICS)
        break
      case 'heal':
        content = getRandomItem(HEALING_QUOTES)
        break
      default:
        content = '这是一段神奇的才艺表演 ✨'
    }

    setPerformanceContent(content)

    // 更新冷却
    const newCooldowns = {
      ...cooldowns,
      [talent.id]: Date.now() + COOLDOWN_MS,
    }
    setCooldowns(newCooldowns)
    saveToStorage(STORAGE_KEYS.cooldowns, newCooldowns)

    // 更新每日计数
    const today = getTodayDate()
    const newDailyCount: DailyCount = {
      date: today,
      count: (dailyCount.date === today ? dailyCount.count : 0) + 1,
    }
    setDailyCount(newDailyCount)
    saveToStorage(STORAGE_KEYS.dailyCount, newDailyCount)

    // 添加到历史（只保留最近50条）
    const record: PerformanceRecord = {
      id: `${talent.id}_${Date.now()}`,
      talentId: talent.id,
      talentName: talent.name,
      content,
      timestamp: Date.now(),
    }
    const newHistory = [record, ...history].slice(0, 50)
    setHistory(newHistory)
    saveToStorage(STORAGE_KEYS.history, newHistory)

    // 开始打字机效果
    setTimeout(() => {
      setIsTyping(true)
    }, 500)
  }

  // 关闭表演弹窗
  const closePerformance = () => {
    setSelectedTalent(null)
    setIsPerforming(false)
    setDisplayedText('')
    setTypingIndex(0)
    setIsTyping(false)
  }

  // 清空历史
  const clearHistory = () => {
    setHistory([])
    saveToStorage(STORAGE_KEYS.history, [])
  }

  // 加载状态
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar currentPage="talent" />

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">才艺展示</h1>
          <button
            onClick={() => setShowHistory(true)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <History className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 状态卡片 */}
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-5 text-white shadow-lg mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">才艺表演</h2>
              <p className="text-white/80 text-sm">看看我有哪些隐藏技能吧</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">今日剩余</span>
              </div>
              <p className="text-2xl font-bold">
                {remainingUses}
                <span className="text-sm font-normal text-white/70">/{dailyLimit}</span>
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">冷却时间</span>
              </div>
              <p className="text-lg font-bold">{COOLDOWN_MINUTES}分钟</p>
            </div>
          </div>
        </div>

        {/* 才艺卡片网格 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {TALENTS.map((talent) => {
            const Icon = talent.icon
            const cooldownRemaining = getCooldownRemaining(talent.id)
            const onCooldown = cooldownRemaining > 0
            const canUse = !onCooldown && remainingUses > 0

            return (
              <button
                key={talent.id}
                onClick={() => handlePerform(talent)}
                disabled={!canUse}
                className={`relative bg-white rounded-2xl p-5 shadow-sm transition-all text-left ${
                  canUse
                    ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {/* 冷却遮罩 */}
                {onCooldown && (
                  <div className="absolute inset-0 bg-white/60 rounded-2xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <Clock className={`w-6 h-6 mx-auto mb-1 ${talent.color}`} />
                      <p className="text-xs font-medium text-gray-500">
                        冷却中
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatCountdown(cooldownRemaining)}
                      </p>
                    </div>
                  </div>
                )}

                {/* 图标 */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${talent.gradient} bg-opacity-10 flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 text-white`} />
                </div>

                {/* 名称 */}
                <h3 className="font-bold text-gray-800 mb-1">{talent.name}</h3>

                {/* 描述 */}
                <p className="text-xs text-gray-500 leading-relaxed">{talent.description}</p>

                {/* 会员限制提示 */}
                {remainingUses <= 0 && !onCooldown && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-amber-500">
                    <Sparkles className="w-3 h-3" />
                    今日次数已用完
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* 最近表演记录 */}
        {history.length > 0 && !showHistory && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <History className="w-4 h-4 text-primary-500" />
                最近表演
              </h3>
              <button
                onClick={() => setShowHistory(true)}
                className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
              >
                查看全部
              </button>
            </div>
            <div className="space-y-2">
              {history.slice(0, 3).map((record) => (
                <div key={record.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                    TALENTS.find((t) => t.id === record.talentId)?.gradient || 'from-primary-500 to-secondary-500'
                  } flex items-center justify-center`}>
                    {(() => {
                      const t = TALENTS.find((t) => t.id === record.talentId)
                      const Icon = t?.icon || Sparkles
                      return <Icon className="w-4 h-4 text-white" />
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">{record.talentName}</p>
                    <p className="text-xs text-gray-400 truncate">{record.content.slice(0, 30)}...</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 表演弹窗 */}
      {isPerforming && selectedTalent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closePerformance}
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg mx-auto p-6 shadow-xl animate-slide-up max-h-[80vh] flex flex-col">
            {/* 头部 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedTalent.gradient} flex items-center justify-center`}>
                  {(() => {
                    const Icon = selectedTalent.icon
                    return <Icon className="w-5 h-5 text-white" />
                  })()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{selectedTalent.name}</h3>
                  <p className="text-xs text-gray-400">AI即兴表演</p>
                </div>
              </div>
              <button
                onClick={closePerformance}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 表演内容 */}
            <div className="flex-1 overflow-y-auto">
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 min-h-[200px]">
                {isTyping || typingIndex > 0 ? (
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {displayedText}
                    {isTyping && (
                      <span className="inline-block w-0.5 h-4 bg-primary-500 ml-0.5 animate-pulse" />
                    )}
                  </p>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-gray-500">正在准备表演...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={closePerformance}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => handlePerform(selectedTalent)}
                disabled={isOnCooldown(selectedTalent.id) || remainingUses <= 1}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  isOnCooldown(selectedTalent.id) || remainingUses <= 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:opacity-90 shadow-lg'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                再来一次
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 历史记录弹窗 */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg mx-auto p-6 shadow-xl animate-slide-up max-h-[80vh] flex flex-col">
            {/* 头部 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-800">表演历史</h3>
                <span className="text-xs text-gray-400">({history.length}条)</span>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    清空
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 历史列表 */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <History className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">暂无表演记录</p>
                  <p className="text-gray-400 text-sm mt-1">快去展示才艺吧！</p>
                </div>
              ) : (
                history.map((record) => {
                  const talent = TALENTS.find((t) => t.id === record.talentId)
                  const Icon = talent?.icon || Sparkles
                  return (
                    <div
                      key={record.id}
                      className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${
                          talent?.gradient || 'from-primary-500 to-secondary-500'
                        } flex items-center justify-center`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{record.talentName}</span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(record.timestamp).toLocaleString('zh-CN', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line line-clamp-3">
                        {record.content}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 动画样式 */}
      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @media (min-width: 640px) {
          @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        }
      `}</style>
    </div>
  )
}
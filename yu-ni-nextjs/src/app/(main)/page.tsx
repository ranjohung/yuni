import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById } from '@/server/actions/user';
import { getScenes } from '@/server/actions/training';
import { getChatHistory } from '@/server/actions/chat';
import { getHomepageData } from '@/server/actions/homepage';
import { checkIn } from '@/server/actions/checkin';
import { Heart, MessageCircle, Sparkles, PlayCircle, ArrowRight, Clock, Users, TrendingUp, Calendar, Moon, Star, Flame, Award, Zap, Target } from 'lucide-react';
import EmotionRadar from '@/components/emotion-radar';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-4xl font-bold">与</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">欢迎来到与你</h1>
          <p className="text-gray-500 mb-8">AI驱动的社交模拟训练平台</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg"
          >
            开始体验
          </Link>
        </div>
      </div>
    );
  }

  const [user, scenes, chatHistory, homepageData] = await Promise.all([
    getUserById(session.user.id),
    getScenes(),
    getChatHistory(session.user.id, 3),
    getHomepageData(session.user.id),
  ]);
  
  const hotScenes = scenes.slice(0, 3);
  const isEvening = new Date().getHours() >= 19;

  if (!user?.Partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">
                {new Date().getHours() < 12 ? '早上好' : new Date().getHours() < 18 ? '下午好' : '晚上好'}
              </p>
              <h1 className="text-2xl font-bold">{user?.nickname || '用户'}</h1>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <Heart className="h-16 w-16 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">欢迎来到与你</h2>
          <p className="text-gray-500 text-center mb-8 max-w-xs">
            创建一个专属你的AI伴侣，开启你的社交成长之旅
          </p>
          <Link
            href="/partner/create-partner"
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-full font-medium hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg flex items-center gap-2 text-lg"
          >
            创建我的伴侣
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-gray-400 text-sm mt-6">只需1分钟，开始你的社交训练</p>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">为什么需要AI伴侣？</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Heart className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-800 mb-1">安全陪伴</h4>
              <p className="text-sm text-gray-500">随时可以倾诉，无压力交流</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-800 mb-1">智能对话</h4>
              <p className="text-sm text-gray-500">AI驱动的真实社交体验</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-800 mb-1">能力提升</h4>
              <p className="text-sm text-gray-500">针对性训练，逐步成长</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mb-3">
                <Sparkles className="h-5 w-5 text-pink-600" />
              </div>
              <h4 className="font-medium text-gray-800 mb-1">个性化</h4>
              <p className="text-sm text-gray-500">自定义性格，专属体验</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function handleCheckIn() {
    if (!session?.user) return;
    await checkIn(session.user.id);
  }

  const abilityAverage = Math.round(
    (homepageData.abilityStats.empathy + 
     homepageData.abilityStats.expression + 
     homepageData.abilityStats.listening + 
     homepageData.abilityStats.confidence + 
     homepageData.abilityStats.strategy) / 5
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">
              {new Date().getHours() < 12 ? '早上好' : new Date().getHours() < 18 ? '下午好' : '晚上好'}
            </p>
            <h1 className="text-2xl font-bold">{user?.nickname || '用户'}</h1>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        
        <div className="mt-6 flex gap-4">
          <div className="bg-white/20 rounded-xl px-4 py-3 flex-1">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-300" />
              <span className="text-sm text-purple-100">好感度</span>
            </div>
            <p className="text-xl font-bold">{user?.Affection?.score || 0}</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-3 flex-1">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-300" />
              <span className="text-sm text-purple-100">今日对话</span>
            </div>
            <p className="text-xl font-bold">{user?.Affection?.dailyInteractionCount || 0}/20</p>
          </div>
          <button
            onClick={handleCheckIn}
            className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-3 transition-all flex flex-col items-center justify-center min-w-[70px]"
          >
            <Calendar className="h-5 w-5 text-white mb-1" />
            <span className="text-xs text-purple-100">签到</span>
            <span className="text-sm font-bold">{homepageData.checkIn.streakCount}天</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">社交能力雷达</h2>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-purple-600 font-medium">{abilityAverage}分</span>
            </div>
          </div>
          <div className="flex justify-center">
            <EmotionRadar data={homepageData.abilityStats} size={240} />
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-500">同理心</p>
              <p className="text-sm font-bold text-purple-600">{homepageData.abilityStats.empathy}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">表达</p>
              <p className="text-sm font-bold text-blue-600">{homepageData.abilityStats.expression}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">倾听</p>
              <p className="text-sm font-bold text-green-600">{homepageData.abilityStats.listening}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">自信</p>
              <p className="text-sm font-bold text-orange-600">{homepageData.abilityStats.confidence}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">策略</p>
              <p className="text-sm font-bold text-pink-600">{homepageData.abilityStats.strategy}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-sm p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-5 w-5" />
              <span className="text-white/80 text-sm">变美联动</span>
            </div>
            <h3 className="text-xl font-bold mb-2">社交能力提升，魅力值+10%</h3>
            <p className="text-white/80 text-sm mb-4">
              你的社交能力达到 {abilityAverage} 分，魅力值同步提升！自信的你最闪耀 ✨
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">魅力值：{Math.round(abilityAverage * 0.8)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                <span className="text-sm">自信度：{homepageData.abilityStats.confidence}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-bold text-gray-800">本周训练进度</h2>
            </div>
            <span className="text-sm text-gray-500">
              {homepageData.weeklyProgress.usedSimulations}/{homepageData.weeklyProgress.totalSimulations} 次
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${homepageData.weeklyProgress.percentage}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>已完成 {homepageData.weeklyProgress.percentage}%</span>
            <span>
              {homepageData.weeklyProgress.percentage >= 100 ? (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  本周目标达成！
                </span>
              ) : (
                <span>还剩 {homepageData.weeklyProgress.totalSimulations - homepageData.weeklyProgress.usedSimulations} 次</span>
              )}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-bold text-gray-800">最近训练</h2>
            </div>
            <Link href="/simulation" className="text-sm text-purple-600 hover:text-purple-700">
              查看全部
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            {homepageData.recentTrainings.length > 0 ? (
              homepageData.recentTrainings.map((training) => (
                <Link
                  key={training.id}
                  href={`/simulation/${training.id}`}
                  className="flex-shrink-0 w-40 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">{training.createdAt}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      training.score >= 80 ? 'bg-green-100 text-green-600' :
                      training.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {training.score}
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-800 text-sm mb-2 truncate">{training.sceneName}</h3>
                  <div className="flex items-center justify-center gap-1 text-xs text-purple-600">
                    <PlayCircle className="h-3 w-3" />
                    <span>复盘训练</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex-shrink-0 w-full bg-white rounded-xl p-8 text-center shadow-sm">
                <Target className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">还没有训练记录</p>
                <Link href="/simulation" className="mt-3 inline-flex items-center gap-1 text-purple-600 text-sm">
                  开始第一次训练
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {isEvening && homepageData.goodnightPlan.hasPlan && (
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 rounded-2xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="h-5 w-5" />
              <h2 className="text-lg font-bold">晚安计划</h2>
              <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">
                {homepageData.goodnightPlan.partnerMood}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-3">{homepageData.goodnightPlan.planTitle}</h3>
            <p className="text-white/80 mb-6">{homepageData.goodnightPlan.planContent}</p>
            <div className="flex gap-3">
              <Link
                href="/partner/chat"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                聊聊心事
              </Link>
              <Link
                href="/relaxation"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                睡前放松
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">今日训练建议</h3>
              <p className="text-gray-500 text-sm mt-1">建议练习：咖啡厅破冰</p>
              <div className="flex items-center gap-2 mt-3">
                <Link href="/simulation/1" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-600 transition-all flex items-center gap-1">
                  开始训练
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-4">热门场景</h2>
        
        <div className="space-y-3 mb-6">
          {hotScenes.map((scene, index) => (
            <Link
              key={scene.id.toString()}
              href={`/simulation/${scene.id.toString()}`}
              className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-800">{scene.sceneName}</h3>
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {Math.floor(Math.random() * 5000) + 3000}人练习
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {scene.estimatedTime}分钟
                  </span>
                  <span>难度：{'★'.repeat(scene.difficulty)}{'☆'.repeat(5 - scene.difficulty)}</span>
                </div>
              </div>
              <PlayCircle className="h-5 w-5 text-purple-500" />
            </Link>
          ))}
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-4">最近对话</h2>
        
        <div className="space-y-3">
          {chatHistory.length > 0 ? (
            chatHistory.map((session) => {
              const lastMessage = session.messages[session.messages.length - 1];
              return (
                <Link
                  key={session.id}
                  href="/partner/chat"
                  className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.Partner?.name?.slice(0, 1) || 'AI'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{user?.Partner?.name || 'AI伴侣'}</h3>
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {lastMessage?.content || '暂无消息'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(session.createdAt).toLocaleString('zh-CN', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">还没有对话记录</p>
              <Link href="/partner/chat" className="mt-4 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700">
                开始对话
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
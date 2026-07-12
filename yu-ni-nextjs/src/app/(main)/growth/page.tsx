import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAbilityRadar, getGrowthHistory, getUserStats, getStudyCards } from '@/server/actions/growth';
import { TrendingUp, BookOpen, Calendar, Award } from 'lucide-react';
import EmotionRadar from '@/components/emotion-radar';

export const dynamic = 'force-dynamic';

export default async function GrowthPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">请先登录</p>
        </div>
      </div>
    );
  }
  
  const [abilities, history, stats, studyCards] = await Promise.all([
    getAbilityRadar(session.user.id),
    getGrowthHistory(session.user.id, 10),
    getUserStats(session.user.id),
    getStudyCards(session.user.id),
  ]);
  
  const abilityList = [
    { name: '同理心', value: abilities.empathy, color: 'bg-purple-500' },
    { name: '表达能力', value: abilities.expression, color: 'bg-blue-500' },
    { name: '倾听技巧', value: abilities.listening, color: 'bg-green-500' },
    { name: '自信程度', value: abilities.confidence, color: 'bg-pink-500' },
    { name: '应对策略', value: abilities.strategy, color: 'bg-orange-500' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-green-600 to-teal-500 text-white p-6">
        <h1 className="text-2xl font-bold">成长中心</h1>
        <p className="text-green-100 text-sm mt-1">追踪你的社交能力成长轨迹</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-600">总模拟次数</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalSimulations}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-600">学习卡片</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.studyCardsCount}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">能力雷达</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          
          <div className="flex justify-center mb-6">
            <EmotionRadar data={abilities} size={200} />
          </div>
          
          <div className="space-y-4">
            {abilityList.map(ability => (
              <div key={ability.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">{ability.name}</span>
                  <span className="text-gray-800 font-medium">{ability.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${ability.color}`}
                    style={{ width: `${ability.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">训练记录</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                    {item.score}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-gray-800">{item.sceneName}</h4>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">还没有训练记录</p>
                <p className="text-sm text-gray-400 mt-1">完成模拟训练后将在这里显示</p>
              </div>
            )}
          </div>
        </div>
        
        {studyCards.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">学习卡片</h3>
            
            <div className="space-y-4">
              {studyCards.slice(0, 5).map((card) => (
                <div 
                  key={card.id}
                  className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-purple-500" />
                    <h4 className="font-medium text-gray-800">{card.sceneName}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">最佳回应：{card.bestResponse}</p>
                  <p className="text-xs text-gray-500">改进建议：{card.improvementTips}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
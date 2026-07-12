import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getScenes } from '@/server/actions/training';
import { getUserById } from '@/server/actions/user';
import { PlayCircle, Lock, Star, Clock, Users } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const stageNames = {
  1: '初级场景',
  2: '中级场景',
  3: '高级场景',
};

const stageColors = {
  1: 'bg-blue-100 text-blue-600',
  2: 'bg-purple-100 text-purple-600',
  3: 'bg-orange-100 text-orange-600',
};

export default async function SimulationPage() {
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
  
  const [scenes, user] = await Promise.all([
    getScenes(),
    getUserById(session.user.id),
  ]);
  
  const userAffection = user?.Affection?.score || 0;
  
  const stages = [1, 2, 3];
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white p-6">
        <h1 className="text-2xl font-bold">模拟训练</h1>
        <p className="text-blue-100 text-sm mt-1">选择场景进行社交模拟练习</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="bg-white/20 rounded-xl px-4 py-2">
            <span className="text-sm text-blue-100">可用模拟次数</span>
            <p className="text-xl font-bold">{user?.weeklySimulations || 15}</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2">
            <span className="text-sm text-blue-100">当前好感度</span>
            <p className="text-xl font-bold">{userAffection}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {stages.map(stage => {
          const stageScenes = scenes.filter(s => s.stage === stage);
          if (stageScenes.length === 0) return null;
          
          return (
            <div key={stage} className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">{stageNames[stage as keyof typeof stageNames]}</h2>
                <span className="text-xs text-gray-400">阶段{stage}</span>
              </div>
              
              <div className="space-y-4">
                {stageScenes.map(scene => {
                  const isUnlocked = userAffection >= scene.unlockAffection;
                  return (
                    <div 
                      key={scene.id.toString()}
                      className={`bg-white rounded-xl p-4 shadow-sm ${!isUnlocked ? 'opacity-60' : 'hover:shadow-md'} transition-shadow`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isUnlocked ? stageColors[stage as keyof typeof stageColors] : 'bg-gray-100'}`}>
                          {isUnlocked ? (
                            <Link href={`/simulation/${scene.id.toString()}`}>
                              <PlayCircle className="h-6 w-6" />
                            </Link>
                          ) : (
                            <Lock className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">{scene.sceneName}</h3>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < scene.difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {scene.estimatedTime}分钟
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {Math.floor(Math.random() * 5000) + 1000}人练习
                            </span>
                            {!isUnlocked && (
                              <span className="text-orange-500">需好感度 {scene.unlockAffection}</span>
                            )}
                          </div>
                        </div>
                        {isUnlocked && (
                          <Link 
                            href={`/simulation/${scene.id.toString()}`}
                            className="p-2 text-blue-500 hover:text-blue-600"
                          >
                            <PlayCircle className="h-5 w-5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {scenes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">暂无训练场景</p>
            <p className="text-sm text-gray-400 mt-1">场景将在后续版本中逐步开放</p>
          </div>
        )}
      </div>
    </div>
  );
}
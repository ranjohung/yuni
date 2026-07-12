'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createPartner } from '@/server/actions/partner';
import { Heart, Sparkles, ArrowLeft, Check } from 'lucide-react';

const personalityTypes = [
  { type: 'ENFJ', name: '主人公', description: '热情外向，善于社交' },
  { type: 'INFJ', name: '提倡者', description: '富有洞察力，理想主义' },
  { type: 'ENFP', name: '竞选者', description: '充满活力，富有创意' },
  { type: 'INFP', name: '调停者', description: '温和友善，富有同情心' },
  { type: 'ENTJ', name: '指挥官', description: '果断坚定，善于领导' },
  { type: 'INTJ', name: '建筑师', description: '理性深沉，善于规划' },
  { type: 'ENTP', name: '辩论家', description: '机智敏捷，善于辩论' },
  { type: 'INTP', name: '逻辑学家', description: '好奇心强，善于分析' },
  { type: 'ESFJ', name: '执政官', description: '热心体贴，善于照顾他人' },
  { type: 'ISFJ', name: '守卫者', description: '可靠负责，注重细节' },
  { type: 'ESFP', name: '表演者', description: '活泼开朗，善于表达' },
  { type: 'ISFP', name: '探险家', description: '自由随性，富有艺术感' },
];

const relationshipOrigins = [
  { value: 'friend', label: '朋友' },
  { value: 'lover', label: '恋人' },
  { value: 'family', label: '家人' },
  { value: 'colleague', label: '同事' },
];

export default function CreatePartnerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [relationshipOrigin, setRelationshipOrigin] = useState('friend');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { data: session } = useSession();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('请输入伴侣名称');
      return;
    }
    
    if (!selectedType) {
      setError('请选择性格类型');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!session?.user) {
        throw new Error('用户未登录');
      }
      
      const dimensions = getMBTIDimensions(selectedType);
      await createPartner(session.user.id, {
        name: name.trim(),
        coreType: selectedType,
        relationshipOrigin,
        extroversion: dimensions.extroversion,
        intuition: dimensions.intuition,
        feeling: dimensions.feeling,
        judging: dimensions.judging,
      });
      
      router.push('/partner');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getMBTIDimensions = (type: string) => {
    const dimensions = {
      extroversion: type.startsWith('E') ? 8 : 3,
      intuition: type[1] === 'N' ? 8 : 3,
      feeling: type[2] === 'F' ? 8 : 3,
      judging: type[3] === 'J' ? 8 : 3,
    };
    return dimensions;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">创建伴侣</h1>
            <p className="text-purple-100 text-sm mt-1">打造专属你的AI伴侣</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-5 w-5 text-pink-500" />
              <h3 className="font-bold text-gray-800">伴侣名称</h3>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="给你的伴侣起个名字"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              maxLength={20}
            />
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h3 className="font-bold text-gray-800">性格类型</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {personalityTypes.map((pt) => (
                <button
                  key={pt.type}
                  type="button"
                  onClick={() => setSelectedType(pt.type)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedType === pt.type
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-100 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">{pt.type}</span>
                    {selectedType === pt.type && (
                      <Check className="h-5 w-5 text-purple-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{pt.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{pt.description}</p>
                </button>
              ))}
            </div>
            
            {selectedType && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-3">性格维度预览：</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">外向程度</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < getMBTIDimensions(selectedType).extroversion
                              ? 'bg-purple-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">直觉程度</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < getMBTIDimensions(selectedType).intuition
                              ? 'bg-blue-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">情感程度</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < getMBTIDimensions(selectedType).feeling
                              ? 'bg-pink-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">判断程度</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < getMBTIDimensions(selectedType).judging
                              ? 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">关系设定</h3>
            <div className="flex gap-3">
              {relationshipOrigins.map((ro) => (
                <button
                  key={ro.value}
                  type="button"
                  onClick={() => setRelationshipOrigin(ro.value)}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                    relationshipOrigin === ro.value
                      ? 'border-purple-500 bg-purple-50 text-purple-600'
                      : 'border-gray-100 text-gray-600 hover:border-purple-200'
                  }`}
                >
                  {ro.label}
                </button>
              ))}
            </div>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '创建中...' : '创建伴侣'}
          </button>
        </form>
      </div>
    </div>
  );
}
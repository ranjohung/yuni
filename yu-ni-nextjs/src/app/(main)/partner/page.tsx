import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById } from '@/server/actions/user';
import { Heart, Gift, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PartnerPage() {
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
  
  const user = await getUserById(session.user.id);
  
  if (!user?.Partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 pb-20">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-6">
          <Heart className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">还没有伴侣</h2>
        <p className="text-gray-500 text-center mb-8">创建一个专属你的AI伴侣，开始一段独特的关系</p>
        <Link 
          href="/partner/create-partner"
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg flex items-center gap-2"
        >
          创建伴侣
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }
  
  const partner = user.Partner;
  const affection = user.Affection;
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative h-64 bg-gradient-to-br from-purple-600 via-pink-500 to-red-400">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex flex-col items-center justify-center text-white">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl font-bold">{partner.name.slice(0, 1)}</span>
          </div>
          <h1 className="text-2xl font-bold">{partner.name}</h1>
          <p className="text-purple-100 text-sm mt-1">{partner.coreType}</p>
        </div>
      </div>
      
      <div className="px-6 -mt-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">好感度</span>
            <span className="text-purple-600 font-bold">Lv.{affection?.level || 1} {affection?.score || 0}/2000</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-500 h-3 rounded-full transition-all"
              style={{ width: `${((affection?.score || 0) / 2000) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Link href="/partner/chat" className="flex flex-col items-center justify-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <MessageCircle className="h-6 w-6 text-blue-500 mb-2" />
            <span className="text-sm text-gray-600">聊天</span>
          </Link>
          <button className="flex flex-col items-center justify-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <Phone className="h-6 w-6 text-green-500 mb-2" />
            <span className="text-sm text-gray-600">语音</span>
          </button>
          <button className="flex flex-col items-center justify-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <Gift className="h-6 w-6 text-pink-500 mb-2" />
            <span className="text-sm text-gray-600">送礼物</span>
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">伴侣档案</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">性格类型</span>
              <span className="text-gray-800">{partner.coreType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">外向程度</span>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${i < (partner.extroversion || 5) ? 'bg-purple-500' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">直觉程度</span>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${i < (partner.intuition || 5) ? 'bg-blue-500' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">情感程度</span>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${i < (partner.feeling || 5) ? 'bg-pink-500' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">判断程度</span>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${i < (partner.judging || 5) ? 'bg-green-500' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
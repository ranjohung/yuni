'use client';

import { useSession, signOut } from 'next-auth/react';
import { getUserById } from '@/server/actions/user';
import { getUserStats } from '@/server/actions/growth';
import { User, Settings, CreditCard, Shield, Bell, HelpCircle, LogOut, Crown, Award, Gift } from 'lucide-react';
import { useEffect, useState } from 'react';

const membershipNames = {
  0: '体验版',
  1: '基础会员',
  2: '标准会员',
  3: '高级会员',
};

const menuItems = [
  { icon: Settings, label: '设置', href: '#' },
  { icon: CreditCard, label: '会员中心', href: '#', badge: '免费' },
  { icon: Shield, label: '隐私与安全', href: '#' },
  { icon: Bell, label: '通知设置', href: '#', badge: '3' },
  { icon: HelpCircle, label: '帮助与反馈', href: '#' },
];

interface UserData {
  nickname: string | null;
  phone: string;
  age: number | null;
  membershipType: number;
  weeklySimulations: number;
}

interface UserStats {
  chatCount: number;
  studyCardsCount: number;
  totalSimulations: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (session?.user) {
      const fetchData = async () => {
        const [userData, userStats] = await Promise.all([
          getUserById(session.user.id),
          getUserStats(session.user.id),
        ]);
        setUser(userData || null);
        setStats(userStats || null);
      };
      fetchData();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">请先登录</p>
        </div>
      </div>
    );
  }

  const nickname = user?.nickname || session.user.nickname || '用户';
  const membershipType = session.user.membershipType || 0;
  const membershipName = membershipNames[membershipType as keyof typeof membershipNames];

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{nickname}</h1>
            <p className="text-purple-100 text-sm mt-1">{membershipName}会员</p>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <div className="bg-white/20 rounded-xl px-4 py-3 flex-1 text-center">
            <p className="text-xl font-bold">{user?.weeklySimulations || 15}</p>
            <p className="text-purple-100 text-xs mt-1">可用模拟</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-3 flex-1 text-center">
            <p className="text-xl font-bold">{stats?.chatCount || 0}</p>
            <p className="text-purple-100 text-xs mt-1">对话次数</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-3 flex-1 text-center">
            <p className="text-xl font-bold">{stats?.studyCardsCount || 0}</p>
            <p className="text-purple-100 text-xs mt-1">学习卡片</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">会员等级</h3>
            <Crown className="h-5 w-5 text-yellow-500" />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {membershipName}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {membershipType === 0 ? '免费用户，基础功能体验' :
                 membershipType === 1 ? '解锁BERT情绪分析，完整行为分析' :
                 membershipType === 2 ? '解锁语音分析，更多模拟次数' :
                 '解锁全部高级功能'}
              </p>
            </div>
            {membershipType === 0 && (
              <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-purple-700 hover:to-pink-600 transition-all">
                升级会员
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <span className="flex-1 text-gray-800">{item.label}</span>
                {item.badge && (
                  <span className={`text-sm px-2 py-1 rounded-full ${item.badge === '免费' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-600">获得勋章</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-5 w-5 text-pink-500" />
              <span className="text-sm text-gray-600">穿梭券</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-white text-red-500 py-4 rounded-xl shadow-sm hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut className="h-5 w-5" />
          退出登录
        </button>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">与你 v1.0.0</p>
          <p className="text-gray-300 text-xs mt-1">AI驱动的社交模拟训练平台</p>
        </div>
      </div>
    </div>
  );
}
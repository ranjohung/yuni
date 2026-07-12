'use client';

import { usePathname } from 'next/navigation';
import { Home, Heart, PlayCircle, BarChart3, User } from 'lucide-react';

const navItems = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'partner', label: '伴侣', icon: Heart },
  { id: 'simulation', label: '训练', icon: PlayCircle },
  { id: 'growth', label: '成长', icon: BarChart3 },
  { id: 'profile', label: '我的', icon: User },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const getActiveId = () => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/partner')) return 'partner';
    if (pathname.startsWith('/simulation')) return 'simulation';
    if (pathname.startsWith('/growth')) return 'growth';
    if (pathname.startsWith('/profile')) return 'profile';
    return '';
  };
  
  const activeId = getActiveId();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`/${item.id === 'home' ? '' : item.id}`}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive 
                    ? 'text-purple-600' 
                    : 'text-gray-400 hover:text-purple-600'
                }`}
              >
                <Icon className={`h-6 w-6 mb-1 transition-all ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
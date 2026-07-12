'use client'

import { useState } from 'react'
import { signOut } from '@/lib/auth'
import { useSession } from 'next-auth/react'
import { Home, MessageCircle, Users, Sparkles, Gift, User, LogOut, Menu, X, Heart } from 'lucide-react'

interface NavbarProps {
  currentPage: string
}

const navItems = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'chat', label: '聊天', icon: MessageCircle },
  { id: 'training', label: '训练', icon: Users },
  { id: 'growth', label: '成长', icon: Sparkles },
  { id: 'profile', label: '我的', icon: User },
]

export default function Navbar({ currentPage }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  const handleSignOut = async () => {
    await signOut()
  }

  if (!session?.user) {
    return null
  }

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] fixed bottom-0 left-0 right-0 z-50 h-20 flex items-center">
        <div className="max-w-lg mx-auto w-full px-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <a
                  key={item.id}
                  href={`/${item.id === 'home' ? '' : item.id}`}
                  className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all flex-1 ${
                    isActive
                      ? 'text-primary-500'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <div className={`p-1.5 rounded-full transition-all ${
                    isActive ? 'bg-primary-50' : ''
                  }`}>
                    <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </a>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}

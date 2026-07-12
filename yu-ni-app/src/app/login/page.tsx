'use client'

import { useState, useEffect } from 'react'
import { signIn } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Phone, Lock, Eye, EyeOff, ArrowRight, MessageCircle, ShieldCheck, User, Sparkles, ChevronLeft } from 'lucide-react'

export default function LoginPage() {
  const [loginMode, setLoginMode] = useState<'password' | 'sms'>('password')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [smsCountdown, setSmsCountdown] = useState(0)
  const [showDemoInfo, setShowDemoInfo] = useState(false)
  const [pageEnter, setPageEnter] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setPageEnter(true)
    // 加载记住的手机号
    const saved = localStorage.getItem('yn_remember_phone')
    if (saved) {
      setPhone(saved)
      setRememberMe(true)
    }
  }, [])

  // 短信验证码倒计时
  useEffect(() => {
    if (smsCountdown <= 0) return
    const timer = setInterval(() => setSmsCountdown(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [smsCountdown])

  const handleSendSms = () => {
    if (!phone.trim() || phone.trim().length < 11) {
      setError('请输入正确的手机号')
      return
    }
    setError('')
    setSmsCountdown(60)
    // 模拟发送短信验证码
    alert('验证码已发送（体验版验证码：123456）')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone.trim()) {
      setError('请输入手机号')
      return
    }

    if (loginMode === 'password') {
      if (!password) {
        setError('请输入密码')
        return
      }
    } else {
      if (!smsCode) {
        setError('请输入验证码')
        return
      }
      if (smsCode !== '123456') {
        setError('验证码错误，体验验证码为 123456')
        return
      }
    }

    setIsLoading(true)

    if (rememberMe) {
      localStorage.setItem('yn_remember_phone', phone.trim())
    } else {
      localStorage.removeItem('yn_remember_phone')
    }

    if (loginMode === 'sms') {
      // 短信验证码登录 - 使用专门的SMS登录API
      try {
        const res = await fetch('/api/auth/sms-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone.trim(),
            smsCode: smsCode.trim(),
          }),
        })
        const data = await res.json()
        if (!data.success) {
          setError(data.error || '登录失败，请重试')
          setIsLoading(false)
          return
        }
        // 使用NextAuth登录
        const result = await signIn('credentials', {
          phone: phone.trim(),
          password: 'sms_user_' + phone.trim(),
          redirect: false,
        })
        if (result?.error) {
          setError('登录失败，请重试')
        } else {
          router.push('/onboarding')
        }
      } catch {
        setError('登录失败，请重试')
      }
      setIsLoading(false)
      return
    }

    const result = await signIn('credentials', {
      phone: phone.trim(),
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('手机号或密码错误')
    } else {
      router.push('/onboarding')
    }

    setIsLoading(false)
  }

  const fillDemoAccount = () => {
    setPhone('13800138000')
    setPassword('123456')
    setLoginMode('password')
    setShowDemoInfo(true)
    setTimeout(() => setShowDemoInfo(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className={`w-full max-w-md transition-all duration-700 ${pageEnter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo区域 */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-3xl">💫</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">与你</h1>
          <p className="text-gray-500 mt-1 text-sm">AI驱动的社交模拟训练平台</p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-indigo-100/50 p-7 border border-white/50">
          {/* 登录方式切换 */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setLoginMode('password'); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${loginMode === 'password'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <Lock className="w-4 h-4 inline mr-1.5" />
              密码登录
            </button>
            <button
              onClick={() => { setLoginMode('sms'); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${loginMode === 'sms'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-1.5" />
              短信验证码
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 手机号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">手机号</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="请输入手机号"
                  maxLength={11}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-800 placeholder:text-gray-400
                    focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50
                    transition-all duration-300"
                />
              </div>
            </div>

            {/* 密码登录 */}
            {loginMode === 'password' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-800 placeholder:text-gray-400
                      focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50
                      transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* 短信验证码登录 */}
            {loginMode === 'sms' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">验证码</label>
                <div className="flex gap-3">
                  <div className="relative group flex-1">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="输入验证码"
                      maxLength={6}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-800 placeholder:text-gray-400
                        focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50
                        transition-all duration-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendSms}
                    disabled={smsCountdown > 0}
                    className={`px-4 py-3.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${smsCountdown > 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:scale-95'
                      }`}
                  >
                    {smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 ml-1">体验验证码：123456</p>
              </div>
            )}

            {/* 记住我 + 忘记密码 */}
            {loginMode === 'password' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${rememberMe
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-gray-300 group-hover:border-indigo-300'
                      }`}
                  >
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">记住我</span>
                </label>
                <a
                  href="/reset-password"
                  className="text-sm text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
                >
                  忘记密码？
                </a>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 flex items-start gap-2.5 animate-slide-up">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* 演示提示 */}
            {showDemoInfo && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-3.5 flex items-start gap-2.5 animate-slide-up">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">已填入演示账号</p>
                  <p className="text-xs text-green-600 mt-0.5">手机号 13800138000，密码 123456</p>
                </div>
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading || !phone.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-2xl
                hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300
                active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {loginMode === 'password' ? '登 录' : '短信登录'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* 分隔线 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-xs text-gray-400">快捷体验</span>
            </div>
          </div>

          {/* 演示账号按钮 */}
          <button
            type="button"
            onClick={fillDemoAccount}
            className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-500 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all duration-300 text-sm flex items-center justify-center gap-2 group"
          >
            <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
            使用演示账号登录
          </button>

          {/* 注册入口 */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              还没有账号？{' '}
              <a href="/register" className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors relative group">
                立即注册
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-200 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Lock, Eye, EyeOff, ArrowRight, User, Sparkles, ShieldCheck, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [smsCountdown, setSmsCountdown] = useState(0)
  const [pageEnter, setPageEnter] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const router = useRouter()

  useEffect(() => {
    setPageEnter(true)
  }, [])

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
    alert('验证码已发送（体验版验证码：123456）')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 第一步验证
    if (step === 1) {
      if (!phone.trim() || phone.trim().length < 11) {
        setError('请输入正确的手机号')
        return
      }
      if (!smsCode) {
        setError('请输入验证码')
        return
      }
      if (smsCode !== '123456') {
        setError('验证码错误')
        return
      }
      setStep(2)
      return
    }

    // 第二步验证
    if (!nickname.trim()) {
      setError('请输入昵称')
      return
    }
    if (!password) {
      setError('请输入密码')
      return
    }
    if (password.length < 6) {
      setError('密码长度至少6位')
      return
    }
    if (password !== confirmPassword) {
      setError('两次密码输入不一致')
      return
    }
    if (!agreeTerms) {
      setError('请阅读并同意服务协议')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          password,
          confirmPassword,
          nickname: nickname.trim(),
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || '注册失败')
        return
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      setError('注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">注册成功 🎉</h1>
          <p className="text-gray-500">即将跳转到登录页面...</p>
          <div className="mt-8 w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className={`w-full max-w-md transition-all duration-700 ${pageEnter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo区域 */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-3xl">✨</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">创建账号</h1>
          <p className="text-gray-500 mt-1 text-sm">开启你的社交成长之旅</p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            step === 1 ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-indigo-100 text-indigo-500'
          }`}>1</div>
          <div className={`w-16 h-0.5 rounded transition-all duration-300 ${step === 2 ? 'bg-indigo-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            step === 2 ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-gray-100 text-gray-400'
          }`}>2</div>
        </div>

        {/* 注册卡片 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-indigo-100/50 p-7 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 步骤1：手机号验证 */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">手机号</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">验证码</label>
                  <div className="flex gap-3">
                    <div className="relative group flex-1">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
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
                      className={`px-4 py-3.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        smsCountdown > 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:scale-95'
                      }`}
                    >
                      {smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 ml-1">体验验证码：123456</p>
                </div>
              </>
            )}

            {/* 步骤2：填写信息 */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">昵称</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="给自己取个昵称"
                      maxLength={12}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-800 placeholder:text-gray-400
                        focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50
                        transition-all duration-300"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 ml-1">{nickname.length}/12</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请设置密码（至少6位）"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">确认密码</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="请再次输入密码"
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-800 placeholder:text-gray-400
                        focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50
                        transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    onClick={() => setAgreeTerms(!agreeTerms)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0 ${
                      agreeTerms
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    {agreeTerms && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    我已阅读并同意
                    <button type="button" className="text-indigo-500 hover:text-indigo-600 mx-0.5">《服务协议》</button>
                    和
                    <button type="button" className="text-indigo-500 hover:text-indigo-600 ml-0.5">《隐私政策》</button>
                  </p>
                </div>
              </>
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

            {/* 按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-2xl
                hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300
                active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {step === 1 ? '下一步' : '注册'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* 登录入口 */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              已有账号？{' '}
              <a href="/login" className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors relative group">
                立即登录
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-200 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
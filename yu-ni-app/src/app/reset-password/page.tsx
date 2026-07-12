'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, CheckCircle, ChevronLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [smsCountdown, setSmsCountdown] = useState(0)
  const [pageEnter, setPageEnter] = useState(false)

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

    // 第一步：验证手机号
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

    // 第二步：设置新密码
    if (!newPassword) {
      setError('请输入新密码')
      return
    }
    if (newPassword.length < 6) {
      setError('密码长度至少6位')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('两次密码输入不一致')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          smsCode,
          newPassword,
          confirmPassword,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || '密码重置失败')
        return
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      setError('密码重置失败，请重试')
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">密码重置成功 🎉</h1>
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
        {/* 返回按钮 */}
        <button
          onClick={() => router.push('/login')}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors mb-6 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm">返回登录</span>
        </button>

        {/* Logo区域 */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-200">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">重置密码</h1>
          <p className="text-gray-500 mt-1 text-sm">验证身份后设置新密码</p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            step === 1 ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : step === 2 ? 'bg-indigo-100 text-indigo-500' : 'bg-gray-100 text-gray-400'
          }`}>1</div>
          <div className={`w-16 h-0.5 rounded transition-all duration-300 ${step >= 2 ? 'bg-indigo-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            step === 2 ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-gray-100 text-gray-400'
          }`}>2</div>
        </div>

        {/* 重置密码卡片 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-indigo-100/50 p-7 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 步骤1：验证身份 */}
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

            {/* 步骤2：设置新密码 */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">新密码</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="请设置新密码（至少6位）"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">确认新密码</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="请再次输入新密码"
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
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 text-white font-semibold rounded-2xl
                hover:from-amber-500 hover:via-orange-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300
                active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {step === 1 ? '验证身份' : '重置密码'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
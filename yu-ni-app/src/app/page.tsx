'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') {
      return
    }
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    router.push('/partner/create')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return null
}
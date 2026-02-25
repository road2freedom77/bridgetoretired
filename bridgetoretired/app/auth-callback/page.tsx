'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export default function AuthCallbackPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.replace('/sign-in')
      return
    }
    const isPro = (user.publicMetadata as any)?.isPro === true
    router.replace(isPro ? '/pro-welcome' : '/pricing')
  }, [isLoaded, user, router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#E8B84B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-[11px] tracking-widest uppercase text-white/30">Loading your account...</p>
      </div>
    </div>
  )
}

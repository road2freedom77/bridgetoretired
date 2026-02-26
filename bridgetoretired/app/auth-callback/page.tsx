'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export default function AuthCallbackPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [status, setStatus] = useState('Checking your account...')

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.replace('/sign-in')
      return
    }

    const checkPro = async () => {
      const isPro = (user.publicMetadata as any)?.isPro === true

      if (isPro) {
        setStatus('Pro membership confirmed!')
        router.replace('/pro-welcome')
        return
      }

      // Not Pro yet — check Stripe by email
      setStatus('Verifying your subscription...')
      const email = user.primaryEmailAddress?.emailAddress
      if (email) {
        try {
          const res = await fetch('/api/verify-pro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, email }),
          })
          const data = await res.json()
          if (data.isPro) {
            setStatus('Pro membership confirmed!')
            // Reload user to get fresh metadata
            await user.reload()
            router.replace('/pro-welcome')
            return
          }
        } catch (err) {
          console.error('verify-pro failed:', err)
        }
      }

      // Not Pro
      setStatus('No active subscription found.')
      router.replace('/pricing')
    }

    checkPro()
  }, [isLoaded, user, router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#E8B84B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-[11px] tracking-widest uppercase text-white/30">{status}</p>
      </div>
    </div>
  )
}

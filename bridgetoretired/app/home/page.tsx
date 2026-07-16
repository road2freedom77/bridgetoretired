'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export default function AuthCallbackPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (!user) return

    const isPro = user.publicMetadata?.isPro === true
    if (isPro) {
      router.replace('/pro-welcome')
    } else {
      router.replace('/home')
    }
  }, [user, isLoaded, router])

  return null
}
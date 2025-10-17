"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function MustResetPasswordGate() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const mustReset = Boolean(user?.user_metadata?.must_reset_password)
    if (mustReset && pathname !== '/auth/change-password') {
      router.replace('/auth/change-password')
    }
  }, [user, pathname, router])

  return null
}


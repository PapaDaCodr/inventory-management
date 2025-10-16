'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoadingScreen from '@/components/LoadingScreen'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!loading) {
      setRedirecting(true)

      // Small delay to show redirect message
      const timer = setTimeout(() => {
        if (user) {
          router.push('/dashboard')
        } else {
          router.push('/auth/login')
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [user, loading, router])

  const getMessage = () => {
    if (loading) return 'Checking authentication...'
    if (redirecting) {
      return user ? 'Redirecting to dashboard...' : 'Redirecting to login...'
    }
    return 'Loading...'
  }

  return <LoadingScreen message={getMessage()} />
}
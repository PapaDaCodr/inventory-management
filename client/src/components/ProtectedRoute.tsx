'use client'

import { useAuth, UserRole } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LoadingScreen from './LoadingScreen'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // If no user, redirect to login
      if (!user) {
        router.push(redirectTo)
        return
      }

      // If user exists but no profile, redirect to registration to create profile
      if (user && !profile) {
        console.warn('User exists but no profile found, redirecting to registration')
        router.push('/auth/register')
        return
      }

      // If profile is inactive, redirect to login with message
      if (profile && !profile.is_active) {
        console.warn('User profile is inactive')
        router.push('/auth/login?message=account_inactive')
        return
      }

      // If specific roles are required, check access
      if (requiredRoles.length > 0 && profile) {
        const hasRequiredRole = requiredRoles.includes(profile.role)
        if (!hasRequiredRole) {
          console.warn(`User role '${profile.role}' not authorized for required roles:`, requiredRoles)
          router.push('/dashboard?message=unauthorized')
          return
        }
      }
    }
  }, [user, profile, loading, router, requiredRoles, redirectTo])

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingScreen message="Verifying access..." />
  }

  // If no user, don't render children (will redirect)
  if (!user) {
    return null
  }

  // If user exists but no profile, don't render children (will redirect)
  if (user && !profile) {
    return null
  }

  // If profile is inactive, don't render children (will redirect)
  if (profile && !profile.is_active) {
    return null
  }

  // If specific roles are required and user doesn't have them, don't render children
  if (requiredRoles.length > 0 && profile) {
    const hasRequiredRole = requiredRoles.includes(profile.role)
    if (!hasRequiredRole) {
      return null
    }
  }

  // All checks passed, render children
  return <>{children}</>
}

// Convenience components for specific roles
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['administrator']}>
      {children}
    </ProtectedRoute>
  )
}

export function ManagerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['administrator', 'manager']}>
      {children}
    </ProtectedRoute>
  )
}

export function InventoryClerkRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['administrator', 'manager', 'inventory_clerk']}>
      {children}
    </ProtectedRoute>
  )
}

export function CashierRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['administrator', 'manager', 'cashier']}>
      {children}
    </ProtectedRoute>
  )
}

export function SupplierRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['administrator', 'manager', 'supplier']}>
      {children}
    </ProtectedRoute>
  )
}

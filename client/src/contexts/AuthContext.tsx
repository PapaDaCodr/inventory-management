'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { cachedApiClient, CacheKeys } from '@/lib/cache'

// User roles type
export type UserRole = 'administrator' | 'manager' | 'inventory_clerk' | 'cashier' | 'supplier'

// Profile interface
export interface UserProfile {
  id: string
  full_name: string
  email: string
  role: UserRole
  employee_id?: string
  contact_phone?: string
  department?: string
  assigned_areas?: any
  shift_info?: any
  access_level: number
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

// Auth context interface
interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, profileData: Partial<UserProfile>) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  hasRole: (roles: UserRole | UserRole[]) => boolean
  isAdmin: () => boolean
  isManager: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId)

      // Use cached API for user profile with 10 minute TTL
      const profileData = await cachedApiClient.fetchWithCache(
        CacheKeys.USER_PROFILE(userId),
        async () => {
          console.log('Fetching user profile from Supabase...')
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (error) throw error
          return data as UserProfile
        },
        { ttl: 10 * 60 * 1000 } // 10 minutes cache
      )

      setProfile(profileData)
      console.log('User profile loaded successfully')

      // Update last login (don't cache this)
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId)

    } catch (error) {
      console.error('Error in fetchProfile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      setLoading(false)
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    setLoading(true)
    
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setLoading(false)
      return { error: authError }
    }

    // If user was created, create the profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: profileData.full_name || '',
          role: profileData.role || 'inventory_clerk',
          employee_id: profileData.employee_id,
          contact_phone: profileData.contact_phone,
          department: profileData.department,
          assigned_areas: profileData.assigned_areas,
          shift_info: profileData.shift_info,
          access_level: profileData.access_level || 1,
          is_active: true,
        })

      if (profileError) {
        setLoading(false)
        return { error: profileError }
      }
    }

    setLoading(false)
    return { error: null }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      console.log('Signing out user...')

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear user state
      setProfile(null)
      setUser(null)
      setSession(null)

      console.log('User signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    }

    return { error }
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!profile) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(profile.role)
  }

  const isAdmin = (): boolean => {
    return profile?.role === 'administrator'
  }

  const isManager = (): boolean => {
    return profile?.role === 'manager' || profile?.role === 'administrator'
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasRole,
    isAdmin,
    isManager,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

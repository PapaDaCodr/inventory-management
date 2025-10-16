'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

interface RealtimeContextType {
  inventoryUpdates: any[]
  stockMovements: any[]
  notifications: any[]
  isConnected: boolean
  subscribeToInventory: () => void
  subscribeToStockMovements: () => void
  subscribeToNotifications: () => void
  unsubscribeAll: () => void
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

interface RealtimeProviderProps {
  children: React.ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { user, profile } = useAuth()
  const [inventoryUpdates, setInventoryUpdates] = useState<any[]>([])
  const [stockMovements, setStockMovements] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [subscriptions, setSubscriptions] = useState<any[]>([])

  // Subscribe to inventory changes
  const subscribeToInventory = () => {
    if (!user) return

    const subscription = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
        },
        (payload) => {
          console.log('Inventory change received:', payload)
          setInventoryUpdates(prev => [payload, ...prev.slice(0, 49)]) // Keep last 50 updates
          
          // Create notification for significant inventory changes
          if (payload.eventType === 'UPDATE') {
            const oldRecord = payload.old
            const newRecord = payload.new
            
            if (oldRecord?.quantity_available !== newRecord?.quantity_available) {
              const notification = {
                id: `inv-${Date.now()}`,
                type: 'inventory_change',
                title: 'Inventory Updated',
                message: `Stock level changed for product ID ${newRecord.product_id}`,
                timestamp: new Date().toISOString(),
                data: payload
              }
              setNotifications(prev => [notification, ...prev.slice(0, 99)])
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Inventory subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    setSubscriptions(prev => [...prev, subscription])
  }

  // Subscribe to stock movements
  const subscribeToStockMovements = () => {
    if (!user) return

    const subscription = supabase
      .channel('stock-movements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stock_movements',
        },
        (payload) => {
          console.log('Stock movement received:', payload)
          setStockMovements(prev => [payload.new, ...prev.slice(0, 49)])
          
          // Create notification for stock movements
          const notification = {
            id: `stock-${Date.now()}`,
            type: 'stock_movement',
            title: 'Stock Movement',
            message: `${payload.new.movement_type} - ${payload.new.quantity} units`,
            timestamp: new Date().toISOString(),
            data: payload.new
          }
          setNotifications(prev => [notification, ...prev.slice(0, 99)])
        }
      )
      .subscribe()

    setSubscriptions(prev => [...prev, subscription])
  }

  // Subscribe to notifications table
  const subscribeToNotifications = () => {
    if (!user || !profile) return

    const subscription = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          console.log('Notification received:', payload)
          const notification = {
            id: payload.new.id,
            type: payload.new.type,
            title: payload.new.title,
            message: payload.new.message,
            timestamp: payload.new.created_at,
            data: payload.new.data
          }
          setNotifications(prev => [notification, ...prev.slice(0, 99)])
        }
      )
      .subscribe()

    setSubscriptions(prev => [...prev, subscription])
  }

  // Unsubscribe from all channels
  const unsubscribeAll = () => {
    subscriptions.forEach(subscription => {
      supabase.removeChannel(subscription)
    })
    setSubscriptions([])
    setIsConnected(false)
  }

  // Auto-subscribe when user is authenticated
  useEffect(() => {
    if (user && profile) {
      // Small delay to ensure auth is fully established
      const timer = setTimeout(() => {
        subscribeToInventory()
        subscribeToStockMovements()
        subscribeToNotifications()
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      unsubscribeAll()
    }
  }, [user, profile])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeAll()
    }
  }, [])

  const value: RealtimeContextType = {
    inventoryUpdates,
    stockMovements,
    notifications,
    isConnected,
    subscribeToInventory,
    subscribeToStockMovements,
    subscribeToNotifications,
    unsubscribeAll,
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

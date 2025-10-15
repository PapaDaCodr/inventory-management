'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { inventoryApi } from '@/lib/supabase-api'
import { useRealtime } from '@/contexts/RealtimeContext'

interface InventoryItem {
  id: string
  product_id: string
  location_id: string
  quantity_available: number
  quantity_reserved: number
  reorder_level: number
  max_stock_level: number
  last_updated: string
  product?: any
  location?: any
}

interface UseRealtimeInventoryOptions {
  autoRefresh?: boolean
  filters?: {
    location_id?: string
    low_stock_only?: boolean
    out_of_stock_only?: boolean
  }
}

export function useRealtimeInventory(options: UseRealtimeInventoryOptions = {}) {
  const { autoRefresh = true, filters = {} } = options
  const { inventoryUpdates } = useRealtime()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Load initial inventory data
  const loadInventory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await inventoryApi.getInventory(filters)
      setInventory(data || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error loading inventory:', err)
      setError('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Update specific inventory item
  const updateInventoryItem = useCallback((updatedItem: Partial<InventoryItem> & { id: string }) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === updatedItem.id 
          ? { ...item, ...updatedItem }
          : item
      )
    )
    setLastUpdated(new Date())
  }, [])

  // Add new inventory item
  const addInventoryItem = useCallback((newItem: InventoryItem) => {
    setInventory(prev => [newItem, ...prev])
    setLastUpdated(new Date())
  }, [])

  // Remove inventory item
  const removeInventoryItem = useCallback((itemId: string) => {
    setInventory(prev => prev.filter(item => item.id !== itemId))
    setLastUpdated(new Date())
  }, [])

  // Process real-time updates
  useEffect(() => {
    if (!autoRefresh || inventoryUpdates.length === 0) return

    const latestUpdate = inventoryUpdates[0]
    
    switch (latestUpdate.eventType) {
      case 'INSERT':
        // Check if the new item matches our filters
        const newItem = latestUpdate.new
        const matchesFilters = 
          (!filters.location_id || newItem.location_id === filters.location_id) &&
          (!filters.low_stock_only || newItem.quantity_available <= newItem.reorder_level) &&
          (!filters.out_of_stock_only || newItem.quantity_available === 0)
        
        if (matchesFilters) {
          addInventoryItem(newItem)
        }
        break
        
      case 'UPDATE':
        const updatedItem = latestUpdate.new
        const matchesFiltersAfterUpdate = 
          (!filters.location_id || updatedItem.location_id === filters.location_id) &&
          (!filters.low_stock_only || updatedItem.quantity_available <= updatedItem.reorder_level) &&
          (!filters.out_of_stock_only || updatedItem.quantity_available === 0)
        
        if (matchesFiltersAfterUpdate) {
          updateInventoryItem(updatedItem)
        } else {
          // Item no longer matches filters, remove it
          removeInventoryItem(updatedItem.id)
        }
        break
        
      case 'DELETE':
        removeInventoryItem(latestUpdate.old.id)
        break
    }
  }, [inventoryUpdates, autoRefresh, filters, addInventoryItem, updateInventoryItem, removeInventoryItem])

  // Initial load
  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  // Helper functions for inventory analysis
  const getInventoryStats = useCallback(() => {
    const totalItems = inventory.length
    const lowStockItems = inventory.filter(item => 
      item.quantity_available <= item.reorder_level && item.quantity_available > 0
    ).length
    const outOfStockItems = inventory.filter(item => 
      item.quantity_available === 0
    ).length
    const inStockItems = totalItems - lowStockItems - outOfStockItems
    const totalValue = inventory.reduce((sum, item) => 
      sum + (item.quantity_available * (item.product?.base_price || 0)), 0
    )

    return {
      totalItems,
      inStockItems,
      lowStockItems,
      outOfStockItems,
      totalValue
    }
  }, [inventory])

  // Get items that need reordering
  const getReorderItems = useCallback(() => {
    return inventory.filter(item => 
      item.quantity_available <= item.reorder_level
    ).sort((a, b) => a.quantity_available - b.quantity_available)
  }, [inventory])

  // Get items by location
  const getItemsByLocation = useCallback((locationId: string) => {
    return inventory.filter(item => item.location_id === locationId)
  }, [inventory])

  // Manual refresh function
  const refresh = useCallback(() => {
    loadInventory()
  }, [loadInventory])

  return {
    inventory,
    loading,
    error,
    lastUpdated,
    stats: getInventoryStats(),
    reorderItems: getReorderItems(),
    getItemsByLocation,
    refresh,
    updateInventoryItem,
    addInventoryItem,
    removeInventoryItem
  }
}

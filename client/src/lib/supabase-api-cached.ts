/**
 * Cached version of Supabase API for improved performance
 * Implements cache-first strategy with automatic background refresh
 */

import { supabase } from './supabase'
import { cachedApiClient, CacheKeys } from './cache'
import type { 
  DashboardMetrics, 
  User, 
  Product, 
  Inventory, 
  Supplier, 
  Category 
} from '@/types/global'

// Cache TTL configurations (in milliseconds)
const CACHE_TTL = {
  DASHBOARD_METRICS: 2 * 60 * 1000,    // 2 minutes - frequently changing
  USERS: 10 * 60 * 1000,               // 10 minutes - changes less frequently
  PRODUCTS: 5 * 60 * 1000,              // 5 minutes - moderate changes
  INVENTORY: 1 * 60 * 1000,             // 1 minute - changes frequently
  SUPPLIERS: 15 * 60 * 1000,            // 15 minutes - rarely changes
  CATEGORIES: 30 * 60 * 1000,           // 30 minutes - rarely changes
} as const

/**
 * Optimized Dashboard API with caching
 */
export const dashboardApiCached = {
  async getDashboardMetrics(forceRefresh = false): Promise<DashboardMetrics> {
    return cachedApiClient.fetchWithCache(
      CacheKeys.DASHBOARD_METRICS,
      async () => {
        console.log('Fetching dashboard metrics from Supabase...')
        
        // Optimized parallel queries with minimal data selection
        const [
          { count: totalProducts },
          { count: totalCategories },
          { count: totalSuppliers },
          { data: lowStockData },
          { data: inventoryData }
        ] = await Promise.all([
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true),
          supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true),
          supabase
            .from('suppliers')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true),
          supabase
            .from('inventory')
            .select(`
              quantity_available,
              product:products!inner(reorder_level)
            `)
            .not('product.reorder_level', 'is', null),
          supabase
            .from('inventory')
            .select('quantity_available, unit_cost')
        ])

        // Calculate metrics efficiently
        const lowStockItems = lowStockData?.filter(item => 
          item.product?.reorder_level && 
          item.quantity_available <= item.product.reorder_level
        ).length || 0

        const totalInventoryValue = inventoryData?.reduce((total, item) => {
          return total + (item.quantity_available * (item.unit_cost || 0))
        }, 0) || 0

        return {
          totalProducts: totalProducts || 0,
          totalCategories: totalCategories || 0,
          totalSuppliers: totalSuppliers || 0,
          lowStockItems,
          totalInventoryValue,
          recentTransactions: 0, // TODO: Implement when transactions table is ready
          lastUpdated: new Date().toISOString()
        }
      },
      { ttl: CACHE_TTL.DASHBOARD_METRICS, forceRefresh }
    )
  },

  /**
   * Background refresh for dashboard metrics
   * Updates cache without blocking UI
   */
  async refreshDashboardMetricsBackground(): Promise<void> {
    try {
      await this.getDashboardMetrics(true)
      console.log('Dashboard metrics refreshed in background')
    } catch (error) {
      console.error('Background refresh failed for dashboard metrics:', error)
    }
  }
}

/**
 * Optimized Users API with caching
 */
export const usersApiCached = {
  async getUsers(forceRefresh = false): Promise<User[]> {
    return cachedApiClient.fetchWithCache(
      CacheKeys.USERS,
      async () => {
        console.log('Fetching users from Supabase...')
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('full_name')

        if (error) throw error
        return data as User[]
      },
      { ttl: CACHE_TTL.USERS, forceRefresh }
    )
  },

  async createUser(userData: {
    email: string
    password: string
    full_name: string
    role: string
    employee_id?: string
    contact_phone?: string
    department?: string
  }): Promise<User> {
    // Use the non-cached API for creation
    const { usersApi } = await import('./supabase-api')
    const newUser = await usersApi.createUser(userData)

    // Invalidate users cache after creation
    cachedApiClient.invalidateCache(CacheKeys.USERS)

    return newUser as User
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    // Invalidate users cache after update
    cachedApiClient.invalidateCache(CacheKeys.USERS)

    return data as User
  }
}

/**
 * Optimized Products API with caching
 */
export const productsApiCached = {
  async getProducts(filters?: {
    category_id?: string
    supplier_id?: string
    is_active?: boolean
    search?: string
  }, forceRefresh = false): Promise<Product[]> {
    const cacheKey = CacheKeys.PRODUCTS(JSON.stringify(filters))
    
    return cachedApiClient.fetchWithCache(
      cacheKey,
      async () => {
        console.log('Fetching products from Supabase...')
        let query = supabase
          .from('products')
          .select(`
            *,
            category:categories(name),
            supplier:suppliers(name)
          `)
          .order('name')

        // Apply filters
        if (filters?.category_id) {
          query = query.eq('category_id', filters.category_id)
        }
        if (filters?.supplier_id) {
          query = query.eq('supplier_id', filters.supplier_id)
        }
        if (filters?.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active)
        }
        if (filters?.search) {
          query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`)
        }

        const { data, error } = await query
        if (error) throw error
        return data as Product[]
      },
      { ttl: CACHE_TTL.PRODUCTS, forceRefresh }
    )
  }
}

/**
 * Optimized Inventory API with caching
 */
export const inventoryApiCached = {
  async getInventory(filters?: {
    product_id?: string
    location_id?: string
    low_stock?: boolean
  }, forceRefresh = false): Promise<Inventory[]> {
    const cacheKey = CacheKeys.INVENTORY(JSON.stringify(filters))
    
    return cachedApiClient.fetchWithCache(
      cacheKey,
      async () => {
        console.log('Fetching inventory from Supabase...')
        let query = supabase
          .from('inventory')
          .select(`
            *,
            product:products(name, sku, reorder_level),
            location:locations(name)
          `)
          .order('updated_at', { ascending: false })

        // Apply filters
        if (filters?.product_id) {
          query = query.eq('product_id', filters.product_id)
        }
        if (filters?.location_id) {
          query = query.eq('location_id', filters.location_id)
        }

        const { data, error } = await query
        if (error) throw error

        let inventory = data as Inventory[]

        // Filter for low stock if requested
        if (filters?.low_stock) {
          inventory = inventory.filter(item => 
            item.product?.reorder_level && 
            item.quantity_available <= item.product.reorder_level
          )
        }

        return inventory
      },
      { ttl: CACHE_TTL.INVENTORY, forceRefresh }
    )
  }
}

/**
 * Cache management utilities
 */
export const cacheManager = {
  /**
   * Preload critical data for faster initial load
   */
  async preloadCriticalData(): Promise<void> {
    console.log('Preloading critical data...')
    
    const preloadPromises = [
      cachedApiClient.preloadCache(
        CacheKeys.DASHBOARD_METRICS,
        () => dashboardApiCached.getDashboardMetrics(true),
        CACHE_TTL.DASHBOARD_METRICS
      ),
      cachedApiClient.preloadCache(
        CacheKeys.USERS,
        () => usersApiCached.getUsers(true),
        CACHE_TTL.USERS
      )
    ]

    await Promise.allSettled(preloadPromises)
    console.log('Critical data preloaded')
  },

  /**
   * Invalidate all cache
   */
  clearAllCache(): void {
    cachedApiClient.invalidateCache('*')
    console.log('All cache cleared')
  },

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cachedApiClient.getCacheStats()
  }
}

// Auto-preload critical data on module load (client-side only)
if (typeof window !== 'undefined') {
  // Use requestIdleCallback for non-blocking preload, fallback to setTimeout
  const preloadWhenIdle = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        cacheManager.preloadCriticalData()
      }, { timeout: 5000 })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        cacheManager.preloadCriticalData()
      }, 2000)
    }
  }

  // Start preloading after initial render is complete
  if (document.readyState === 'complete') {
    preloadWhenIdle()
  } else {
    window.addEventListener('load', preloadWhenIdle)
  }

  // Set up background refresh intervals
  setInterval(() => {
    dashboardApiCached.refreshDashboardMetricsBackground()
  }, 2 * 60 * 1000) // Every 2 minutes
}

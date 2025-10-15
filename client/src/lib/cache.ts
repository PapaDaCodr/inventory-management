/**
 * Local caching utility for offline functionality and performance optimization
 * Implements cache-first strategy with TTL (Time To Live) support
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number // Default 5 minutes
  forceRefresh?: boolean
}

class LocalCache {
  private static instance: LocalCache
  private cache: Map<string, CacheItem<any>> = new Map()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): LocalCache {
    if (!LocalCache.instance) {
      LocalCache.instance = new LocalCache()
    }
    return LocalCache.instance
  }

  /**
   * Get data from cache if valid, otherwise return null
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    const now = Date.now()
    const isExpired = now - item.timestamp > item.ttl

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  /**
   * Set data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    }
    
    this.cache.set(key, item)
  }

  /**
   * Remove specific item from cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now()
    let validItems = 0
    let expiredItems = 0

    this.cache.forEach((item) => {
      const isExpired = now - item.timestamp > item.ttl
      if (isExpired) {
        expiredItems++
      } else {
        validItems++
      }
    })

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems
    }
  }

  /**
   * Clean up expired items
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((item, key) => {
      const isExpired = now - item.timestamp > item.ttl
      if (isExpired) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))
  }
}

/**
 * Cache-aware API wrapper
 * Implements cache-first strategy with automatic fallback to network
 */
export class CachedApiClient {
  private cache = LocalCache.getInstance()

  /**
   * Fetch data with cache-first strategy
   */
  async fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl, forceRefresh = false } = options

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = this.cache.get<T>(key)
      if (cachedData !== null) {
        console.log(`Cache hit for key: ${key}`)
        return cachedData
      }
    }

    console.log(`Cache miss for key: ${key}, fetching from network`)

    try {
      // Fetch from network
      const data = await fetchFn()
      
      // Store in cache
      this.cache.set(key, data, ttl)
      
      return data
    } catch (error) {
      // If network fails, try to return stale cache data
      const staleData = this.cache.get<T>(key)
      if (staleData !== null) {
        console.warn(`Network failed for key: ${key}, returning stale cache data`)
        return staleData
      }
      
      // No cache data available, re-throw error
      throw error
    }
  }

  /**
   * Invalidate cache for specific key or pattern
   */
  invalidateCache(keyOrPattern: string): void {
    if (keyOrPattern.includes('*')) {
      // Pattern matching - remove all keys that match
      const pattern = keyOrPattern.replace('*', '')
      const keysToDelete: string[] = []
      
      this.cache['cache'].forEach((_, key) => {
        if (key.includes(pattern)) {
          keysToDelete.push(key)
        }
      })
      
      keysToDelete.forEach(key => this.cache.delete(key))
    } else {
      // Exact key match
      this.cache.delete(keyOrPattern)
    }
  }

  /**
   * Preload data into cache
   */
  async preloadCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<void> {
    try {
      const data = await fetchFn()
      this.cache.set(key, data, ttl)
      console.log(`Preloaded cache for key: ${key}`)
    } catch (error) {
      console.error(`Failed to preload cache for key: ${key}`, error)
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats()
  }

  /**
   * Clean up expired cache items
   */
  cleanupCache(): void {
    this.cache.cleanup()
  }
}

// Export singleton instance
export const cachedApiClient = new CachedApiClient()

// Cache key generators
export const CacheKeys = {
  DASHBOARD_METRICS: 'dashboard:metrics',
  USERS: 'users:all',
  PRODUCTS: (filters?: string) => `products:${filters || 'all'}`,
  INVENTORY: (filters?: string) => `inventory:${filters || 'all'}`,
  SUPPLIERS: 'suppliers:all',
  CATEGORIES: 'categories:all',
  LOW_STOCK: 'inventory:low-stock',
  USER_PROFILE: (userId: string) => `user:${userId}`,
} as const

// Auto cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cachedApiClient.cleanupCache()
  }, 10 * 60 * 1000)
}

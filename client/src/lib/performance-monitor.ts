/**
 * Performance monitoring utility for tracking app loading times
 */

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetric> = new Map()
  private readonly STORAGE_KEY = 'sims_performance_metrics'

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Start timing a performance metric
   */
  startTiming(name: string): void {
    const startTime = performance.now()
    this.metrics.set(name, {
      name,
      startTime
    })
    console.log(`⏱️ Started timing: ${name}`)
  }

  /**
   * End timing a performance metric
   */
  endTiming(name: string): number | null {
    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`⚠️ No timing started for: ${name}`)
      return null
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    metric.endTime = endTime
    metric.duration = duration

    console.log(`✅ Completed timing: ${name} - ${duration.toFixed(2)}ms`)
    
    // Store in localStorage for analysis
    this.storeMetric(metric)
    
    return duration
  }

  /**
   * Get timing for a specific metric
   */
  getTiming(name: string): number | null {
    const metric = this.metrics.get(name)
    return metric?.duration || null
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined)
  }

  /**
   * Store metric in localStorage for analysis
   */
  private storeMetric(metric: PerformanceMetric): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const metrics = stored ? JSON.parse(stored) : []
      
      // Keep only last 50 metrics to avoid storage bloat
      metrics.push({
        ...metric,
        timestamp: new Date().toISOString()
      })
      
      if (metrics.length > 50) {
        metrics.splice(0, metrics.length - 50)
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(metrics))
    } catch (error) {
      console.error('Error storing performance metric:', error)
    }
  }

  /**
   * Get performance summary
   */
  getSummary(): { [key: string]: number } {
    const summary: { [key: string]: number } = {}
    
    this.metrics.forEach((metric, name) => {
      if (metric.duration !== undefined) {
        summary[name] = metric.duration
      }
    })
    
    return summary
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    const summary = this.getSummary()
    console.group('🚀 Performance Summary')
    Object.entries(summary).forEach(([name, duration]) => {
      const status = duration < 500 ? '🟢' : duration < 1000 ? '🟡' : '🔴'
      console.log(`${status} ${name}: ${duration.toFixed(2)}ms`)
    })
    console.groupEnd()
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Convenience functions
export const startTiming = (name: string) => performanceMonitor.startTiming(name)
export const endTiming = (name: string) => performanceMonitor.endTiming(name)
export const getTiming = (name: string) => performanceMonitor.getTiming(name)
export const logPerformanceSummary = () => performanceMonitor.logSummary()

// Auto-start app timing when module loads
if (typeof window !== 'undefined') {
  performanceMonitor.startTiming('app_initialization')
  
  // Log summary when page is fully loaded
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.logSummary()
    }, 1000)
  })
}

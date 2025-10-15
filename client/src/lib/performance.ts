/**
 * Performance monitoring utilities for tracking loading times and user experience
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
    
    // Log performance warnings for slow operations
    if (duration > 1000) {
      console.warn(`🐌 Slow operation detected: ${name} took ${duration.toFixed(2)}ms`)
    } else if (duration > 500) {
      console.log(`⚡ Moderate timing: ${name} took ${duration.toFixed(2)}ms`)
    } else {
      console.log(`🚀 Fast operation: ${name} took ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Get all performance metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  /**
   * Get a specific metric
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name)
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear()
    console.log('🧹 Performance metrics cleared')
  }

  /**
   * Log performance summary
   */
  logSummary(): void {
    const completedMetrics = Array.from(this.metrics.values()).filter(m => m.duration !== undefined)
    
    if (completedMetrics.length === 0) {
      console.log('📊 No completed performance metrics to display')
      return
    }

    console.group('📊 Performance Summary')
    completedMetrics
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .forEach(metric => {
        const duration = metric.duration!
        const emoji = duration > 1000 ? '🐌' : duration > 500 ? '⚡' : '🚀'
        console.log(`${emoji} ${metric.name}: ${duration.toFixed(2)}ms`)
      })
    
    const totalTime = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0)
    console.log(`⏱️ Total measured time: ${totalTime.toFixed(2)}ms`)
    console.groupEnd()
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Convenience functions
export const startTiming = (name: string) => performanceMonitor.startTiming(name)
export const endTiming = (name: string) => performanceMonitor.endTiming(name)
export const logPerformanceSummary = () => performanceMonitor.logSummary()

// Auto-log summary every 30 seconds in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const metrics = performanceMonitor.getMetrics()
    if (metrics.length > 0) {
      performanceMonitor.logSummary()
      performanceMonitor.clearMetrics()
    }
  }, 30000)
}

/**
 * Higher-order function to wrap async functions with performance timing
 */
export function withPerformanceTiming<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    startTiming(name)
    try {
      const result = await fn(...args)
      endTiming(name)
      return result
    } catch (error) {
      endTiming(name)
      throw error
    }
  }) as T
}

/**
 * React hook for timing component lifecycle
 */
export function usePerformanceTiming(componentName: string) {
  const startTime = performance.now()
  
  return {
    markMounted: () => {
      const mountTime = performance.now() - startTime
      console.log(`🎯 ${componentName} mounted in ${mountTime.toFixed(2)}ms`)
    },
    startTiming: (operation: string) => startTiming(`${componentName}:${operation}`),
    endTiming: (operation: string) => endTiming(`${componentName}:${operation}`)
  }
}

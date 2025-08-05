/**
 * Performance monitoring composable
 * Provides utilities for monitoring frontend performance
 */

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  operation: string;
}

export const usePerformance = () => {
  const metrics = ref<PerformanceMetrics[]>([]);
  const isMonitoring = ref(false);

  /**
   * Start timing an operation
   */
  const startTiming = (operation: string): number => {
    const startTime = performance.now();

    metrics.value.push({
      startTime,
      operation,
    });

    return startTime;
  };

  /**
   * End timing an operation
   */
  const endTiming = (operation: string, startTime?: number): number => {
    const endTime = performance.now();
    const metricIndex = metrics.value.findIndex(
      (m) => m.operation === operation && !m.endTime
    );

    if (metricIndex !== -1) {
      const metric = metrics.value[metricIndex];
      if (metric) {
        metric.endTime = endTime;
        metric.duration = endTime - metric.startTime;

        // Log slow operations (over 100ms)
        if (metric.duration > 100) {
          console.warn(
            `Slow operation detected: ${operation} took ${metric.duration.toFixed(
              2
            )}ms`
          );
        }

        return metric.duration;
      }
    }

    // Fallback if startTime is provided directly
    if (startTime) {
      const duration = endTime - startTime;
      if (duration > 100) {
        console.warn(
          `Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`
        );
      }
      return duration;
    }

    return 0;
  };

  /**
   * Time a function execution
   */
  const timeFunction = async <T>(
    operation: string,
    fn: () => Promise<T> | T
  ): Promise<T> => {
    const startTime = startTiming(operation);

    try {
      const result = await fn();
      endTiming(operation, startTime);
      return result;
    } catch (error) {
      endTiming(operation, startTime);
      throw error;
    }
  };

  /**
   * Monitor API request performance
   */
  const monitorApiRequest = async <T>(
    endpoint: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    return timeFunction(`API: ${endpoint}`, requestFn);
  };

  /**
   * Monitor component render performance
   */
  const monitorRender = (componentName: string) => {
    const startTime = performance.now();

    onMounted(() => {
      const duration = performance.now() - startTime;
      if (duration > 50) {
        console.warn(
          `Slow component render: ${componentName} took ${duration.toFixed(
            2
          )}ms`
        );
      }
    });
  };

  /**
   * Get performance metrics
   */
  const getMetrics = () => {
    return metrics.value.filter((m) => m.duration !== undefined);
  };

  /**
   * Clear performance metrics
   */
  const clearMetrics = () => {
    metrics.value = [];
  };

  /**
   * Get average duration for an operation
   */
  const getAverageDuration = (operation: string): number => {
    const operationMetrics = metrics.value.filter(
      (m) => m.operation === operation && m.duration !== undefined
    );

    if (operationMetrics.length === 0) return 0;

    const totalDuration = operationMetrics.reduce(
      (sum, metric) => sum + (metric.duration || 0),
      0
    );

    return totalDuration / operationMetrics.length;
  };

  /**
   * Log memory usage (if available)
   */
  const logMemoryUsage = (context: string = "") => {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      console.log(`Memory usage ${context}:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  };

  /**
   * Monitor page load performance
   */
  const monitorPageLoad = () => {
    if (typeof window !== "undefined") {
      window.addEventListener("load", () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            "navigation"
          )[0] as PerformanceNavigationTiming;

          if (navigation) {
            const metrics = {
              domContentLoaded:
                navigation.domContentLoadedEventEnd -
                navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
              totalTime: navigation.loadEventEnd - navigation.fetchStart,
            };

            console.log("Page load metrics:", metrics);

            // Warn about slow page loads
            if (metrics.totalTime > 3000) {
              console.warn(
                `Slow page load detected: ${metrics.totalTime.toFixed(2)}ms`
              );
            }
          }
        }, 0);
      });
    }
  };

  return {
    metrics: readonly(metrics),
    isMonitoring: readonly(isMonitoring),
    startTiming,
    endTiming,
    timeFunction,
    monitorApiRequest,
    monitorRender,
    getMetrics,
    clearMetrics,
    getAverageDuration,
    logMemoryUsage,
    monitorPageLoad,
  };
};

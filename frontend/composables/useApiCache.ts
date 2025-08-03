/**
 * API caching composable with improved memory management and error handling
 * Provides request caching to reduce API calls and improve performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  size: number;
  hitRate: number;
  totalRequests: number;
  cacheHits: number;
}

export const useApiCache = () => {
  const cache = new Map<string, CacheEntry<any>>();
  const MAX_CACHE_SIZE = 100; // Prevent memory leaks
  const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  // Cache statistics for monitoring
  let totalRequests = 0;
  let cacheHits = 0;

  /**
   * Generate cache key from URL and params
   */
  const generateKey = (url: string, params?: Record<string, any>): string => {
    const paramString = params ? JSON.stringify(params) : "";
    return `${url}${paramString}`;
  };

  /**
   * Check if cache entry is valid
   */
  const isValid = <T>(entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp < entry.ttl;
  };

  /**
   * Get cached data if valid
   */
  const get = <T>(key: string): T | null => {
    totalRequests++;
    const entry = cache.get(key) as CacheEntry<T> | undefined;

    if (entry && isValid(entry)) {
      // Update access statistics
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      cacheHits++;
      return entry.data;
    }

    // Remove expired entry
    if (entry) {
      cache.delete(key);
    }

    return null;
  };

  /**
   * Set cache entry with LRU eviction
   */
  const set = <T>(key: string, data: T, ttl: number = DEFAULT_TTL): void => {
    // Clean up expired entries first
    cleanupExpiredEntries();

    // Implement LRU eviction if cache is still full
    if (cache.size >= MAX_CACHE_SIZE) {
      evictLeastRecentlyUsed();
    }

    const now = Date.now();
    cache.set(key, {
      data,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now,
    });
  };

  /**
   * Clean up expired entries to free memory
   */
  const cleanupExpiredEntries = (): void => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        cache.delete(key);
      }
    }
  };

  /**
   * Evict least recently used entry
   */
  const evictLeastRecentlyUsed = (): void => {
    let lruKey = "";
    let oldestAccess = Date.now();

    for (const [k, entry] of cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        lruKey = k;
      }
    }

    if (lruKey) {
      cache.delete(lruKey);
    }
  };

  /**
   * Get cache statistics
   */
  const getStats = (): CacheStats => {
    return {
      size: cache.size,
      hitRate: totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0,
      totalRequests,
      cacheHits,
    };
  };

  /**
   * Clear cache entry or all cache
   */
  const clear = (key?: string): void => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  };

  /**
   * Cached API request
   */
  const cachedRequest = async <T>(
    url: string,
    options: {
      params?: Record<string, any>;
      ttl?: number;
      force?: boolean;
      fetcher?: (url: string) => Promise<T>;
    } = {}
  ): Promise<T> => {
    const { params, ttl = 5 * 60 * 1000, force = false, fetcher } = options;
    const key = generateKey(url, params);

    // Return cached data if available and not forced refresh
    if (!force) {
      const cached = get<T>(key);
      if (cached) {
        return cached;
      }
    }

    // Use provided fetcher or default $fetch
    if (!fetcher) {
      throw new Error("Fetcher function is required for cachedRequest");
    }

    const queryString = params ? `?${new URLSearchParams(params)}` : "";
    const data = await fetcher(`${url}${queryString}`);

    // Cache the result
    set(key, data, ttl);

    return data;
  };

  return {
    get,
    set,
    clear,
    generateKey,
    cachedRequest,
    getStats,
  };
};

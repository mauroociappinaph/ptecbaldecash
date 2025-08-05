/**
 * API caching composable for improved performance
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  lastAccessed: number; // For LRU eviction
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
  force?: boolean; // Force refresh cache
}

export const useApiCache = (maxSize: number = 100) => {
  const cache = new Map<string, CacheEntry>();
  const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate cache key from URL and params
   */
  const generateKey = (url: string, params?: Record<string, any>): string => {
    const paramString = params ? JSON.stringify(params) : "";
    return `${url}:${paramString}`;
  };

  /**
   * Check if cache entry is valid
   */
  const isValid = (entry: CacheEntry): boolean => {
    return Date.now() - entry.timestamp < entry.ttl;
  };

  /**
   * Get data from cache with LRU tracking
   */
  const get = <T>(key: string): T | null => {
    const entry = cache.get(key);

    if (!entry) {
      return null;
    }

    if (!isValid(entry)) {
      cache.delete(key);
      return null;
    }

    // Update last accessed for LRU
    entry.lastAccessed = Date.now();
    return entry.data as T;
  };

  /**
   * Set data in cache with LRU eviction
   */
  const set = <T>(key: string, data: T, ttl: number = DEFAULT_TTL): void => {
    // Implement LRU eviction when cache is full
    if (cache.size >= maxSize && !cache.has(key)) {
      // Find least recently used entry
      let oldestKey = "";
      let oldestTime = Date.now();

      for (const [cacheKey, entry] of cache.entries()) {
        if (entry.lastAccessed < oldestTime) {
          oldestTime = entry.lastAccessed;
          oldestKey = cacheKey;
        }
      }

      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }

    const now = Date.now();
    cache.set(key, {
      data,
      timestamp: now,
      ttl,
      lastAccessed: now,
    });
  };

  /**
   * Clear cache entry
   */
  const clear = (key: string): void => {
    cache.delete(key);
  };

  /**
   * Clear all cache entries
   */
  const clearAll = (): void => {
    cache.clear();
  };

  /**
   * Cached API request
   */
  const cachedRequest = async <T>(
    url: string,
    requestFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> => {
    const { ttl = DEFAULT_TTL, key, force = false } = options;
    const cacheKey = key || generateKey(url);

    // Return cached data if available and not forced refresh
    if (!force) {
      const cachedData = get<T>(cacheKey);
      if (cachedData !== null) {
        return cachedData;
      }
    }

    // Fetch fresh data
    const data = await requestFn();

    // Cache the result
    set(cacheKey, data, ttl);

    return data;
  };

  /**
   * Cached fetch with automatic key generation
   */
  const cachedFetch = async <T>(
    url: string,
    options: CacheOptions & Record<string, any> = {}
  ): Promise<T> => {
    const { ttl, key, force, ...fetchOptions } = options;

    return cachedRequest(
      url,
      async () => {
        const response = await $fetch<T>(url, fetchOptions);
        return response;
      },
      {
        ttl,
        key,
        force,
      }
    );
  };

  /**
   * Get cache statistics
   */
  const getStats = () => {
    const entries = Array.from(cache.entries());
    const validEntries = entries.filter(([, entry]) => isValid(entry));
    const expiredEntries = entries.filter(([, entry]) => !isValid(entry));

    return {
      total: entries.length,
      valid: validEntries.length,
      expired: expiredEntries.length,
      size: cache.size,
    };
  };

  /**
   * Clean expired entries
   */
  const cleanup = (): number => {
    const entries = Array.from(cache.entries());
    let cleaned = 0;

    entries.forEach(([key, entry]) => {
      if (!isValid(entry)) {
        cache.delete(key);
        cleaned++;
      }
    });

    return cleaned;
  };

  // Automatic cleanup every 10 minutes
  if (import.meta.client) {
    setInterval(cleanup, 10 * 60 * 1000);
  }

  // Unified caching interface
  const cached = {
    request: async <T>(
      key: string,
      requestFn: () => Promise<T>,
      options: CacheOptions = {}
    ): Promise<T> => {
      const { ttl = DEFAULT_TTL, force = false } = options;

      if (!force) {
        const cachedData = get<T>(key);
        if (cachedData !== null) {
          return cachedData;
        }
      }

      try {
        const data = await requestFn();
        set(key, data, ttl);
        return data;
      } catch (error) {
        console.error(`Cache request failed for key: ${key}`, error);
        throw error;
      }
    },

    fetch: async <T>(
      url: string,
      options: CacheOptions & Record<string, any> = {}
    ): Promise<T> => {
      const { ttl, key, force, ...fetchOptions } = options;
      const cacheKey = key || generateKey(url, fetchOptions);

      return cached.request(cacheKey, () => $fetch<T>(url, fetchOptions), {
        ttl,
        force,
      });
    },
  };

  return {
    get,
    set,
    clear,
    clearAll,
    cached,
    cachedRequest,
    cachedFetch,
    getStats,
    cleanup,
  };
};

/**
 * Loading state management composable
 * Provides centralized loading state management for async operations
 */
export const useLoadingState = () => {
  const loadingStates = ref<Record<string, boolean>>({});

  /**
   * Set loading state for a specific operation
   */
  const setLoading = (key: string, loading: boolean) => {
    loadingStates.value[key] = loading;
  };

  /**
   * Check if a specific operation is loading
   */
  const isLoading = (key: string): boolean => {
    return loadingStates.value[key] || false;
  };

  /**
   * Check if any operation is loading
   */
  const isAnyLoading = (): boolean => {
    return Object.values(loadingStates.value).some((loading) => loading);
  };

  /**
   * Execute an async operation with loading state management
   */
  const withLoading = async <T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    setLoading(key, true);
    try {
      return await operation();
    } finally {
      setLoading(key, false);
    }
  };

  /**
   * Clear all loading states
   */
  const clearAll = () => {
    loadingStates.value = {};
  };

  return {
    loadingStates: readonly(loadingStates),
    setLoading,
    isLoading,
    isAnyLoading,
    withLoading,
    clearAll,
  };
};

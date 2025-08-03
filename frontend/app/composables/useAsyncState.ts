/**
 * Composable for managing async operation states
 * Provides consistent loading, error, and success state management
 */

interface AsyncState<T> {
  data: Ref<T | null>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export const useAsyncState = <T = any>(
  initialData: T | null = null
): AsyncState<T> => {
  const data = ref<T | null>(initialData) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async (operation: () => Promise<T>): Promise<T | null> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await operation();
      data.value = result;
      return result;
    } catch (err: any) {
      error.value = err.message || "An error occurred";
      console.error("Async operation failed:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    data.value = initialData;
    loading.value = false;
    error.value = null;
  };

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

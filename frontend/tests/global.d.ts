
import type {
  Ref,
  WatchStopHandle
} from 'vue';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

// Type definitions for test environment composables
interface AuthComposable {
  user: Ref<any>;
  loggedIn: Ref<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  hasRole: (role: string) => boolean;
  isAdministrator: () => boolean;
  isReviewer: () => boolean;
  canManageUsers: () => boolean;
  isReadOnly: () => boolean;
  getCurrentUser: () => any;
}

interface ApiComposable {
  get: (url: string, options?: any) => Promise<any>;
  post: (url: string, data?: any, options?: any) => Promise<any>;
  put: (url: string, data?: any, options?: any) => Promise<any>;
  del: (url: string, options?: any) => Promise<any>;
  testConnection: () => Promise<any>;
  apiBase: string;
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: string;
      LOGOUT: string;
    };
    USERS: {
      LIST: string;
      CREATE: string;
      UPDATE: (id: number) => string;
      DELETE: (id: number) => string;
    };
    HEALTH: string;
  };
}

interface ToastComposable {
  success: (message: string, options?: { title?: string; persistent?: boolean }) => void;
  error: (message: string, options?: { title?: string; persistent?: boolean }) => void;
  warning: (message: string, options?: { title?: string; persistent?: boolean }) => void;
  info: (message: string, options?: { title?: string; persistent?: boolean }) => void;
}

interface FormErrorHandlerComposable {
  formState: {
    loading: boolean;
    errors: Record<string, string[]>;
    generalError: string | null;
  };
  handleFormSubmit: <T>(
    submitFn: () => Promise<T>,
    options?: { successMessage?: string; successTitle?: string; clearOnSuccess?: boolean }
  ) => Promise<{ success: boolean; data?: T }>;
  hasFieldError: (field: string) => boolean;
  getFieldError: (field: string) => string[];
  clearErrors: () => void;
}

interface PerformanceComposable {
  logMemoryUsage: (context?: string) => void;
  measureExecutionTime: <T>(fn: () => T, label?: string) => T;
  measureAsyncExecutionTime: <T>(fn: () => Promise<T>, label?: string) => Promise<T>;
}

declare global {
  namespace NodeJS {
    interface Global {
      // Vue core composables
      ref: <T>(value: T) => Ref<T>;
      reactive: <T extends object>(target: T) => T;
      computed: <T>(getter: () => T) => ComputedRef<T>;
      watch: <T>(
        source: T,
        callback: (newVal: T, oldVal: T) => void,
        options?: { immediate?: boolean; deep?: boolean }
      ) => WatchStopHandle;
      watchEffect: (effect: () => void) => WatchStopHandle;
      onMounted: (hook: () => void) => void;
      onUnmounted: (hook: () => void) => void;
      readonly: <T>(target: T) => Readonly<T>;
      nextTick: (fn?: () => void) => Promise<void>;

      // Nuxt framework composables
      useRouter: () => Router;
      useRoute: () => RouteLocationNormalizedLoaded;
      navigateTo: (path: string, options?: { replace?: boolean }) => Promise<void>;
      useRuntimeConfig: () => {
        public: {
          apiBase: string;
          appName: string;
        };
      };
      useFetch: <T>(url: string, options?: any) => Promise<{ data: Ref<T> }>;
      $fetch: <T>(url: string, options?: any) => Promise<T>;

      // Application-specific composables
      useAuth: () => AuthComposable;
      useApi: () => ApiComposable;
      useToast: () => ToastComposable;
      useFormErrorHandler: () => FormErrorHandlerComposable;
      usePerformance: () => PerformanceComposable;
    }
  }
}

export { };


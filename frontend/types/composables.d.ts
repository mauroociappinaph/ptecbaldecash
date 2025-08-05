import type { ComputedRef, Ref } from 'vue';

// Shared type definitions for composables
export interface AuthComposable {
  user: Ref<User | null>;
  loggedIn: Ref<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  hasRole: (role: UserRole) => boolean;
  isAdministrator: ComputedRef<boolean>;
  isReviewer: ComputedRef<boolean>;
  canManageUsers: ComputedRef<boolean>;
  isReadOnly: ComputedRef<boolean>;
  getCurrentUser: () => User | null;
}

export interface ApiComposable {
  get: <T = any>(url: string, options?: RequestOptions) => Promise<T>;
  post: <T = any>(url: string, data?: any, options?: RequestOptions) => Promise<T>;
  put: <T = any>(url: string, data?: any, options?: RequestOptions) => Promise<T>;
  del: <T = any>(url: string, options?: RequestOptions) => Promise<T>;
  testConnection: () => Promise<{ status: string; timestamp: string }>;
  apiBase: string;
  API_ENDPOINTS: ApiEndpoints;
}

export interface ToastComposable {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
}

export interface FormErrorHandlerComposable {
  formState: FormState;
  handleFormSubmit: <T>(
    submitFn: () => Promise<T>,
    options?: SubmitOptions
  ) => Promise<{ success: boolean; data?: T }>;
  hasFieldError: (field: string) => boolean;
  getFieldError: (field: string) => string[];
  clearErrors: () => void;
}

// Supporting types
export interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  role: UserRole;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type UserRole = 'administrator' | 'reviewer';

export interface ToastOptions {
  title?: string;
  persistent?: boolean;
  duration?: number;
}

export interface FormState {
  loading: boolean;
  errors: Record<string, string[]>;
  generalError: string | null;
}

export interface SubmitOptions {
  successMessage?: string;
  successTitle?: string;
  clearOnSuccess?: boolean;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiEndpoints {
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
}

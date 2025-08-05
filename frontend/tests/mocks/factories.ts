import { vi } from 'vitest';
import { computed, ref } from 'vue';
import type {
    ApiComposable,
    AuthComposable,
    FormErrorHandlerComposable,
    ToastComposable
} from '../../types/composables';

// Performance composable interface for testing
interface PerformanceComposable {
    metrics: any;
    isMonitoring: any;
    startTiming: (operation: string) => number;
    endTiming: (operation: string, startTime?: number) => number;
    timeFunction: <T>(operation: string, fn: () => Promise<T> | T) => Promise<T>;
    monitorApiRequest: <T>(endpoint: string, requestFn: () => Promise<T>) => Promise<T>;
    monitorRender: (componentName: string) => void;
    getMetrics: () => any[];
    clearMetrics: () => void;
    getAverageDuration: (operation: string) => number;
    logMemoryUsage: (context?: string) => void;
    monitorPageLoad: () => void;
}

/**
 * Factory functions for creating consistent mocks across tests
 */

/**
 * Creates a mock performance composable for testing
 * @param overrides - Partial overrides for specific test scenarios
 * @returns Mock performance composable with all required methods
 */
export const createMockPerformance = (overrides: Partial<PerformanceComposable> = {}): PerformanceComposable => ({
    metrics: ref([]),
    isMonitoring: ref(false),
    startTiming: vi.fn().mockReturnValue(performance.now()),
    endTiming: vi.fn().mockReturnValue(100),
    timeFunction: vi.fn().mockImplementation(async (_operation, fn) => await fn()),
    monitorApiRequest: vi.fn().mockImplementation(async (_endpoint, requestFn) => await requestFn()),
    monitorRender: vi.fn(),
    getMetrics: vi.fn().mockReturnValue([]),
    clearMetrics: vi.fn(),
    getAverageDuration: vi.fn().mockReturnValue(0),
    logMemoryUsage: vi.fn(),
    monitorPageLoad: vi.fn(),
    ...overrides,
});

/**
 * Creates a mock authentication composable for testing
 * @param overrides - Partial overrides for specific test scenarios
 * @returns Mock auth composable with all required methods and state
 */
export const createMockAuth = (overrides: Partial<AuthComposable> = {}): AuthComposable => ({
    user: ref(null),
    loggedIn: ref(false),
    isLoading: ref(false),
    error: ref(null),
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    refreshSession: vi.fn().mockResolvedValue(undefined),
    clearError: vi.fn(),
    hasRole: vi.fn().mockReturnValue(false),
    isAdministrator: computed(() => false),
    isReviewer: computed(() => false),
    canManageUsers: computed(() => false),
    isReadOnly: computed(() => false),
    getCurrentUser: vi.fn().mockReturnValue(null),
    ...overrides,
});

/**
 * Creates a mock API composable for testing
 * @param overrides - Partial overrides for specific test scenarios
 * @returns Mock API composable with all HTTP methods and endpoints
 */
export const createMockApi = (overrides: Partial<ApiComposable> = {}): ApiComposable => ({
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    del: vi.fn().mockResolvedValue({}),
    testConnection: vi.fn().mockResolvedValue({ status: 'ok', timestamp: new Date().toISOString() }),
    apiBase: 'http://localhost:8000/api',
    API_ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
        },
        USERS: {
            LIST: '/users',
            CREATE: '/users',
            UPDATE: (id: number) => `/users/${id}`,
            DELETE: (id: number) => `/users/${id}`,
        },
        HEALTH: '/health',
    },
    ...overrides,
});

/**
 * Creates a mock toast composable for testing
 * @param overrides - Partial overrides for specific test scenarios
 * @returns Mock toast composable with notification methods
 */
export const createMockToast = (overrides: Partial<ToastComposable> = {}): ToastComposable => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    ...overrides,
});

/**
 * Creates a mock form error handler composable for testing
 * @param overrides - Partial overrides for specific test scenarios
 * @returns Mock form error handler with validation and submission methods
 */
export const createMockFormErrorHandler = (
    overrides: Partial<FormErrorHandlerComposable> = {}
): FormErrorHandlerComposable => ({
    formState: {
        loading: false,
        errors: {},
        generalError: null,
    },
    handleFormSubmit: vi.fn().mockResolvedValue({ success: true }),
    hasFieldError: vi.fn().mockReturnValue(false),
    getFieldError: vi.fn().mockReturnValue([]),
    clearErrors: vi.fn(),
    ...overrides,
});

/**
 * Assigns global mock functions to globalThis for test environment
 * This function sets up all necessary composable mocks that are auto-imported in Nuxt
 */
export const assignGlobalMocks = () => {
    // Use Object.defineProperty to avoid TypeScript errors and ensure proper mock behavior
    Object.defineProperty(globalThis, 'useAuth', {
        value: vi.fn(() => createMockAuth()),
        writable: true,
        configurable: true,
    });

    Object.defineProperty(globalThis, 'useApi', {
        value: vi.fn(() => createMockApi()),
        writable: true,
        configurable: true,
    });

    Object.defineProperty(globalThis, 'useToast', {
        value: vi.fn(() => createMockToast()),
        writable: true,
        configurable: true,
    });

    Object.defineProperty(globalThis, 'useFormErrorHandler', {
        value: vi.fn(() => createMockFormErrorHandler()),
        writable: true,
        configurable: true,
    });

    Object.defineProperty(globalThis, 'usePerformance', {
        value: vi.fn(() => createMockPerformance()),
        writable: true,
        configurable: true,
    });
};

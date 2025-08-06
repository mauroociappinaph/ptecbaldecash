import { vi } from 'vitest';
import { ref } from 'vue';
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
    isAdministrator: vi.fn().mockReturnValue(false),
    isReviewer: vi.fn().mockReturnValue(false),
    canManageUsers: vi.fn().mockReturnValue(false),
    isReadOnly: vi.fn().mockReturnValue(true),
    getCurrentUser: vi.fn().mockReturnValue(null),
    ...overrides,
});

/**
 * Creates a mock authentication composable for administrator role testing
 * @param overrides - Additional overrides for specific test scenarios
 * @returns Mock auth composable configured for administrator role
 */
export const createMockAdminAuth = (overrides: Partial<AuthComposable> = {}): AuthComposable => {
    const adminUser = {
        id: 1,
        name: "Admin",
        last_name: "User",
        email: "admin@example.com",
        role: "administrator" as const,
        full_name: "Admin User",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
    };

    return createMockAuth({
        user: ref(adminUser),
        loggedIn: ref(true),
        hasRole: vi.fn((role: string) => role === "administrator"),
        isAdministrator: vi.fn().mockReturnValue(true),
        isReviewer: vi.fn().mockReturnValue(false),
        canManageUsers: vi.fn().mockReturnValue(true),
        isReadOnly: vi.fn().mockReturnValue(false),
        getCurrentUser: vi.fn().mockReturnValue(adminUser),
        ...overrides,
    });
};

/**
 * Creates a mock authentication composable for reviewer role testing
 * @param overrides - Additional overrides for specific test scenarios
 * @returns Mock auth composable configured for reviewer role
 */
export const createMockReviewerAuth = (overrides: Partial<AuthComposable> = {}): AuthComposable => {
    const reviewerUser = {
        id: 2,
        name: "Reviewer",
        last_name: "User",
        email: "reviewer@example.com",
        role: "reviewer" as const,
        full_name: "Reviewer User",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
    };

    return createMockAuth({
        user: ref(reviewerUser),
        loggedIn: ref(true),
        hasRole: vi.fn((role: string) => role === "reviewer"),
        isAdministrator: vi.fn().mockReturnValue(false),
        isReviewer: vi.fn().mockReturnValue(true),
        canManageUsers: vi.fn().mockReturnValue(false),
        isReadOnly: vi.fn().mockReturnValue(true),
        getCurrentUser: vi.fn().mockReturnValue(reviewerUser),
        ...overrides,
    });
};

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
    const mockDefinitions = {
        useAuth: createMockAuth,
        useApi: createMockApi,
        useToast: createMockToast,
        useFormErrorHandler: createMockFormErrorHandler,
        usePerformance: createMockPerformance,
    };

    // Use Object.defineProperty to avoid TypeScript errors and ensure proper mock behavior
    Object.entries(mockDefinitions).forEach(([name, factory]) => {
        Object.defineProperty(globalThis, name, {
            value: vi.fn(() => factory()),
            writable: true,
            configurable: true,
        });
    });
};

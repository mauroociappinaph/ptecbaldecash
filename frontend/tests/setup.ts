/**
 * Test Setup Configuration
 *
 * This file configures the global test environment for the User Management System.
 * It provides:
 * - Mock factories for Vue Router, API endpoints, and composables
 * - Global test utilities and configurations
 * - Lifecycle hooks for test setup and teardown
 * - Environment-specific configurations
 *
 * @module TestSetup
 */

import { config } from "@vue/test-utils";
import { afterEach, beforeEach, vi } from "vitest";
import { ref } from "vue";
import type { RouteLocationNormalizedLoaded, Router } from "vue-router";

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================
const TEST_API_BASE = "http://localhost:8000/api";
const TEST_APP_NAME = "User Management System";

/**
 * Centralized test configuration object
 * Contains all test-related constants and settings
 */
export const TEST_CONFIG = {
  api: {
    baseUrl: TEST_API_BASE,
    timeout: 5000,
  },
  app: {
    name: TEST_APP_NAME,
    defaultRoute: "/",
  },
  mocks: {
    suppressConsole: process.env.NODE_ENV === "test",
    enableDebugLogs: process.env.DEBUG_TESTS === "true",
  },
} as const;

// ============================================================================
// MOCK FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates a mock Vue Router instance for testing
 * @param initialRoute - The initial route path (default: "/")
 * @returns Mock router object with all necessary methods
 */
export const createMockRouter = (initialRoute = "/"): Partial<Router> => ({
  push: vi.fn().mockResolvedValue(undefined),
  replace: vi.fn().mockResolvedValue(undefined),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  getRoutes: vi.fn().mockReturnValue([]),
  hasRoute: vi.fn().mockReturnValue(true),
  resolve: vi.fn().mockReturnValue({ href: initialRoute }),
  currentRoute: ref(createMockRoute(initialRoute)),
});

/**
 * Creates a mock Vue Router route object for testing
 * @param path - The route path (default: "/")
 * @returns Mock route object matching RouteLocationNormalizedLoaded interface
 */
export const createMockRoute = (path = "/"): RouteLocationNormalizedLoaded => ({
  path,
  name: path === "/" ? "index" : path.slice(1),
  params: {},
  query: {},
  hash: "",
  fullPath: path,
  matched: [],
  meta: {},
  redirectedFrom: undefined,
});

/**
 * Creates mock API endpoints configuration for testing
 * @returns Object containing all API endpoint definitions
 */
export const createMockApiEndpoints = () => ({
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
  },
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
  },
  HEALTH: "/health",
});

// ============================================================================
// VUE TEST UTILS CONFIGURATION
// ============================================================================
if (!config.global.config) {
  config.global.config = {};
}

// Type-safe global properties assignment
config.global.config.globalProperties = {
  $t: (key: string) => key, // Mock i18n translation function
  $router: createMockRouter(),
  $route: createMockRoute(),
} as any; // Use 'any' type assertion for test flexibility

// ============================================================================
// COMPOSABLE MOCKS
// ============================================================================

// Mock usePerformance globally
vi.mock("~/composables/usePerformance", () => ({
  usePerformance: vi.fn(() => ({
    startMeasure: vi.fn(),
    endMeasure: vi.fn(),
    logMemoryUsage: vi.fn(),
    monitorRender: vi.fn(),
  })),
}));

// Mock Nuxt composables with centralized configuration
vi.mock("~/composables/useApi", () => ({
  useApi: vi.fn(() => ({
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    del: vi.fn().mockResolvedValue({}),
    testConnection: vi.fn().mockResolvedValue({ status: 'ok', timestamp: new Date().toISOString() }),
    apiBase: TEST_API_BASE,
    API_ENDPOINTS: createMockApiEndpoints(),
  })),
}));

vi.mock("#app", () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: TEST_API_BASE,
      appName: TEST_APP_NAME,
    },
  }),
  navigateTo: vi.fn(),
  $fetch: vi.fn(),
  useRouter: () => config.global.config?.globalProperties?.$router || createMockRouter(),
  useRoute: () => config.global.config?.globalProperties?.$route || createMockRoute(),
}));

// Mock Nuxt Auth Utils
vi.mock("nuxt-auth-utils", async () => {
  const { ref } = await import("vue");
  const actual = await vi.importActual("nuxt-auth-utils").catch(() => ({}));
  return {
    ...actual,
    useUserSession: vi.fn(() => ({
      user: ref(null),
      loggedIn: ref(false),
      clear: vi.fn().mockResolvedValue(undefined),
      fetch: vi.fn().mockResolvedValue(undefined),
    })),
    setUserSession: vi.fn().mockResolvedValue(undefined),
    clearUserSession: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock useAuth composable globally
vi.mock("~/composables/useAuth", () => {
  const { ref, computed } = require("vue");
  return {
    useAuth: vi.fn(() => ({
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
    })),
  };
});

// Import mock factories
import { assignGlobalMocks } from './mocks/factories';

// Assign global mocks using factory functions
assignGlobalMocks();

// Mock Pinia stores
vi.mock("pinia", async () => {
  const actual = await vi.importActual("pinia");
  return {
    ...actual,
    defineStore: vi.fn((_name, options) => {
      const store = {
        ...options.state(),
        ...options.actions,
        ...options.getters,
      };
      return vi.fn(() => store);
    }),
    createPinia: vi.fn(() => ({ use: vi.fn() })),
    setActivePinia: vi.fn(),
  };
});

// ============================================================================
// TEST LIFECYCLE HOOKS
// ============================================================================

// Setup and teardown for each test
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();

  // Reset fetch mock
  global.fetch = vi.fn();

  // Reset localStorage
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });
});

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks();
});

// ============================================================================
// GLOBAL TEST UTILITIES
// ============================================================================

// Configure console behavior for tests
global.console = {
  ...console,
  // Suppress console.log in tests unless needed for debugging
  log: TEST_CONFIG.mocks.suppressConsole ? vi.fn() : console.log,
  error: TEST_CONFIG.mocks.enableDebugLogs ? console.error : vi.fn(),
  warn: TEST_CONFIG.mocks.enableDebugLogs ? console.warn : vi.fn(),
};

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver for components that might use it
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

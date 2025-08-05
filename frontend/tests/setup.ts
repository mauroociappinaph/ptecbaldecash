import { config } from "@vue/test-utils";
import { afterEach, beforeEach, vi } from "vitest";

// Configure Vue Test Utils globally
config.global.config = {
  globalProperties: {},
};

// Mock usePerformance globally
vi.mock("~/composables/usePerformance", () => ({
  usePerformance: vi.fn(() => ({
    startMeasure: vi.fn(),
    endMeasure: vi.fn(),
    logMemoryUsage: vi.fn(),
    monitorRender: vi.fn(),
  })),
}));

// Configure Vue Test Utils globally
config.global.mocks = {
  $t: (key: string) => key, // Mock i18n if needed later
};

// Mock Nuxt composables
vi.mock("~/composables/useApi", () => ({
  useApi: vi.fn(() => ({
    get: vi.fn(() => Promise.resolve({})),
    post: vi.fn(() => Promise.resolve({})),
    put: vi.fn(() => Promise.resolve({})),
    del: vi.fn(() => Promise.resolve({})),
    testConnection: vi.fn(() => Promise.resolve({})),
    apiBase: "http://localhost:8000/api",
    API_ENDPOINTS: {
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
    },
  })),
}));

vi.mock("#app", () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: "http://localhost:8000/api",
      appName: "User Management System",
    },
  }),
  navigateTo: vi.fn(),
  $fetch: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useRoute: () => ({
    path: "/",
    name: "index",
    params: {},
    query: {},
  }),
}));

// Mock Nuxt Auth Utils
vi.mock("nuxt-auth-utils", async () => {
  const { ref } = await import("vue");
  const actual = await vi.importActual("nuxt-auth-utils");
  return {
    ...actual,
    useUserSession: vi.fn(() => ({
      user: ref(null),
      loggedIn: ref(false),
      clear: vi.fn(),
      fetch: vi.fn(),
    })),
    setUserSession: vi.fn(),
    clearUserSession: vi.fn(),
  };
});

// Import mock factories
import { assignGlobalMocks } from './mocks/factories';

// Assign global mocks using factory functions
assignGlobalMocks();

// Global mocks are now handled by the factory functions

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

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless needed for debugging
  log: process.env.NODE_ENV === "test" ? vi.fn() : console.log,
  error: vi.fn(),
  warn: vi.fn(),
};

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
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

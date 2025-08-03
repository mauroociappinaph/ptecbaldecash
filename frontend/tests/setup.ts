import { config } from "@vue/test-utils";
import { afterEach, beforeEach, vi } from "vitest";



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
  const actual = await vi.importActual("nuxt-auth-utils");
  const user = ref(null);
  const loggedIn = computed(() => !!user.value);

  return {
    ...actual,
    useUserSession: vi.fn(() => ({
      user,
      loggedIn,
      clear: vi.fn(),
      fetch: vi.fn(),
    })),
    setUserSession: vi.fn(),
    clearUserSession: vi.fn(),
  };
});

import { mockUsers } from "./test-utils";
import type { AuthUser } from "~/types";

vi.mock("~/composables/useAuth", () => {
  const user = ref<AuthUser | null>(null);
  const loggedIn = computed(() => !!user.value);

  return {
    useAuth: vi.fn(() => ({
      user,
      loggedIn,
      isLoading: ref(false),
      error: ref(null),
      login: vi.fn(async (credentials) => {
        if (credentials.email === "admin@example.com") {
          user.value = mockUsers.administrator;
          return { user: mockUsers.administrator, token: "admin-token" };
        } else if (credentials.email === "reviewer@example.com") {
          user.value = mockUsers.reviewer;
          return { user: mockUsers.reviewer, token: "reviewer-token" };
        } else {
          throw new Error("Invalid credentials");
        }
      }),
      logout: vi.fn(async () => {
        user.value = null;
      }),
      refreshSession: vi.fn(),
      clearError: vi.fn(),
      hasRole: vi.fn((role: string) => user.value?.role === role),
      isAdministrator: vi.fn(() => user.value?.role === "administrator"),
      isReviewer: vi.fn(() => user.value?.role === "reviewer"),
      canManageUsers: vi.fn(() => user.value?.role === "administrator"),
      isReadOnly: vi.fn(() => user.value?.role === "reviewer"),
      getCurrentUser: vi.fn(() => user.value),
    })),
  };
});

// Mock Pinia stores
vi.mock("pinia", async () => {
  const actual = await vi.importActual("pinia");
  return {
    ...actual,
    defineStore: vi.fn((name, options) => {
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

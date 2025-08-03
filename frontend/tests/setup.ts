import { config } from "@vue/test-utils";
import { afterEach, beforeEach, vi } from "vitest";
import { onUnmounted } from "vue"; // Add this import

// Configure Vue Test Utils globally
config.global.mocks = {
  $t: (key: string) => key, // Mock i18n if needed later
};

// Mock Vue composables
vi.mock("vue", async () => {
  const actual = await vi.importActual("vue");
  return {
    ...actual,
    ref: vi.fn((value) => ({ value })),
    reactive: vi.fn((value) => value),
    computed: vi.fn((fn) => ({ value: fn() })),
    watch: vi.fn(),
    watchEffect: vi.fn(),
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    readonly: vi.fn((value) => value),
  };
});

// Mock Nuxt composables
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
vi.mock("nuxt-auth-utils", () => ({
  useUserSession: () => ({
    data: { value: null },
    refresh: vi.fn(),
  }),
  setUserSession: vi.fn(),
  clearUserSession: vi.fn(),
}));

// Mock Pinia stores
vi.mock("pinia", () => ({
  defineStore: vi.fn(),
  createPinia: vi.fn(),
  setActivePinia: vi.fn(),
}));

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

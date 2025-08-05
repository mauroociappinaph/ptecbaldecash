import { vi } from 'vitest';

/**
 * Centralized mock configurations for composables
 * This file provides consistent mock implementations across all tests
 */

// Mock implementations for Nuxt composables
export const mockNuxtComposables = {
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: {
      value: {
        path: '/',
        name: 'index',
        params: {},
        query: {},
      },
    },
  })),

  useRoute: vi.fn(() => ({
    path: '/',
    name: 'index',
    params: {},
    query: {},
  })),

  useRuntimeConfig: vi.fn(() => ({
    public: {
      apiBase: 'http://localhost:8000/api',
      appName: 'User Management System',
    },
  })),

  navigateTo: vi.fn(),
  $fetch: vi.fn(),
};

// Mock implementations for Vue composables
export const mockVueComposables = {
  ref: vi.fn((value) => ({ value })),
  reactive: vi.fn((obj) => obj),
  computed: vi.fn((fn) => ({ value: fn() })),
  watch: vi.fn(),
  watchEffect: vi.fn(),
  onMounted: vi.fn(),
  onUnmounted: vi.fn(),
  readonly: vi.fn((obj) => obj),
  nextTick: vi.fn(() => Promise.resolve()),
};

// Performance composable mock
export const mockPerformanceComposable = vi.fn(() => ({
  startMeasure: vi.fn(),
  endMeasure: vi.fn(),
  logMemoryUsage: vi.fn(),
  monitorRender: vi.fn(),
  measureExecutionTime: vi.fn((fn) => fn()),
  measureAsyncExecutionTime: vi.fn((fn) => fn()),
}));

// Apply all mocks to global scope
export const applyGlobalMocks = () => {
  // Apply Nuxt composables
  Object.entries(mockNuxtComposables).forEach(([key, mock]) => {
    Object.defineProperty(globalThis, key, {
      value: mock,
      writable: true,
      configurable: true,
    });
  });

  // Apply Vue composables
  Object.entries(mockVueComposables).forEach(([key, mock]) => {
    Object.defineProperty(globalThis, key, {
      value: mock,
      writable: true,
      configurable: true,
    });
  });

  // Apply performance composable
  Object.defineProperty(globalThis, 'usePerformance', {
    value: mockPerformanceComposable,
    writable: true,
    configurable: true,
  });
};

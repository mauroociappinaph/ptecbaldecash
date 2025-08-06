
import { mount, type VueWrapper } from "@vue/test-utils";
import { createPinia } from "pinia";
import { vi } from "vitest";
import { ref, type Component } from "vue";
import type { User, UserRole } from "../types/index";

// Import shared types and factories for consistency

/**
 * Enhanced test utilities for the User Management System frontend
 *
 * This module provides comprehensive testing utilities including:
 * - Mock data generators for users and API responses
 * - Mock composables for authentication, routing, and API calls
 * - Test wrapper functions with proper Vue Test Utils configuration
 * - Async testing helpers for handling promises and conditions
 *
 * @module TestUtils
 */

// Mock user data for testing
export const mockUsers: Record<UserRole, MockUser> = {
  administrator: {
    id: 1,
    name: "Admin",
    last_name: "User",
    email: "admin@example.com",
    role: "administrator",
    full_name: "Admin User",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  reviewer: {
    id: 2,
    name: "Reviewer",
    last_name: "User",
    email: "reviewer@example.com",
    role: "reviewer",
    full_name: "Reviewer User",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
} as const;

// Mock API responses
export const mockApiResponses = {
  loginSuccess: {
    user: mockUsers.administrator,
    token: "mock-token-123",
  },
  usersList: {
    data: [mockUsers.administrator, mockUsers.reviewer],
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 2,
      from: 1,
      to: 2,
    },
    links: {
      first: "/api/users?page=1",
      last: "/api/users?page=1",
      prev: null,
      next: null,
    },
  },
  validationError: {
    message: "The given data was invalid.",
    errors: {
      email: ["The email field is required."],
      password: ["The password field is required."],
    },
  },
};

// Mock fetch function for API calls with better error handling
export const createMockFetch = (response: any, status = 200) => {
  const isSuccess = status >= 200 && status < 300;

  return vi.fn().mockResolvedValue({
    ok: isSuccess,
    status,
    statusText: isSuccess ? 'OK' : 'Error',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
    blob: vi.fn().mockResolvedValue(new Blob([JSON.stringify(response)])),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    clone: vi.fn().mockReturnThis(),
  });
};

// Import shared mock factories from setup
import { createMockRoute, createMockRouter } from './setup';

/**
 * Creates a mock authentication composable for testing
 * @param user - Mock user data (null for unauthenticated state)
 * @param loggedIn - Whether the user should appear logged in
 * @returns Mock auth composable with all required methods and state
 */
export const createMockAuth = (user: any = null, loggedIn = false) => ({
  user: ref(user),
  loggedIn: ref(loggedIn),
  isLoading: ref(false),
  error: ref(null),
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  refreshSession: vi.fn().mockResolvedValue(undefined),
  clearError: vi.fn(),
  hasRole: vi.fn((role: string) => user?.role === role),
  isAdministrator: vi.fn(() => user?.role === "administrator"),
  isReviewer: vi.fn(() => user?.role === "reviewer"),
  canManageUsers: vi.fn(() => user?.role === "administrator"),
  isReadOnly: vi.fn(() => user?.role === "reviewer"),
  getCurrentUser: vi.fn(() => user),
});

// Enhanced test wrapper with better type safety
export const createTestWrapper = <T extends Component>(
  component: T,
  options: any = {}
): VueWrapper<any> => {
  const pinia = createPinia();

  return mount(component, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: (key: string) => key,
        $router: createMockRouter(),
        $route: createMockRoute(),
      },
      stubs: {
        // Stub Nuxt components that might cause issues in tests
        NuxtLink: {
          template: '<a><slot /></a>',
          props: ['to'],
        },
        NuxtPage: {
          template: '<div><slot /></div>',
        },
        NuxtLayout: {
          template: '<div><slot /></div>',
        },
      },
    },
    ...options,
  });
};

// Helper functions for async testing
export const flushPromises = (): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, 0));

export const waitForNextTick = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 0));
};

/**
 * Creates a mock API composable for testing
 * @param overrides - Partial overrides for specific test scenarios
 * @returns Mock API composable with all HTTP methods and endpoints
 */
export const createMockApi = (overrides: any = {}) => ({
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
export const createMockToast = (overrides: any = {}) => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  ...overrides,
});

/**
 * Enhanced async helper with timeout support
 * @param condition - Function that returns true when condition is met
 * @param timeout - Maximum time to wait in milliseconds (default: 1000)
 * @param interval - Check interval in milliseconds (default: 10)
 * @throws Error if condition is not met within timeout
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 1000,
  interval = 10
): Promise<void> => {
  const startTime = Date.now();

  while (!condition() && Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`);
  }
};

// Test data generators
export const generateMockUsers = (count: number): MockUser[] => {
  const roles: UserRole[] = ["administrator", "reviewer"];

  return Array.from({ length: count }, (_, index) => {
    const role = roles[index % roles.length] as UserRole;
    const name = `User${index + 1}`;
    const lastName = `Last${index + 1}`;

    return {
      id: index + 1,
      name,
      last_name: lastName,
      email: `user${index + 1}@example.com`,
      role,
      full_name: `${name} ${lastName}`,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    };
  });
};

// Type definitions for testing
export interface MockUser extends User {
  full_name: string; // Additional computed property for testing
}

export interface MockApiResponse<T = any> {
  data?: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  message?: string;
  errors?: Record<string, string[]>;
}

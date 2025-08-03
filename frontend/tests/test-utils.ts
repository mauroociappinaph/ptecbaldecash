import { vi } from "vitest";

/**
 * Test utilities for the User Management System frontend
 */

// Mock user data for testing
export const mockUsers = {
  administrator: {
    id: 1,
    name: "Admin",
    last_name: "User",
    email: "admin@example.com",
    role: "administrator" as const,
    full_name: "Admin User",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  reviewer: {
    id: 2,
    name: "Reviewer",
    last_name: "User",
    email: "reviewer@example.com",
    role: "reviewer" as const,
    full_name: "Reviewer User",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
};

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

// Mock fetch function for API calls
export const createMockFetch = (response: any, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
  });
};

// Helper to create mock router
export const createMockRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: {
    value: {
      path: "/",
      name: "index",
      params: {},
      query: {},
    },
  },
});

// Helper to create mock auth composable
export const createMockAuth = (user: any = null, isAuthenticated = false) => ({
  user: ref(user),
  isAuthenticated: ref(isAuthenticated),
  login: vi.fn(),
  logout: vi.fn(),
  isAdministrator: computed(() => user?.role === "administrator"),
  isReviewer: computed(() => user?.role === "reviewer"),
});

// Type definitions for testing
export interface MockUser {
  id: number;
  name: string;
  last_name: string;
  email: string;
  role: "administrator" | "reviewer";
  full_name: string;
  created_at: string;
  updated_at: string;
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

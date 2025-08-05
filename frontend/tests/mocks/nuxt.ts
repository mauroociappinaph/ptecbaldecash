import { vi } from "vitest";

// Mock Nuxt runtime and composables
export const mockNuxtComposables = () => {
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
    return {
      ...actual,
      useUserSession: vi.fn(() => ({
        user: vi.fn(() => null),
        loggedIn: vi.fn(() => false),
        clear: vi.fn(),
        fetch: vi.fn(),
      })),
      setUserSession: vi.fn(),
      clearUserSession: vi.fn(),
    };
  });
};

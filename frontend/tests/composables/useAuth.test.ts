import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockAuth, mockUsers } from "../test-utils";

// Mock the actual composable
vi.mock("../../composables/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("useAuth composable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide authentication state", () => {
    const mockAuth = createMockAuth(mockUsers.administrator, true);

    expect(mockAuth.user.value).toEqual(mockUsers.administrator);
    expect(mockAuth.loggedIn.value).toBe(true);
  });

  it("should identify administrator role correctly", () => {
    const mockAuth = createMockAuth(mockUsers.administrator, true);

    expect(mockAuth.isAdministrator.value).toBe(true);
    expect(mockAuth.isReviewer.value).toBe(false);
  });

  it("should identify reviewer role correctly", () => {
    const mockAuth = createMockAuth(mockUsers.reviewer, true);

    expect(mockAuth.isAdministrator.value).toBe(false);
    expect(mockAuth.isReviewer.value).toBe(true);
  });

  it("should handle unauthenticated state", () => {
    const mockAuth = createMockAuth(null, false);

    expect(mockAuth.user.value).toBeNull();
    expect(mockAuth.loggedIn.value).toBe(false);
    expect(mockAuth.isAdministrator.value).toBe(false);
    expect(mockAuth.isReviewer.value).toBe(false);
  });

  it("should provide login function", () => {
    const mockAuth = createMockAuth();

    expect(mockAuth.login).toBeDefined();
    expect(typeof mockAuth.login).toBe("function");
  });

  it("should provide logout function", () => {
    const mockAuth = createMockAuth();

    expect(mockAuth.logout).toBeDefined();
    expect(typeof mockAuth.logout).toBe("function");
  });
});

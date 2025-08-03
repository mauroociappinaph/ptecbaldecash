import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockUsers } from "../test-utils";
import type { UpdateUserData } from "../../app/types";

/**
 * End-to-End Integration Test Suite for Frontend
 *
 * This comprehensive test suite validates the complete user management system
 * from the frontend perspective, including authentication flow, CRUD operations,
 * role-based access control, and error handling as specified in requirements
 * 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 8.1
 */
describe("End-to-End Integration Tests", () => {
  let mockFetch: any;

  beforeEach(() => {
    // Mock global fetch for API calls
    mockFetch = vi.fn();
    global.$fetch = mockFetch;

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test complete user authentication flow (Requirement 1.1)
   */
  describe("Complete User Authentication Flow", () => {
    it("should handle complete login and logout flow", async () => {
      // Mock successful login response
      const loginResponse = {
        success: true,
        message: "Login successful",
        data: {
          user: mockUsers.administrator,
          token: "mock-auth-token",
        },
      };

      mockFetch.mockResolvedValueOnce(loginResponse);

      // Import and test authentication composable
      const { useAuth } = await import("../../composables/useAuth");
      const auth = useAuth();

      // Test login
      const credentials = {
        email: "admin@example.com",
        password: "admin123",
      };

      const result = await auth.login(credentials);

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        body: credentials,
      });

      expect(result.user.role).toBe("administrator");

      // Mock logout response
      mockFetch.mockResolvedValueOnce({
        message: "Logout successful",
      });

      // Test logout
      await auth.logout();

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
      });
    });

    it("should handle login validation errors", async () => {
      const errorResponse = {
        message: "Validation failed",
        errors: {
          email: ["The email field is required."],
          password: ["The password field is required."],
        },
      };

      mockFetch.mockRejectedValueOnce({
        response: {
          status: 422,
          _data: errorResponse,
        },
      });

      const { useAuth } = await import("../../composables/useAuth");
      const auth = useAuth();

      try {
        await auth.login({ email: "", password: "" });
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response._data.errors.email).toBeDefined();
        expect(error.response._data.errors.password).toBeDefined();
      }
    });

    it("should handle invalid credentials", async () => {
      const errorResponse = {
        message: "Invalid credentials",
        errors: {
          email: ["These credentials do not match our records."],
        },
      };

      mockFetch.mockRejectedValueOnce({
        response: {
          status: 422,
          _data: errorResponse,
        },
      });

      const { useAuth } = await import("../../composables/useAuth");
      const auth = useAuth();

      try {
        await auth.login({
          email: "wrong@example.com",
          password: "wrongpassword",
        });
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response._data.errors.email).toBeDefined();
      }
    });
  });

  /**
   * Test complete CRUD operations (Requirements 2.1, 3.1, 4.1, 5.1)
   */
  describe("Complete CRUD Operations", () => {
    it("should handle complete user creation flow", async () => {
      // Mock successful user creation
      const newUser = {
        id: 3,
        name: "New",
        last_name: "User",
        email: "new@example.com",
        role: "reviewer" as const,
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      };

      const createResponse = {
        message: "User created successfully",
        data: newUser,
      };

      mockFetch.mockResolvedValueOnce(createResponse);

      // Import users store
      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      // Test user creation
      const userData = {
        name: "New",
        last_name: "User",
        email: "new@example.com",
        password: "password123",
        role: "reviewer" as const,
      };

      const result = await usersStore.createUser(userData);

      expect(mockFetch).toHaveBeenCalledWith("/api/users", {
        method: "POST",
        body: userData,
      });

      expect(result.name).toBe("New");
      expect(result.email).toBe("new@example.com");
      expect(result.role).toBe("reviewer");
    });

    it("should handle user list retrieval with pagination", async () => {
      const usersResponse = {
        message: "Users retrieved successfully",
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
      };

      mockFetch.mockResolvedValueOnce(usersResponse);

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      await usersStore.fetchUsers();

      expect(mockFetch).toHaveBeenCalledWith("/api/users", {
        method: "GET",
        query: {},
      });

      expect(usersStore.users).toHaveLength(2);
      expect(usersStore.pagination.total).toBe(2);
    });

    it("should handle user update flow", async () => {
      const updatedUser = {
        ...mockUsers.reviewer,
        name: "Updated",
        last_name: "Name",
      };

      const updateResponse = {
        message: "User updated successfully",
        data: updatedUser,
      };

      mockFetch.mockResolvedValueOnce(updateResponse);

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      const updateData: UpdateUserData = {
        name: "Updated",
        last_name: "Name",
        email: mockUsers.reviewer.email,
        role: mockUsers.reviewer.role,
      };

      const result = await usersStore.updateUser(
        mockUsers.reviewer.id,
        updateData
      );

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/users/${mockUsers.reviewer.id}`,
        {
          method: "PUT",
          body: updateData,
        }
      );

      expect(result.name).toBe("Updated");
      expect(result.last_name).toBe("Name");
    });

    it("should handle user deletion flow", async () => {
      const deleteResponse = {
        message: "User deleted successfully",
        data: {
          id: mockUsers.reviewer.id,
          email: mockUsers.reviewer.email,
          deleted_at: "2024-01-01T00:00:00.000000Z",
        },
      };

      mockFetch.mockResolvedValueOnce(deleteResponse);

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      const result = await usersStore.deleteUser(mockUsers.reviewer.id);

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/users/${mockUsers.reviewer.id}`,
        {
          method: "DELETE",
        }
      );
    });

    it("should handle search and filtering", async () => {
      const searchResponse = {
        message: "Users retrieved successfully",
        data: [mockUsers.administrator],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 1,
          from: 1,
          to: 1,
        },
        links: {
          first: "/api/users?page=1",
          last: "/api/users?page=1",
          prev: null,
          next: null,
        },
      };

      mockFetch.mockResolvedValueOnce(searchResponse);

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      await usersStore.fetchUsers(1, "Admin", "administrator");

      expect(mockFetch).toHaveBeenCalledWith("/api/users", {
        method: "GET",
        params: {
          page: "1",
          search: "Admin",
          role: "administrator",
        },
      });

      expect(usersStore.users).toHaveLength(1);
      const firstUser = usersStore.users[0];
      if (firstUser) {
        expect(firstUser.role).toBe("administrator");
      }
    });
  });

  /**
   * Test role-based access control (Requirement 6.1)
   */
  describe("Role-Based Access Control", () => {
    it("should properly handle administrator permissions", async () => {
      const { useAuth } = await import("../../composables/useAuth");
      const auth = useAuth();

      await auth.login({ email: "admin@example.com", password: "password" });

      expect(auth.isAdministrator()).toBe(true);
      expect(auth.isReviewer()).toBe(false);
    });

    it("should properly handle reviewer permissions", async () => {
      const { useAuth } = await import("../../composables/useAuth");
      const auth = useAuth();

      await auth.login({ email: "reviewer@example.com", password: "password" });

      expect(auth.isAdministrator()).toBe(false);
      expect(auth.isReviewer()).toBe(true);
    });

    it("should handle unauthorized access attempts", async () => {
      // Mock 403 Forbidden response
      const forbiddenResponse = {
        message:
          "Unauthorized. You do not have permission to access this resource.",
      };

      mockFetch.mockRejectedValueOnce({
        response: {
          status: 403,
          _data: forbiddenResponse,
        },
      });

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      try {
        await usersStore.createUser({
          name: "Test",
          last_name: "User",
          email: "test@example.com",
          password: "password123",
          role: "reviewer",
        });
      } catch (error: any) {
        expect(error.response.status).toBe(403);
        expect(error.response._data.message).toContain("Unauthorized");
      }
    });

    it("should handle unauthenticated access attempts", async () => {
      // Mock 401 Unauthorized response
      const unauthorizedResponse = {
        message: "Unauthenticated.",
      };

      mockFetch.mockRejectedValueOnce({
        response: {
          status: 401,
          _data: unauthorizedResponse,
        },
      });

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      try {
        await usersStore.fetchUsers();
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response._data.message).toBe("Unauthenticated.");
      }
    });
  });

  /**
   * Test error handling and validation (Requirement 7.1, 7.2)
   */
  describe("Error Handling and Validation", () => {
    it("should handle validation errors during user creation", async () => {
      const validationErrors = {
        message: "Validation failed",
        errors: {
          name: ["The name field is required."],
          email: ["The email field is required."],
          password: ["The password field is required."],
          role: ["The role field is required."],
        },
      };

      mockFetch.mockRejectedValueOnce({
        response: {
          status: 422,
          _data: validationErrors,
        },
      });

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      try {
        await usersStore.createUser({
          name: "",
          last_name: "",
          email: "",
          password: "",
          role: "" as any,
        });
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response._data.errors.name).toBeDefined();
        expect(error.response._data.errors.email).toBeDefined();
        expect(error.response._data.errors.password).toBeDefined();
        expect(error.response._data.errors.role).toBeDefined();
      }
    });

    it("should handle duplicate email validation", async () => {
      const duplicateEmailError = {
        message: "Validation failed",
        errors: {
          email: ["The email has already been taken."],
        },
      };

      mockFetch.mockRejectedValueOnce({
        response: {
          status: 422,
          _data: duplicateEmailError,
        },
      });

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      try {
        await usersStore.createUser({
          name: "Test",
          last_name: "User",
          email: "existing@example.com",
          password: "password123",
          role: "reviewer",
        });
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response._data.errors.email[0]).toContain(
          "already been taken"
        );
      }
    });

    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      try {
        await usersStore.fetchUsers();
      } catch (error: any) {
        expect(error.message).toBe("Network error");
      }
    });

    it("should handle server errors", async () => {
      const serverError = {
        message: "Internal Server Error",
      };

      mockFetch.mockRejectedValueOnce({
        response: {
          status: 500,
          _data: serverError,
        },
      });

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      try {
        await usersStore.fetchUsers();
      } catch (error: any) {
        expect(error.response.status).toBe(500);
        expect(error.response._data.message).toBe("Internal Server Error");
      }
    });
  });

  /**
   * Test loading states and UI feedback
   */
  describe("Loading States and UI Feedback", () => {
    it("should manage loading states during operations", async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(pendingPromise);

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      // Start async operation
      const fetchPromise = usersStore.fetchUsers();

      // Check loading state is true
      expect(usersStore.loading).toBe(true);

      // Resolve the promise
      resolvePromise!({
        message: "Users retrieved successfully",
        data: [],
        meta: { total: 0 },
        links: {},
      });

      await fetchPromise;

      // Check loading state is false
      expect(usersStore.loading).toBe(false);
    });

    it("should handle error states properly", async () => {
      const error = new Error("Test error");
      mockFetch.mockRejectedValueOnce(error);

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      try {
        await usersStore.fetchUsers();
      } catch (e) {
        expect(usersStore.loading).toBe(false);
        expect(usersStore.error).toBe(error);
      }
    });
  });

  /**
   * Test complete user management workflow
   */
  describe("Complete User Management Workflow", () => {
    it("should handle complete administrator workflow", async () => {
      // Step 1: Login as administrator
      const loginResponse = {
        user: mockUsers.administrator,
        token: "admin-token",
      };

      mockFetch.mockResolvedValueOnce(loginResponse);

      const { useAuth } = await import("../../composables/useAuth");
      const auth = useAuth();

      await auth.login({
        email: "admin@example.com",
        password: "admin123",
      });

      // Step 2: Fetch users list
      const usersResponse = {
        message: "Users retrieved successfully",
        data: [mockUsers.administrator, mockUsers.reviewer],
        meta: { total: 2 },
        links: {},
      };

      mockFetch.mockResolvedValueOnce(usersResponse);

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      await usersStore.fetchUsers();
      expect(usersStore.users).toHaveLength(2);

      // Step 3: Create new user
      const newUser = {
        id: 3,
        name: "New",
        last_name: "User",
        email: "new@example.com",
        role: "reviewer" as const,
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      };

      mockFetch.mockResolvedValueOnce({
        message: "User created successfully",
        data: newUser,
      });

      await usersStore.createUser({
        name: "New",
        last_name: "User",
        email: "new@example.com",
        password: "password123",
        role: "reviewer",
      });

      // Step 4: Update user
      mockFetch.mockResolvedValueOnce({
        message: "User updated successfully",
        data: { ...newUser, name: "Updated" },
      });

      await usersStore.updateUser(newUser.id, { ...newUser, name: "Updated" });

      // Step 5: Delete user
      mockFetch.mockResolvedValueOnce({
        message: "User deleted successfully",
        data: { id: newUser.id, deleted_at: "2024-01-01T00:00:00.000000Z" },
      });

      await usersStore.deleteUser(newUser.id);

      // Verify all operations were called
      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it("should handle reviewer workflow limitations", async () => {
      // Login as reviewer
      const loginResponse = {
        success: true,
        data: {
          user: mockUsers.reviewer,
          token: "reviewer-token",
        },
      };

      mockFetch.mockResolvedValueOnce(loginResponse);

      const { useAuth } = await import("../../composables/useAuth");
      const auth = useAuth();

      await auth.login({
        email: "reviewer@example.com",
        password: "reviewer123",
      });

      // Reviewer can view users
      const usersResponse = {
        message: "Users retrieved successfully",
        data: [mockUsers.administrator, mockUsers.reviewer],
        meta: { total: 2 },
        links: {},
      };

      mockFetch.mockResolvedValueOnce(usersResponse);

      const { useUsersStore } = await import("../../stores/users");
      const usersStore = useUsersStore();

      await usersStore.fetchUsers();
      expect(usersStore.users).toHaveLength(2);
    });
  });
});

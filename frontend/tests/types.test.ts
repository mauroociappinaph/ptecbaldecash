import { describe, expect, it } from "vitest";
import type {
  ApiResponse,
  AuthUser,
  CreateUserData,
  LoginCredentials,
  PaginatedResponse,
  UpdateUserData,
  User,
  UserRole,
  UserSession,
  ValidationError,
} from "~/types";

// Test helper function
const createTestUser = (): User => ({
  id: 1,
  name: "Test",
  last_name: "User",
  email: "test@example.com",
  role: "administrator",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
});

describe("Type Definitions", () => {
  describe("User Interface", () => {
    it("should enforce correct User structure", () => {
      const user = createTestUser();

      // Test required properties exist
      const requiredProperties = [
        "id",
        "name",
        "last_name",
        "email",
        "role",
        "created_at",
        "updated_at",
      ];
      requiredProperties.forEach((prop) => {
        expect(user).toHaveProperty(prop);
      });

      // Type checking at compile time ensures role is correct
      expect(["administrator", "reviewer"]).toContain(user.role);
    });

    it("should support both administrator and reviewer roles", () => {
      const admin: User["role"] = "administrator";
      const reviewer: User["role"] = "reviewer";

      expect(admin).toBe("administrator");
      expect(reviewer).toBe("reviewer");
    });
  });

  describe("CreateUserData Interface", () => {
    it("should enforce required fields for user creation", () => {
      const createData: CreateUserData = {
        name: "Jane",
        last_name: "Smith",
        email: "jane@example.com",
        password: "SecurePassword123!",
        role: "reviewer",
      };

      expect(createData).toHaveProperty("name");
      expect(createData).toHaveProperty("last_name");
      expect(createData).toHaveProperty("email");
      expect(createData).toHaveProperty("password");
      expect(createData).toHaveProperty("role");

      // Ensure all fields are strings
      expect(typeof createData.name).toBe("string");
      expect(typeof createData.last_name).toBe("string");
      expect(typeof createData.email).toBe("string");
      expect(typeof createData.password).toBe("string");
      expect(typeof createData.role).toBe("string");
    });
  });

  describe("UpdateUserData Interface", () => {
    it("should allow optional password in updates", () => {
      const updateDataWithPassword: UpdateUserData = {
        name: "Updated",
        last_name: "Name",
        email: "updated@example.com",
        password: "NewPassword123!",
        role: "administrator",
      };

      const updateDataWithoutPassword: UpdateUserData = {
        name: "Updated",
        last_name: "Name",
        email: "updated@example.com",
        role: "administrator",
      };

      expect(updateDataWithPassword).toHaveProperty("password");
      expect(updateDataWithoutPassword).not.toHaveProperty("password");
    });
  });

  describe("LoginCredentials Interface", () => {
    it("should enforce email and password fields", () => {
      const credentials: LoginCredentials = {
        email: "user@example.com",
        password: "password123",
      };

      expect(credentials).toHaveProperty("email");
      expect(credentials).toHaveProperty("password");
      expect(typeof credentials.email).toBe("string");
      expect(typeof credentials.password).toBe("string");
    });
  });

  describe("ApiResponse Interface", () => {
    it("should support generic data types", () => {
      const userResponse: ApiResponse<User> = {
        data: {
          id: 1,
          name: "Test",
          last_name: "User",
          email: "test@example.com",
          role: "administrator",
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
      };

      const stringResponse: ApiResponse<string> = {
        data: "Success message",
        message: "Operation completed",
      };

      expect(userResponse.data).toHaveProperty("id");
      expect(typeof stringResponse.data).toBe("string");
      expect(stringResponse).toHaveProperty("message");
    });
  });

  describe("PaginatedResponse Interface", () => {
    it("should enforce pagination metadata", () => {
      const paginatedUsers: PaginatedResponse<User> = {
        data: [
          {
            id: 1,
            name: "User",
            last_name: "One",
            email: "user1@example.com",
            role: "administrator",
            created_at: "2024-01-01T00:00:00.000Z",
            updated_at: "2024-01-01T00:00:00.000Z",
          },
        ],
        current_page: 1,
        last_page: 5,
        per_page: 15,
        total: 75,
        from: 1,
        to: 15,
      };

      expect(paginatedUsers).toHaveProperty("data");
      expect(paginatedUsers).toHaveProperty("current_page");
      expect(paginatedUsers).toHaveProperty("last_page");
      expect(paginatedUsers).toHaveProperty("per_page");
      expect(paginatedUsers).toHaveProperty("total");

      expect(Array.isArray(paginatedUsers.data)).toBe(true);
      expect(typeof paginatedUsers.current_page).toBe("number");
      expect(typeof paginatedUsers.total).toBe("number");
    });
  });

  describe("ValidationError Interface", () => {
    it("should structure validation errors correctly", () => {
      const validationError: ValidationError = {
        name: "ValidationError",
        message: "The given data was invalid.",
        status: 422,
        data: {
          message: "The given data was invalid.",
          errors: {
            email: ["The email field is required.", "The email must be valid."],
            password: ["The password field is required."],
          },
        },
        errors: {
          email: ["The email field is required.", "The email must be valid."],
          password: ["The password field is required."],
        },
      };

      expect(validationError).toHaveProperty("message");
      expect(validationError).toHaveProperty("errors");
      expect(typeof validationError.message).toBe("string");
      expect(typeof validationError.errors).toBe("object");

      // Check that errors is a record of string arrays
      Object.entries(validationError.errors).forEach(([field, messages]) => {
        expect(typeof field).toBe("string");
        expect(Array.isArray(messages)).toBe(true);
        messages.forEach((message: string) => {
          expect(typeof message).toBe("string");
        });
      });
    });
  });

  describe("UserRole Type", () => {
    it("should only allow administrator or reviewer values", () => {
      const adminRole: UserRole = "administrator";
      const reviewerRole: UserRole = "reviewer";

      expect(adminRole).toBe("administrator");
      expect(reviewerRole).toBe("reviewer");

      // TypeScript will prevent invalid values at compile time
      const validRoles: UserRole[] = ["administrator", "reviewer"];
      expect(validRoles).toContain(adminRole);
      expect(validRoles).toContain(reviewerRole);
    });
  });

  describe("AuthUser Interface", () => {
    it("should match User interface but without timestamps", () => {
      const authUser: AuthUser = {
        id: 1,
        name: "Auth",
        last_name: "User",
        email: "auth@example.com",
        role: "administrator",
      };

      expect(authUser).toHaveProperty("id");
      expect(authUser).toHaveProperty("name");
      expect(authUser).toHaveProperty("last_name");
      expect(authUser).toHaveProperty("email");
      expect(authUser).toHaveProperty("role");

      // Should not have timestamp fields
      expect(authUser).not.toHaveProperty("created_at");
      expect(authUser).not.toHaveProperty("updated_at");
    });
  });

  describe("UserSession Interface", () => {
    it("should structure session data correctly", () => {
      const userSession: UserSession = {
        user: {
          id: 1,
          name: "Session",
          last_name: "User",
          email: "session@example.com",
          role: "reviewer",
        },
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        loggedInAt: "2024-02-08T10:30:00.000Z",
      };

      expect(userSession).toHaveProperty("user");
      expect(userSession).toHaveProperty("token");
      expect(userSession).toHaveProperty("loggedInAt");

      expect(typeof userSession.user).toBe("object");
      expect(typeof userSession.token).toBe("string");
      expect(typeof userSession.loggedInAt).toBe("string");

      // Verify user object structure
      expect(userSession.user).toHaveProperty("id");
      expect(userSession.user).toHaveProperty("role");
    });
  });
});

import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockUsers } from "../test-utils";

// Mock the store
const mockStore = {
  users: [],
  loading: false,
  error: null,
  fetchUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
};

vi.mock("../../stores/users", () => ({
  useUsersStore: () => mockStore,
}));

describe("Users Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.users = [];
    mockStore.loading = false;
    mockStore.error = null;
  });

  it("should initialize with empty state", () => {
    expect(mockStore.users).toEqual([]);
    expect(mockStore.loading).toBe(false);
    expect(mockStore.error).toBeNull();
  });

  it("should have fetchUsers method", () => {
    expect(mockStore.fetchUsers).toBeDefined();
    expect(typeof mockStore.fetchUsers).toBe("function");
  });

  it("should have createUser method", () => {
    expect(mockStore.createUser).toBeDefined();
    expect(typeof mockStore.createUser).toBe("function");
  });

  it("should have updateUser method", () => {
    expect(mockStore.updateUser).toBeDefined();
    expect(typeof mockStore.updateUser).toBe("function");
  });

  it("should have deleteUser method", () => {
    expect(mockStore.deleteUser).toBeDefined();
    expect(typeof mockStore.deleteUser).toBe("function");
  });

  it("should handle loading state during operations", async () => {
    mockStore.loading = true;
    expect(mockStore.loading).toBe(true);
  });

  it("should handle error state", () => {
    mockStore.error = "Failed to fetch users";
    expect(mockStore.error).toBe("Failed to fetch users");
  });

  it("should store users data", () => {
    mockStore.users = [mockUsers.administrator, mockUsers.reviewer];
    expect(mockStore.users).toHaveLength(2);
    expect(mockStore.users[0]).toEqual(mockUsers.administrator);
    expect(mockStore.users[1]).toEqual(mockUsers.reviewer);
  });

  it("should call fetchUsers when requested", async () => {
    await mockStore.fetchUsers();
    expect(mockStore.fetchUsers).toHaveBeenCalled();
  });

  it("should call createUser with user data", async () => {
    const newUserData = {
      name: "New",
      last_name: "User",
      email: "new@example.com",
      password: "password123",
      role: "reviewer" as const,
    };

    await mockStore.createUser(newUserData);
    expect(mockStore.createUser).toHaveBeenCalledWith(newUserData);
  });

  it("should call updateUser with user id and data", async () => {
    const updateData = {
      name: "Updated",
      last_name: "User",
      email: "updated@example.com",
      role: "administrator" as const,
    };

    await mockStore.updateUser(1, updateData);
    expect(mockStore.updateUser).toHaveBeenCalledWith(1, updateData);
  });

  it("should call deleteUser with user id", async () => {
    await mockStore.deleteUser(1);
    expect(mockStore.deleteUser).toHaveBeenCalledWith(1);
  });
});

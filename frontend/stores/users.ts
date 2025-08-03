/**
 * User management store using Pinia
 * Centralized state management for user CRUD operations
 */
import { defineStore } from "pinia";
import type {
  CreateUserData,
  UpdateUserData,
  User,
  UserListResponse,
  UserRole,
} from "../types/index";

interface UserState {
  users: User[];
  currentUser: User | null;
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: string | null;
}

export const useUsersStore = defineStore("users", {
  state: (): UserState => ({
    users: [],
    currentUser: null,
    pagination: {
      currentPage: 1,
      lastPage: 1,
      perPage: 15,
      total: 0,
    },
    loading: {
      list: false,
      create: false,
      update: false,
      delete: false,
    },
    error: null,
  }),

  getters: {
    /**
     * Get users filtered by role
     */
    usersByRole:
      (state) =>
      (role: UserRole): User[] => {
        return state.users.filter((user: User) => user.role === role);
      },

    /**
     * Get total number of administrators
     */
    administratorCount: (state): number => {
      return state.users.filter((user: User) => user.role === "administrator")
        .length;
    },

    /**
     * Get total number of reviewers
     */
    reviewerCount: (state): number => {
      return state.users.filter((user: User) => user.role === "reviewer")
        .length;
    },

    /**
     * Check if any operation is loading
     */
    isAnyLoading: (state): boolean => {
      return Object.values(state.loading).some((loading) => loading);
    },
  },

  actions: {
    /**
     * Clear error state
     */
    clearError() {
      this.error = null;
    },

    /**
     * Fetch users with pagination and filtering
     */
    async fetchUsers(page: number = 1, search?: string, role?: string) {
      this.loading.list = true;
      this.clearError();

      try {
        const { get } = useApi();
        const params = new URLSearchParams({
          page: page.toString(),
          ...(search && { search }),
          ...(role && { role }),
        });

        const response = await get<UserListResponse>(`/users?${params}`);

        this.users = response.data;
        this.pagination = {
          currentPage: response.current_page,
          lastPage: response.last_page,
          perPage: response.per_page,
          total: response.total,
        };
      } catch (error: any) {
        this.error = "Failed to fetch users";
        console.error("Fetch users error:", error);
      } finally {
        this.loading.list = false;
      }
    },

    /**
     * Create a new user
     */
    async createUser(userData: CreateUserData) {
      this.loading.create = true;
      this.clearError();

      try {
        const { post } = useApi();
        const response = await post<{ data: User }>("/users", userData);

        // Add new user to the list
        this.users.unshift(response.data);
        this.pagination.total += 1;

        return response.data;
      } catch (error: any) {
        this.error = "Failed to create user";
        throw error;
      } finally {
        this.loading.create = false;
      }
    },

    /**
     * Update an existing user
     */
    async updateUser(userId: number, userData: UpdateUserData) {
      this.loading.update = true;
      this.clearError();

      try {
        const { put } = useApi();
        const response = await put<{ data: User }>(
          `/users/${userId}`,
          userData
        );

        // Update user in the list
        const index = this.users.findIndex((user: User) => user.id === userId);
        if (index !== -1) {
          this.users[index] = response.data;
        }

        return response.data;
      } catch (error: any) {
        this.error = "Failed to update user";
        throw error;
      } finally {
        this.loading.update = false;
      }
    },

    /**
     * Delete a user (soft delete)
     */
    async deleteUser(userId: number) {
      this.loading.delete = true;
      this.clearError();

      try {
        const { del } = useApi();
        await del(`/users/${userId}`);

        // Remove user from the list
        this.users = this.users.filter((user: User) => user.id !== userId);
        this.pagination.total -= 1;
      } catch (error: any) {
        this.error = "Failed to delete user";
        throw error;
      } finally {
        this.loading.delete = false;
      }
    },

    /**
     * Set current user for editing
     */
    setCurrentUser(user: User | null) {
      this.currentUser = user;
    },
  },
});

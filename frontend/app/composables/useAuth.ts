/**
 * Authentication composable using Nuxt Auth Utils
 * Provides authentication state management and API integration
 */
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  UserRole,
} from "../types/index";

export const useAuth = () => {
  const {
    user: userSession,
    loggedIn,
    clear,
    fetch: refresh,
  } = useUserSession();

  const user = computed(() => userSession.value as AuthUser | null);

  // Loading state for async operations
  const isLoading = ref(false);

  // Error state for better error handling
  const error = ref<string | null>(null);

  // Clear error when starting new operations
  const clearError = () => {
    error.value = null;
  };

  /**
   * Login user with credentials
   * @param credentials - User login credentials (email and password)
   * @returns Promise resolving to user data and token
   */
  const login = async (
    credentials: LoginCredentials
  ): Promise<LoginResponse> => {
    isLoading.value = true;
    clearError();

    try {
      // Use the server API which handles session setting
      const response = await $fetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: credentials,
      });

      // Refresh the user session to get the updated data
      await refresh();

      return response;
    } catch (err: any) {
      console.error("Login error:", err);

      // Handle specific authentication errors with better error messages
      const errorMessage = getErrorMessage(err);
      error.value = errorMessage;

      // Re-throw the original error to preserve context for components
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Extract user-friendly error message from API error
   * @param err - The error object from API
   * @returns User-friendly error message
   */
  const getErrorMessage = (err: any): string => {
    if (err.status === 401) {
      return "Invalid email or password";
    }

    if (err.status === 422) {
      // Handle validation errors specifically
      if (err.data?.errors) {
        const errorValues = Object.values(err.data.errors) as string[][];
        const firstError = errorValues[0]?.[0];
        return firstError || "Please check your input and try again";
      }
      return "Please check your input and try again";
    }

    if (err.status === 429) {
      return "Too many login attempts. Please try again later";
    }

    if (err.status >= 500) {
      return "Server error. Please try again later";
    }

    return "Login failed. Please try again";
  };

  /**
   * Logout user and clear session
   * @param redirect - Whether to redirect to login page after logout (default: true)
   * @returns Promise that resolves when logout is complete
   */
  const logout = async (redirect: boolean = true) => {
    isLoading.value = true;
    try {
      // Use the server API for logout
      await $fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Don't throw error - we still want to clear local session
    } finally {
      // Always clear local session
      await clear();

      // Optional redirect for flexibility
      if (redirect) {
        await navigateTo("/login");
      }

      isLoading.value = false;
    }
  };

  /**
   * Check if user has specific role
   * @param role - The role to check against
   * @returns boolean indicating if user has the specified role
   */
  const hasRole = (role: UserRole): boolean => {
    return user.value ? user.value.role === role : false;
  };

  /**
   * Check if user is administrator
   * @returns boolean indicating if current user has administrator role
   */
  const isAdministrator = (): boolean => {
    return hasRole("administrator");
  };

  /**
   * Check if user is reviewer
   * @returns boolean indicating if current user has reviewer role
   */
  const isReviewer = (): boolean => {
    return hasRole("reviewer");
  };

  /**
   * Get current user data
   * @returns Current authenticated user or null if not logged in
   */
  const getCurrentUser = (): AuthUser | null => {
    return user.value;
  };

  /**
   * Check if user can perform administrative actions
   * @returns boolean indicating if user has permission for admin actions
   */
  const canManageUsers = (): boolean => {
    return isAdministrator();
  };

  /**
   * Check if user can only view data (read-only access)
   * @returns boolean indicating if user has only read access
   */
  const isReadOnly = (): boolean => {
    return isReviewer();
  };

  /**
   * Refresh user session from server
   * @returns Promise that resolves when session is refreshed
   */
  const refreshSession = async (): Promise<void> => {
    try {
      await refresh();
    } catch (error) {
      console.error("Session refresh error:", error);
      await clear();
    }
  };

  return {
    // State
    user,
    loggedIn: readonly(loggedIn),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Actions
    login,
    logout,
    refreshSession,
    clearError,

    // Role Utilities
    hasRole,
    isAdministrator,
    isReviewer,
    canManageUsers,
    isReadOnly,

    // Data Utilities
    getCurrentUser,
  };
};

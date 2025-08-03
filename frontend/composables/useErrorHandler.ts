/**
 * Centralized error handling composable
 * Provides consistent error handling across the application
 */

import type { ApiError } from "~/types";
import { useToast } from "./useToast";

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  redirectOnAuth?: boolean;
  toastTitle?: string;
  toastPersistent?: boolean;
}

export const useErrorHandler = () => {
  /**
   * Format error message for user display
   */
  const formatErrorMessage = (error: ApiError): string => {
    // Handle validation errors with better type safety
    if (
      error.status === 422 &&
      error.data &&
      typeof error.data === "object" &&
      "errors" in error.data
    ) {
      const validationData = error.data as { errors: Record<string, string[]> };
      const errorValues = Object.values(validationData.errors);
      const firstError = errorValues[0]?.[0];
      return firstError || "Validation failed";
    }

    // Handle specific HTTP status codes using constants
    switch (error.status) {
      case 401:
        return "Please log in to continue";
      case 403:
        return "You don't have permission to perform this action";
      case 404:
        return "The requested resource was not found";
      case 429:
        return "Too many requests. Please try again later";
      case 500:
        return "An internal server error occurred. Please try again later";
      case 0:
        return "Network error. Please check your connection";
      default:
        return error.message || "An unexpected error occurred";
    }
  };

  /**
   * Handle API errors with consistent behavior
   */
  const handleError = async (
    error: ApiError,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      redirectOnAuth = true,
      toastTitle,
      toastPersistent,
    } = options;

    // Log error for debugging
    if (logError) {
      console.error("Error handled:", error);
    }

    // Create error result with computed properties
    const isValidationError = error.status === 422;
    const isAuthError = error.status === 401 || error.status === 403;
    const isNetworkError = error.status === 0;

    const errorResult = {
      message: formatErrorMessage(error),
      status: error.status,
      isValidationError,
      isAuthError,
      isNetworkError,
      validationErrors:
        isValidationError && error.data ? (error.data as any).errors || {} : {},
    };

    // Handle authentication errors
    if (error.status === 401 && redirectOnAuth) {
      try {
        const { clear } = useUserSession();
        await clear();

        if (error.shouldRedirect) {
          await navigateTo(error.shouldRedirect);
        } else {
          await navigateTo("/login");
        }
      } catch (sessionError) {
        console.warn("Failed to clear session:", sessionError);
      }
    }

    // Show user-friendly error message via toast
    if (showToast && !errorResult.isValidationError) {
      const { error: showErrorToast } = useToast();

      showErrorToast(errorResult.message, {
        title: toastTitle || getErrorTitle(error.status),
        persistent:
          toastPersistent ?? (error.status >= 500 || error.status === 0),
      });
    }

    return errorResult;
  };

  /**
   * Get appropriate error title based on status code
   */
  const getErrorTitle = (status: number): string => {
    switch (status) {
      case 401:
        return "Authentication Required";
      case 403:
        return "Access Denied";
      case 404:
        return "Not Found";
      case 422:
        return "Validation Error";
      case 429:
        return "Rate Limited";
      case 500:
        return "Server Error";
      case 0:
        return "Network Error";
      default:
        return "Error";
    }
  };

  /**
   * Create a standardized error from unknown error types
   */
  const createStandardError = (error: unknown): ApiError => {
    if (error && typeof error === "object" && "status" in error) {
      return error as ApiError;
    }

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        status: 0,
        data: null,
        originalError: error,
      } as ApiError;
    }

    return {
      name: "UnknownError",
      message: "An unknown error occurred",
      status: 0,
      data: null,
      originalError: error,
    } as ApiError;
  };

  /**
   * Wrapper for async operations with error handling
   */
  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    options?: ErrorHandlerOptions
  ): Promise<{ data: T | null; error: ApiError | null }> => {
    try {
      const data = await operation();
      return { data, error: null };
    } catch (error) {
      const standardError = createStandardError(error);
      await handleError(standardError, options);
      return { data: null, error: standardError };
    }
  };

  /**
   * Handle form validation errors specifically
   */
  const handleValidationError = (error: ApiError) => {
    if (error.status === 422 && error.data) {
      const validationData = error.data as { errors: Record<string, string[]> };
      return validationData.errors || {};
    }
    return {};
  };

  /**
   * Show success message via toast
   */
  const showSuccess = (message: string, title?: string) => {
    const { success } = useToast();
    success(message, { title });
  };

  /**
   * Show warning message via toast
   */
  const showWarning = (message: string, title?: string) => {
    const { warning } = useToast();
    warning(message, { title });
  };

  /**
   * Show info message via toast
   */
  const showInfo = (message: string, title?: string) => {
    const { info } = useToast();
    info(message, { title });
  };

  return {
    handleError,
    formatErrorMessage,
    createStandardError,
    withErrorHandling,
    handleValidationError,
    showSuccess,
    showWarning,
    showInfo,
    getErrorTitle,
  };
};

/**
 * Form-specific error handling composable
 * Integrates form validation with the global error handling system
 */

import { computed, reactive, readonly } from "vue";
import type { ApiError } from "~/types";
import { HTTP_STATUS } from "~/types";
import { useToast } from "./useToast";

interface FormErrorState {
  errors: Record<string, string[]>;
  generalError: string | null;
  loading: boolean;
}

export const useFormErrorHandler = () => {
  // Form error state
  const formState = reactive<FormErrorState>({
    errors: {},
    generalError: null,
    loading: false,
  });

  // Clear all errors
  const clearErrors = () => {
    formState.errors = {};
    formState.generalError = null;
  };

  // Clear specific field error
  const clearFieldError = (fieldName: string) => {
    if (formState.errors[fieldName]) {
      delete formState.errors[fieldName];
    }
  };

  // Set loading state
  const setLoading = (loading: boolean) => {
    formState.loading = loading;
  };

  // Create a standardized error from unknown error types
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

  // Extract validation errors from API error
  const extractValidationErrors = (
    error: ApiError
  ): Record<string, string[]> => {
    if (error.status === HTTP_STATUS.UNPROCESSABLE_ENTITY && error.data) {
      const validationData = error.data as { errors: Record<string, string[]> };
      return validationData.errors || {};
    }
    return {};
  };

  // Format error message for user display
  const formatErrorMessage = (error: ApiError): string => {
    switch (error.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return "Please log in to continue";
      case HTTP_STATUS.FORBIDDEN:
        return "You don't have permission to perform this action";
      case HTTP_STATUS.NOT_FOUND:
        return "The requested resource was not found";
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return "Too many requests. Please try again later";
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return "An internal server error occurred. Please try again later";
      case 0:
        return "Network error. Please check your connection";
      default:
        return error.message || "An unexpected error occurred";
    }
  };

  // Get appropriate error title based on status code
  const getErrorTitle = (status: number): string => {
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return "Authentication Required";
      case HTTP_STATUS.FORBIDDEN:
        return "Access Denied";
      case HTTP_STATUS.NOT_FOUND:
        return "Not Found";
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        return "Validation Error";
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return "Rate Limited";
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return "Server Error";
      case 0:
        return "Network Error";
      default:
        return "Error";
    }
  };

  // Handle form submission with error handling
  const handleFormSubmit = async <T>(
    submitFn: () => Promise<T>,
    options: {
      successMessage?: string;
      successTitle?: string;
      clearOnSuccess?: boolean;
      showSuccessToast?: boolean;
    } = {}
  ): Promise<{ success: boolean; data?: T; error?: ApiError }> => {
    const {
      successMessage,
      successTitle,
      clearOnSuccess = true,
      showSuccessToast = true,
    } = options;

    // Clear previous errors and set loading
    clearErrors();
    setLoading(true);

    try {
      const result = await submitFn();

      // Show success message using toast directly
      if (showSuccessToast && successMessage) {
        const { success } = useToast();
        success(successMessage, { title: successTitle });
      }

      // Clear form if requested
      if (clearOnSuccess) {
        clearErrors();
      }

      return { success: true, data: result };
    } catch (error: any) {
      const standardError = createStandardError(error);

      // Handle validation errors directly
      if (standardError.status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        formState.errors = extractValidationErrors(standardError);
        formState.generalError = null;
      } else {
        formState.generalError = formatErrorMessage(standardError);
        formState.errors = {};

        // Show error toast for non-validation errors
        const { error: showErrorToast } = useToast();
        showErrorToast(formState.generalError, {
          title: getErrorTitle(standardError.status),
        });
      }

      return { success: false, error: standardError };
    } finally {
      setLoading(false);
    }
  };

  // Handle API errors specifically for forms
  const handleApiError = async (error: ApiError) => {
    if (error.status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
      // Validation errors - don't show toast, just set form errors
      formState.errors = extractValidationErrors(error);
      formState.generalError = null;
    } else {
      // Other errors - set general error and show toast
      formState.generalError = formatErrorMessage(error);
      formState.errors = {};

      const { error: showErrorToast } = useToast();
      showErrorToast(formState.generalError, {
        title: getErrorTitle(error.status),
      });
    }
  };

  // Get field error
  const getFieldError = (fieldName: string): string[] => {
    return formState.errors[fieldName] || [];
  };

  // Check if field has error
  const hasFieldError = (fieldName: string): boolean => {
    return !!(
      formState.errors[fieldName] && formState.errors[fieldName].length > 0
    );
  };

  // Get first field error
  const getFirstFieldError = (fieldName: string): string | null => {
    const errors = getFieldError(fieldName);
    return errors.length > 0 ? errors[0] || null : null;
  };

  // Check if form has any errors
  const hasErrors = computed(() => {
    return Object.keys(formState.errors).length > 0 || !!formState.generalError;
  });

  // Get all errors as a flat array
  const getAllErrors = computed(() => {
    const allErrors: string[] = [];

    if (formState.generalError) {
      allErrors.push(formState.generalError);
    }

    Object.values(formState.errors).forEach((fieldErrors) => {
      allErrors.push(...fieldErrors);
    });

    return allErrors;
  });

  return {
    // State
    formState: readonly(formState),
    hasErrors,
    getAllErrors,

    // Methods
    clearErrors,
    clearFieldError,
    setLoading,
    handleFormSubmit,
    handleApiError,
    getFieldError,
    hasFieldError,
    getFirstFieldError,
  };
};

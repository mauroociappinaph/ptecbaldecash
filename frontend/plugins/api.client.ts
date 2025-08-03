import { useErrorHandler } from "../composables/useErrorHandler";

/**
 * Client-side API configuration plugin
 * Sets up global request/response interceptors and error handling
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  // Configure global $fetch defaults
  $fetch.create({
    baseURL: apiBase,
    credentials: "include",

    // Request interceptor
    onRequest({ request, options }) {
      // Add default headers
      const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      // Merge existing headers if they exist
      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => {
            headers[key] = value;
          });
        } else if (Array.isArray(options.headers)) {
          // Handle array format
          (options.headers as [string, string][]).forEach(([key, value]) => {
            headers[key] = value;
          });
        } else if (typeof options.headers === "object") {
          Object.assign(headers, options.headers);
        }
      }

      // Add CSRF token for state-changing requests
      const method = options.method?.toUpperCase();
      if (method && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        const { getCsrfToken } = useCsrf();
        const csrfToken = getCsrfToken();

        if (csrfToken) {
          headers["X-CSRF-TOKEN"] = csrfToken;
          headers["X-Requested-With"] = "XMLHttpRequest";
        }
      }

      options.headers = headers as any;
      console.log(`[API] ${method || "GET"} ${request}`);
    },

    // Response interceptor
    onResponse({ response }) {
      console.log(`[API] Response ${response.status} ${response.url}`);
    },

    // Error interceptor
    onResponseError({ response, request }) {
      console.error(`[API] Error ${response.status} ${request}`);

      // Create standardized error object
      const apiError = {
        name: "ApiError",
        message:
          response._data?.message || response.statusText || "An error occurred",
        status: response.status,
        data: response._data,
        originalError: response,
      };

      // Handle different error types
      if (response.status === 401) {
        // Authentication errors - handle via error handler
        const { handleError } = useErrorHandler();
        handleError(apiError, {
          showToast: false, // Don't show toast for auth errors, redirect instead
          redirectOnAuth: true,
        });
      } else if (response.status === 403) {
        // Authorization errors
        const { handleError } = useErrorHandler();
        handleError(apiError, { showToast: true });
      } else if (response.status === 422) {
        // Validation errors - let components handle these
        console.log("Validation error:", response._data);
      } else if (response.status >= 500) {
        // Server errors
        const { handleError } = useErrorHandler();
        handleError(apiError, {
          showToast: true,
          toastPersistent: true,
        });
      } else if (response.status === 0) {
        // Network errors
        const { handleError } = useErrorHandler();
        handleError(apiError, {
          showToast: true,
          toastPersistent: true,
        });
      }

      // Re-throw the error for component handling
      throw apiError;
    },
  });
});

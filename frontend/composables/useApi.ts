/**
 * API composable for making HTTP requests to the backend
 * Provides a centralized way to handle API communication with proper error handling,
 * CSRF protection, caching, and request/response interceptors
 */

import { HTTP_STATUS } from "~/types";

// Types for better type safety
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

interface GetOptions {
  cache?: boolean;
  ttl?: number;
  force?: boolean;
  headers?: Record<string, string>;
}

// Proper error class hierarchy
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ValidationError extends ApiError {
  constructor(
    message: string,
    public errors: Record<string, string[]>,
    data?: unknown
  ) {
    super(422, message, data);
    this.name = "ValidationError";
  }
}

class NetworkError extends ApiError {
  constructor(message: string = "Network error occurred") {
    super(0, message);
    this.name = "NetworkError";
  }
}

// API endpoints for better type safety and maintainability
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
  },
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
  },
  HEALTH: "/health",
} as const;

export const useApi = () => {
  const config = useRuntimeConfig();
  const apiBase = config?.public?.apiBase || "http://localhost:8000/api";

  /**
   * Validate endpoint format
   */
  const validateEndpoint = (endpoint: string): string => {
    if (!endpoint.startsWith("/")) {
      throw new Error(
        `Invalid endpoint: ${endpoint}. Endpoints must start with '/'`
      );
    }
    return endpoint;
  };

  /**
   * Get authentication and security headers
   */
  const getRequestHeaders = async (
    method: string = "GET"
  ): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    // Add CSRF token for state-changing requests
    if (method !== "GET") {
      try {
        const { ensureCsrfToken } = useCsrf();
        const csrfToken = await ensureCsrfToken();
        if (csrfToken) {
          headers["X-CSRF-TOKEN"] = csrfToken;
          headers["X-Requested-With"] = "XMLHttpRequest";
        }
      } catch (error) {
        console.warn("CSRF token not available:", error);
      }
    }

    return headers;
  };

  // Logger instance for API operations
  const logger = {
    debug: (message: string, ...args: any[]) =>
      console.debug(`[API] ${message}`, ...args),
    error: (message: string, ...args: any[]) =>
      console.error(`[API] ${message}`, ...args),
    warn: (message: string, ...args: any[]) =>
      console.warn(`[API] ${message}`, ...args),
  };

  /**
   * Request interceptor for logging and transformation
   */
  const onRequest = (endpoint: string, options: any) => {
    logger.debug(`${options.method || "GET"} ${endpoint}`);
    options._startTime = Date.now();
    return options;
  };

  /**
   * Response interceptor for logging and transformation
   */
  const onResponse = <T>(endpoint: string, options: any, response: T): T => {
    const duration = Date.now() - (options._startTime || 0);
    logger.debug(`${options.method || "GET"} ${endpoint} - ${duration}ms`);
    return response;
  };

  /**
   * Clear user session safely
   */
  const clearUserSession = async (): Promise<void> => {
    try {
      const { clear } = useUserSession();
      clear();
    } catch (sessionError) {
      console.warn("Failed to clear user session:", sessionError);
    }
  };

  /**
   * Get appropriate error message for status code
   */
  const getErrorMessage = (status: number): string => {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return "Bad request. Please check your input.";
      case HTTP_STATUS.UNAUTHORIZED:
        return "Authentication required. Please log in again.";
      case HTTP_STATUS.FORBIDDEN:
        return "You are not authorized to perform this action.";
      case HTTP_STATUS.NOT_FOUND:
        return "The requested resource was not found.";
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return "Too many requests. Please try again later.";
      case 0:
        return "Network error. Please check your connection and try again.";
      default:
        if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
          return "An internal server error occurred. Please try again later.";
        }
        return "An unexpected error occurred.";
    }
  };

  /**
   * Handle API errors with proper error classes
   */
  const handleApiError = async (
    error: unknown,
    method: string
  ): Promise<never> => {
    logger.error(`${method} Error:`, error);

    const status = (error as any)?.status || (error as any)?.statusCode || 0;
    const data = (error as any)?.data || (error as any)?.response?.data || null;
    const message = (error as any)?.message || (error as any)?.statusMessage;

    // Handle specific error types with proper classes
    switch (status) {
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        throw new ValidationError(
          data?.message || "Validation failed",
          data?.errors || {},
          data
        );

      case HTTP_STATUS.UNAUTHORIZED:
        await clearUserSession();
        throw new ApiError(
          status,
          "Authentication required. Please log in again.",
          data,
          error
        );

      case 0:
        throw new NetworkError();

      default:
        throw new ApiError(
          status,
          message || getErrorMessage(status),
          data,
          error
        );
    }
  };

  /**
   * Generic request method to reduce code duplication
   */
  const request = async <T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const validatedEndpoint = validateEndpoint(endpoint);
    const { method = "GET", body, headers: customHeaders } = options;

    try {
      const requestHeaders = await getRequestHeaders(method);
      const requestOptions: any = {
        method,
        credentials: "include",
        headers: {
          ...requestHeaders,
          ...customHeaders,
        },
      };

      if (body && method !== "GET") {
        requestOptions.body = JSON.stringify(body);
      }

      // Apply request interceptor
      onRequest(validatedEndpoint, requestOptions);

      const response = await $fetch<T>(
        `${apiBase}${validatedEndpoint}`,
        requestOptions
      );

      // Apply response interceptor
      return onResponse(validatedEndpoint, requestOptions, response);
    } catch (error) {
      return await handleApiError(error, method);
    }
  };

  /**
   * Make a GET request to the API with optional caching
   */
  const get = async <T>(
    endpoint: string,
    options: GetOptions = {}
  ): Promise<T> => {
    const { cache = false, ttl, force = false, headers } = options;

    if (cache) {
      const { cachedRequest } = useApiCache();
      return cachedRequest<T>(
        endpoint,
        () => request<T>(endpoint, { headers }),
        {
          ttl,
          force,
        }
      );
    }

    return request<T>(endpoint, { headers });
  };

  /**
   * Make a POST request to the API
   */
  const post = async <T>(
    endpoint: string,
    body: any,
    options: { headers?: Record<string, string> } = {}
  ): Promise<T> => {
    return request<T>(endpoint, {
      method: "POST",
      body,
      headers: options.headers,
    });
  };

  /**
   * Make a PUT request to the API
   */
  const put = async <T>(
    endpoint: string,
    body: any,
    options: { headers?: Record<string, string> } = {}
  ): Promise<T> => {
    return request<T>(endpoint, {
      method: "PUT",
      body,
      headers: options.headers,
    });
  };

  /**
   * Make a DELETE request to the API
   */
  const del = async <T>(
    endpoint: string,
    options: { headers?: Record<string, string> } = {}
  ): Promise<T> => {
    return request<T>(endpoint, { method: "DELETE", headers: options.headers });
  };

  /**
   * Test API connectivity
   */
  const testConnection = async () => {
    try {
      const response = await get("/health");
      return response;
    } catch (error) {
      console.error("API Connection Test Failed:", error);
      throw error;
    }
  };

  return {
    get,
    post,
    put,
    del,
    testConnection,
    apiBase,
    API_ENDPOINTS,
  };
};

/**
 * TypeScript type definitions for the User Management System
 * Centralized type definitions with better organization and documentation
 */

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

/** User roles available in the system */
export const USER_ROLES = {
  ADMINISTRATOR: "administrator",
  REVIEWER: "reviewer",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** HTTP status codes for better error handling */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

/** Base user interface with all properties from the database */
export interface User {
  readonly id: number;
  name: string;
  last_name: string;
  email: string;
  role: UserRole;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at?: string | null;
}

/** Data required to create a new user */
export interface CreateUserData {
  name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
}

/** Data that can be updated for an existing user */
export interface UpdateUserData {
  name: string;
  last_name: string;
  email: string;
  password?: string; // Optional - only update if provided
  role: UserRole;
}

/** User credentials for authentication */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Authenticated user data (without sensitive information) */
export interface AuthUser {
  readonly id: number;
  name: string;
  last_name: string;
  email: string;
  role: UserRole;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status?: number;
}

/** Paginated API response */
export interface PaginatedResponse<T = unknown> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

/** Validation error response structure */
export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

/** Authentication response */
export interface LoginResponse {
  user: AuthUser;
  token: string;
}

/** User list response with pagination */
export interface UserListResponse extends PaginatedResponse<User> {}

// ============================================================================
// ERROR TYPES
// ============================================================================

/** Standardized API error interface */
export interface ApiErrorInterface extends Error {
  readonly status: number;
  readonly data?: unknown;
  readonly originalError?: unknown;
  readonly shouldRedirect?: string;
}

/** Network-specific error interface */
export interface NetworkErrorInterface extends ApiErrorInterface {
  readonly status: 0;
}

/** Validation error with field-specific messages interface */
export interface ValidationErrorInterface extends ApiErrorInterface {
  readonly status: 422;
  readonly data: ValidationErrorResponse;
  readonly errors: Record<string, string[]>; // Direct access to errors for convenience
}

/** Toast notification types */
export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  persistent?: boolean;
  actionText?: string;
  onAction?: () => void;
}

// ============================================================================
// SESSION AND STATE TYPES
// ============================================================================

/** User session information */
export interface UserSession {
  user: AuthUser;
  token: string;
  loggedInAt: string;
  expiresAt?: string;
}

/** Loading state for async operations */
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

/** Pagination parameters for API requests */
export interface PaginationParams {
  page?: number;
  per_page?: number;
  search?: string;
  role?: UserRole;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Make specific properties optional */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Make specific properties required */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Extract keys that are of a specific type */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/** Common button variants */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "ghost"
  | "link";

/** Common button sizes */
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Modal component props */
export interface ModalProps {
  isOpen: boolean;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  closable?: boolean;
}

/** Table column definition */
export interface TableColumn<T = unknown> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  formatter?: (value: unknown, item: T) => string;
  width?: string;
  className?: string;
}

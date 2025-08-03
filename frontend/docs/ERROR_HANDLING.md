# Frontend Error Handling System

This document describes the comprehensive error handling system implemented for the User Management System frontend.

## Overview

The error handling system provides:

1. **Global Error Handling** - Centralized error processing and user notifications
2. **Form Validation Errors** - Specialized handling for form validation
3. **Toast Notifications** - User-friendly error and success messages
4. **API Error Interceptors** - Automatic handling of API errors
5. **Component-Level Error Display** - Reusable error display components

## Components

### 1. Toast System

#### `useToast()` Composable

```typescript
const { success, error, warning, info } = useToast();

// Show success message
success("User created successfully");

// Show error message
error("Failed to create user", {
  title: "Error",
  persistent: true,
});
```

#### `Toast.vue` Component

Displays individual toast notifications with different types (success, error, warning, info).

#### `ToastContainer.vue` Component

Manages multiple toast notifications and handles their lifecycle. Includes debug logging for development troubleshooting:

- **Toast Addition Logging**: Logs when new toasts are added with their options
- **Toast Count Tracking**: Tracks the current number of active toasts
- **Development Debugging**: Console logs prefixed with 🔍 for easy identification

### 2. Form Error Handling

#### `useFormErrorHandler()` Composable

```typescript
const {
  formState,
  handleFormSubmit,
  hasFieldError,
  getFieldError,
  clearErrors,
} = useFormErrorHandler();

// Handle form submission with automatic error handling
const { success, data } = await handleFormSubmit(
  () => api.createUser(formData),
  {
    successMessage: "User created successfully",
    successTitle: "Success",
  }
);

// The composable now properly handles HTTP status codes using constants
// and provides better TypeScript type safety for error handling
```

#### `FormError.vue` Component

```vue
<template>
  <!-- Display field-specific errors -->
  <FormError :errors="getFieldError('email')" />

  <!-- Display multiple errors -->
  <FormError :errors="formState.errors" multiple />

  <!-- Display general error -->
  <FormError :errors="formState.generalError" />
</template>
```

### 3. Global Error Handling

#### `useErrorHandler()` Composable

```typescript
const { handleError, showSuccess, showWarning } = useErrorHandler();

try {
  await api.someOperation();
} catch (error) {
  await handleError(error, {
    showToast: true,
    toastTitle: "Operation Failed",
  });
}
```

#### `GlobalErrorBoundary.vue` Component

Catches and displays critical application errors that would otherwise crash the app.

## API Integration

The error handling system automatically integrates with API responses:

### Automatic Error Handling

- **401 Unauthorized**: Redirects to login page
- **403 Forbidden**: Shows access denied message
- **422 Validation Error**: Displays field-specific validation errors
- **500 Server Error**: Shows server error message
- **Network Errors**: Shows connection error message

### API Plugin Configuration

The `api.client.ts` plugin automatically handles API errors and integrates with the toast system.

## Usage Examples

### 1. Form with Error Handling

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <input
        v-model="formData.email"
        :class="{
          'border-red-300': hasFieldError('email'),
        }"
        type="email"
      />
      <FormError :errors="getFieldError('email')" />
    </div>

    <button :disabled="formState.loading" type="submit">
      {{ formState.loading ? "Saving..." : "Save" }}
    </button>

    <!-- General error display -->
    <FormError v-if="formState.generalError" :errors="formState.generalError" />
  </form>
</template>

<script setup>
const { formState, handleFormSubmit, hasFieldError, getFieldError } =
  useFormErrorHandler();

const handleSubmit = async () => {
  const { success } = await handleFormSubmit(
    () => api.saveData(formData.value),
    {
      successMessage: "Data saved successfully",
      clearOnSuccess: true,
    }
  );

  if (success) {
    // Handle success (e.g., redirect, close modal)
  }
};
</script>
```

### 2. Manual Error Handling

```typescript
// Show different types of messages
const { success, error, warning, info } = useToast();

success("Operation completed successfully");
error("Something went wrong", { persistent: true });
warning("Please check your input");
info("Processing your request...");
```

### 3. API Error Handling

```typescript
const { handleError } = useErrorHandler();

try {
  const result = await $fetch("/api/users");
} catch (error) {
  // Automatically handled by API interceptor
  // Or manually handle specific cases
  const errorResult = await handleError(error, {
    showToast: false, // Don't show toast, handle manually
  });

  if (errorResult.isValidationError) {
    // Handle validation errors
    setFormErrors(errorResult.validationErrors);
  }
}
```

## Error Types

### API Error Interface

```typescript
interface ApiError extends Error {
  readonly status: number;
  readonly data?: unknown;
  readonly originalError?: unknown;
  readonly shouldRedirect?: string;
}
```

### Validation Error

```typescript
interface ValidationError extends ApiError {
  readonly status: 422;
  readonly data: ValidationErrorResponse;
  readonly errors: Record<string, string[]>;
}
```

## Configuration

### Toast Configuration

```typescript
// In app.vue
const toastContainer = ref();

onMounted(() => {
  const { setToastContainer } = useToast();
  setToastContainer(toastContainer.value);
});
```

### Global Error Boundary

```vue
<template>
  <GlobalErrorBoundary>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastContainer ref="toastContainer" />
  </GlobalErrorBoundary>
</template>

<script setup>
// Enhanced debug logging for development troubleshooting
console.log("🔍 app.vue: script setup started");
console.log("🔍 app.vue: current route:", useRoute().path);
console.log("🔍 app.vue: router instance:", useRouter());

onMounted(() => {
  console.log("🔍 app.vue: component mounted");
  console.log("🔍 app.vue: mounted route:", useRoute().path);
  console.log(
    "🔍 app.vue: available routes:",
    useRouter()
      .getRoutes()
      .map((r) => r.path)
  );
});
</script>
```

## Best Practices

1. **Use Form Error Handler for Forms**: Always use `useFormErrorHandler()` for form submissions
2. **Show Success Messages**: Provide feedback for successful operations
3. **Handle Validation Errors**: Display field-specific validation errors near the relevant inputs
4. **Persistent Error Messages**: Make error messages persistent for critical errors
5. **Loading States**: Always show loading states during async operations
6. **Graceful Degradation**: Handle network errors gracefully
7. **User-Friendly Messages**: Convert technical error messages to user-friendly text

## Testing

The error handling components can be tested using Vue Test Utils:

```typescript
import { mount } from "@vue/test-utils";
import FormError from "~/components/UI/FormError.vue";

test("displays validation errors", () => {
  const wrapper = mount(FormError, {
    props: {
      errors: { email: ["Invalid email format"] },
      field: "email",
    },
  });

  expect(wrapper.text()).toContain("Invalid email format");
});
```

This error handling system provides a robust foundation for managing errors throughout the application while maintaining a consistent user experience.

## Recent Updates

### Modal Component Improvements

- **Enhanced Emit Signatures**: Updated modal components (`CreateUserModal`, `EditUserModal`, `DeleteUserModal`) to properly emit user data on success events, ensuring consistent data flow between components and parent pages
- **Type Safety**: Fixed TypeScript errors in form error handling composable by properly importing HTTP status constants
- **Better Error Handling**: Improved form error handling with proper HTTP status code constants and enhanced type safety

### Form Error Handler Enhancements

- **HTTP Status Constants**: Now uses centralized HTTP status constants from the types file for better maintainability
- **Improved Type Safety**: Enhanced TypeScript type definitions for better development experience
- **Consistent Error Formatting**: Standardized error message formatting across all components
- **Import Resolution**: Fixed missing `useToast` import in users.vue page to ensure proper toast notification functionality throughout the user management interface

### TypeScript Configuration Improvements

- **Explicit Imports**: While Nuxt's auto-import feature is configured, explicit imports are used for composables and stores in critical components like users.vue to ensure better TypeScript support and IDE compatibility
- **Type Safety**: All TypeScript compilation errors have been resolved, ensuring the application builds successfully with full type safety
- **Development Experience**: Improved development experience with proper TypeScript error reporting and IntelliSense support

### Debug Logging Enhancements

- **Route Tracking**: Enhanced debug logging in app.vue provides real-time route monitoring during development
- **Router Inspection**: Available routes are logged to console for debugging navigation issues
- **Component Lifecycle**: Mounting events are tracked to verify proper component initialization
- **Toast System Debugging**: ToastContainer component now includes debug logging for toast addition and count tracking
- **Debug Identification**: All debug logs use 🔍 emoji prefix for easy identification in console output
- **Development Troubleshooting**: Debug logs help identify routing issues, toast system behavior, and ensure proper application initialization during development

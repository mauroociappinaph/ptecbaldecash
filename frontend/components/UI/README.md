# UI Components

This directory contains reusable UI components for the User Management System.

## Components

### Modal

A flexible modal component with customizable size, icons, and content areas. Features accessibility support, keyboard navigation, and loading states.

**Props:**

- `isOpen` (boolean, required): Controls modal visibility
- `title` (string): Modal title text
- `description` (string): Modal description text
- `size` ("sm" | "md" | "lg" | "xl" | "full"): Modal size, defaults to "md"
- `icon` (Component): Icon component to display in header
- `iconType` ("info" | "success" | "warning" | "error"): Icon styling type
- `showHeader` (boolean): Show/hide header section, defaults to true
- `showFooter` (boolean): Show/hide footer section, defaults to false
- `showCloseButton` (boolean): Show/hide close button, defaults to true
- `closeOnOverlay` (boolean): Allow closing by clicking overlay, defaults to true
- `loading` (boolean): Disable interactions when loading, defaults to false

**Events:**

- `@close`: Emitted when modal should be closed

**Slots:**

- Default slot: Modal content area
- `footer`: Footer content area

```vue
<template>
  <Modal
    :is-open="showModal"
    title="Create User"
    description="Add a new user to the system"
    size="md"
    :icon="PlusIcon"
    icon-type="info"
    :show-footer="true"
    :loading="isSubmitting"
    @close="showModal = false"
  >
    <!-- Modal content -->
    <form @submit.prevent="handleSubmit">
      <!-- Form fields here -->
    </form>

    <template #footer>
      <Button variant="primary" type="submit" :loading="isSubmitting">
        Create
      </Button>
      <Button
        variant="secondary"
        @click="showModal = false"
        :disabled="isSubmitting"
      >
        Cancel
      </Button>
    </template>
  </Modal>
</template>
```

**Features:**

- Accessibility compliant with proper ARIA attributes
- Keyboard navigation (ESC key to close)
- Loading state support with disabled interactions
- Responsive design with multiple size options
- Customizable icons with color-coded types
- Overlay click handling
- Automatic focus management

### Button

A versatile button component with multiple variants, sizes, and states. Supports different element types including regular buttons, links, and Nuxt router links.

**Props:**

- `variant` ("primary" | "secondary" | "success" | "danger" | "warning" | "ghost" | "link"): Button style variant, defaults to "primary"
- `size` ("xs" | "sm" | "md" | "lg" | "xl"): Button size, defaults to "md"
- `type` ("button" | "submit" | "reset"): Button type for forms, defaults to "button"
- `disabled` (boolean): Disable button interactions, defaults to false
- `loading` (boolean): Show loading spinner and disable interactions, defaults to false
- `block` (boolean): Make button full width, defaults to false
- `rounded` (boolean): Use rounded corners instead of default border radius, defaults to false
- `text` (string): Button text content
- `leftIcon` (Component): Icon component to display on the left
- `rightIcon` (Component): Icon component to display on the right
- `href` (string): URL for link buttons (renders as `<a>` tag)
- `to` (string | object): Route for Nuxt router links (renders as `<NuxtLink>`)

**Events:**

- `@click`: Emitted when button is clicked (not disabled or loading)

**Usage Examples:**

```vue
<template>
  <div>
    <!-- Primary button -->
    <Button variant="primary" @click="handleClick"> Save Changes </Button>

    <!-- Button with icon -->
    <Button variant="secondary" :left-icon="PlusIcon"> Add User </Button>

    <!-- Loading button -->
    <Button variant="primary" :loading="isSubmitting">
      {{ isSubmitting ? "Saving..." : "Save" }}
    </Button>

    <!-- Link button -->
    <Button variant="link" href="https://example.com"> External Link </Button>

    <!-- Router link button -->
    <Button variant="secondary" :to="{ name: 'users' }"> View Users </Button>

    <!-- Full width button -->
    <Button variant="primary" block> Full Width Button </Button>
  </div>
</template>
```

**Features:**

- Automatic element type detection (button, a, NuxtLink)
- Loading state with spinner animation
- Icon support with automatic spacing
- Disabled state handling
- Full accessibility support
- Responsive design with multiple size options

### Table

A comprehensive table component with sorting, pagination, and customizable cells. Features TypeScript type safety with proper column key handling and slot name generation.

**Props:**

- `data` (Array, required): Array of data objects to display
- `columns` (Array, required): Column configuration objects
- `loading` (boolean): Show loading state, defaults to false
- `error` (string | null): Error message to display
- `title` (string): Table title
- `description` (string): Table description
- `showHeader` (boolean): Show table header section, defaults to true
- `showRetry` (boolean): Show retry button on error, defaults to true
- `loadingText` (string): Loading message text
- `emptyTitle` (string): Empty state title
- `emptyDescription` (string): Empty state description
- `hoverable` (boolean): Enable row hover effects, defaults to true
- `striped` (boolean): Enable alternating row colors, defaults to false
- `sortBy` (string): Current sort column
- `sortOrder` ("asc" | "desc"): Current sort order
- `rowKey` (string | Function): Row key for v-for optimization

**Column Configuration:**

```typescript
interface Column<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  formatter?: (value: unknown, item: T) => string;
  className?: string;
}
```

**Events:**

- `@sort`: Emitted when column header is clicked for sorting
- `@retry`: Emitted when retry button is clicked

**Usage Examples:**

```vue
<template>
  <Table
    :data="users"
    :columns="columns"
    :loading="loading"
    :error="error"
    title="Users"
    description="Manage system users"
    :sort-by="sortBy"
    :sort-order="sortOrder"
    @sort="handleSort"
    @retry="fetchUsers"
  >
    <template #actions>
      <Button variant="primary" @click="createUser"> Create User </Button>
    </template>

    <template #cell-actions="{ item, index }">
      <Button size="sm" variant="ghost" @click="editUser(item)"> Edit </Button>
      <Button size="sm" variant="danger" @click="deleteUser(item)">
        Delete
      </Button>
    </template>

    <template #cell-status="{ value, item }">
      <span
        :class="[
          'px-2 py-1 rounded-full text-xs',
          value === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800',
        ]"
      >
        {{ value }}
      </span>
    </template>

    <template #empty>
      <div class="text-center py-8">
        <p class="text-gray-500">No users found</p>
        <Button variant="primary" @click="createUser" class="mt-4">
          Create First User
        </Button>
      </div>
    </template>
  </Table>
</template>

<script setup>
const columns = [
  { key: "id", label: "ID", sortable: true },
  { key: "first_name", label: "First Name", sortable: true },
  { key: "last_name", label: "Last Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "role", label: "Role", sortable: true },
  { key: "status", label: "Status", align: "center" },
  { key: "actions", label: "Actions", align: "right" },
];

const sortBy = ref("created_at");
const sortOrder = ref("desc");

const handleSort = (column: string, order: "asc" | "desc") => {
  sortBy.value = column;
  sortOrder.value = order;
  // Fetch sorted data
};
</script>
```

**Features:**

- **Type Safety**: Full TypeScript support with proper column key handling and string conversion
- **Sorting**: Click column headers to sort data with visual indicators
- **Loading States**: Built-in loading spinner and skeleton states
- **Error Handling**: Error display with retry functionality
- **Empty States**: Customizable empty state with slot support
- **Responsive Design**: Horizontal scrolling on mobile devices
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **Customizable Cells**: Use slots to customize individual cell rendering
- **Row Styling**: Configurable hover effects and striped rows
- **Performance**: Optimized with memoized value getters and proper key handling

### Loading

A loading component with multiple animation types and sizes.

```vue
<template>
  <div>
    <!-- Spinner loading -->
    <Loading type="spinner" text="Loading users..." />

    <!-- Skeleton loading for content -->
    <Loading type="skeleton" :skeleton-lines="5" />

    <!-- Full screen overlay -->
    <Loading type="spinner" text="Processing..." full-screen overlay />
  </div>
</template>
```

### Error

An error display component with retry functionality and collapsible details.

```vue
<template>
  <Error
    type="error"
    title="Failed to load users"
    message="Unable to fetch user data from the server"
    :details="errorDetails"
    @retry="fetchUsers"
  >
    <template #actions>
      <Button variant="secondary" @click="goBack"> Go Back </Button>
    </template>
  </Error>
</template>
```

### ErrorBoundary

A comprehensive error boundary component that catches and handles errors gracefully throughout the application.

**Props:**

- `fallbackTitle` (string): Custom error title, defaults to "Something went wrong"
- `fallbackMessage` (string): Custom error message with user-friendly text
- `showDetails` (boolean): Show detailed error information (recommended for development only)
- `showReportButton` (boolean): Display error reporting button
- `onRetry` (Function): Custom retry function
- `onReport` (Function): Custom error reporting function

**Events:**

- `@error`: Emitted when an error is caught
- `@retry`: Emitted when retry button is clicked

**Features:**

- **Global Error Catching**: Automatically catches unhandled errors and promise rejections
- **Enhanced Error Handling**: Works seamlessly with the new API error class hierarchy (`ApiError`, `ValidationError`, `NetworkError`)
- **Performance Monitoring**: Integrates with performance monitoring to log memory usage during errors
- **Modern Browser Support**: Uses `import.meta.client` for better Nuxt 3 compatibility
- **Graceful Fallback**: Continues to function even if performance monitoring is unavailable
- **User-Friendly Interface**: Provides clear error messages and recovery options
- **Accessibility**: Proper focus management and keyboard navigation support
- **Error Type Recognition**: Automatically provides appropriate error messages based on error type (network errors, validation errors, etc.)

```vue
<template>
  <ErrorBoundary
    :show-details="isDevelopment"
    :show-report-button="true"
    fallback-title="Application Error"
    fallback-message="An unexpected error occurred. Please try refreshing the page."
    @error="handleError"
    @retry="handleRetry"
  >
    <YourApplicationContent />
  </ErrorBoundary>
</template>

<script setup>
const isDevelopment = process.env.NODE_ENV === "development";

const handleError = (error) => {
  console.error("Application error:", error);
  // Send to error reporting service
};

const handleRetry = () => {
  // Custom retry logic
  window.location.reload();
};
</script>
```

## Usage Guidelines

1. **Import components**: Use the index file for easy importing:

   ```typescript
   import {
     Modal,
     Button,
     Table,
     Loading,
     Error,
     ErrorBoundary,
     Toast,
   } from "~/components/UI";
   ```

2. **Consistent styling**: All components use Tailwind CSS classes and follow the design system.

3. **Accessibility**: Components include proper ARIA attributes and keyboard navigation support.

4. **TypeScript**: All components are fully typed with TypeScript interfaces.

5. **Responsive**: Components are designed to work on all screen sizes.

## Customization

Components can be customized through props and slots. For more extensive customization, you can:

1. Override CSS classes using Tailwind utilities
2. Use slots to replace default content
3. Extend components by creating wrapper components

## Testing

Components should be tested using Vitest. Example test structure:

```typescript
import { mount } from "@vue/test-utils";
import { Button } from "~/components/UI";

describe("Button", () => {
  it("renders correctly", () => {
    const wrapper = mount(Button, {
      props: { text: "Click me" },
    });
    expect(wrapper.text()).toContain("Click me");
  });
});
```

### Toast

A notification toast component with multiple types, positioning options, and auto-dismiss functionality.

**Props:**

- `type` ("success" | "error" | "warning" | "info"): Toast type, defaults to "info"
- `title` (string): Optional toast title
- `message` (string, required): Toast message content
- `duration` (number): Auto-dismiss duration in milliseconds, defaults to 5000
- `closable` (boolean): Show close button, defaults to true
- `persistent` (boolean): Prevent auto-dismiss, defaults to false
- `position` ("top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"): Toast position, defaults to "top-right"
- `icon` (Component): Custom icon component
- `actionText` (string): Optional action button text
- `onAction` (Function): Action button click handler

**Events:**

- `@close`: Emitted when toast is closed
- `@action`: Emitted when action button is clicked

**Usage Examples:**

```vue
<template>
  <div>
    <!-- Success toast -->
    <Toast
      type="success"
      title="User Created"
      message="The user has been successfully created."
      @close="handleToastClose"
    />

    <!-- Error toast with action -->
    <Toast
      type="error"
      title="Save Failed"
      message="Unable to save changes. Please try again."
      action-text="Retry"
      :on-action="retryAction"
      persistent
    />

    <!-- Warning toast with custom position -->
    <Toast
      type="warning"
      message="Session will expire in 5 minutes"
      position="top-center"
      :duration="10000"
    />

    <!-- Info toast with custom icon -->
    <Toast
      type="info"
      message="New features available"
      :icon="InfoIcon"
      position="bottom-right"
    />
  </div>
</template>
```

**Features:**

- Auto-dismiss with configurable duration
- Pause timer on hover interaction
- Multiple positioning options
- Action button support
- Custom icon support
- Keyboard accessibility (ESC key support)
- Responsive design
- Color-coded types with appropriate icons

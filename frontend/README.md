# User Management System - Frontend

A modern Nuxt.js frontend application for the User Management System with TypeScript, Tailwind CSS, and comprehensive testing setup.

## Technology Stack

- **Nuxt 3** - Vue.js framework with server-side rendering
- **TypeScript** - Type-safe JavaScript with strict mode enabled
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management for Vue.js
- **Nuxt Auth Utils** - Authentication utilities
- **VueUse** - Collection of Vue composition utilities
- **Vitest** - Fast unit testing framework
- **Vue Test Utils** - Testing utilities for Vue components

## Project Structure

```
frontend/
├── app/                    # Main application files
│   └── app.vue            # Root Vue component
├── assets/                # Static assets
│   └── css/               # CSS files
├── components/            # Vue components
│   ├── Auth/              # Authentication components
│   ├── Users/             # User management components
│   ├── UI/                # Reusable UI components
│   └── Layout/            # Layout components
├── composables/           # Vue composables
├── middleware/            # Route middleware
├── pages/                 # File-based routing pages
│   ├── index.vue          # Landing page
│   ├── login.vue          # Authentication page
│   ├── users.vue          # User management page
│   ├── simple.vue         # Simple test page
│   └── test-simple.vue    # Alternative test page
├── plugins/               # Nuxt plugins
├── stores/                # Pinia stores
├── tests/                 # Test files
├── types/                 # TypeScript type definitions
└── nuxt.config.ts         # Nuxt configuration
```

## Setup

Install dependencies:

```bash
npm install
```

## Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
# API Configuration
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
NUXT_PUBLIC_APP_NAME=User Management System

# Authentication
NUXT_API_SECRET=your-secret-key-here

# Development
NUXT_DEVTOOLS_ENABLED=true
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Testing

Run tests:

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

## Building

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Features

- **Authentication System**: ✅ Secure login with comprehensive validation and role-based access control (currently simplified for testing)
- **User Management**: ✅ Complete CRUD operations for user accounts with modal-based interface
- **Role-Based UI**: ✅ Different interfaces for Administrator and Reviewer roles
- **Responsive Design**: ✅ Mobile-first design with Tailwind CSS
- **Type Safety**: ✅ Full TypeScript support with strict mode and comprehensive type definitions
- **Testing**: ✅ Comprehensive test setup with Vitest and type testing
- **State Management**: ✅ Centralized state with Pinia stores fully implemented
- **API Integration**: ✅ Seamless backend communication with error handling
- **Code Quality**: ✅ ESLint/Prettier integration for consistent formatting
- **Landing Page**: ✅ Simple welcome interface with navigation links to login and user management

## Development Notes

### Current Authentication Status

The authentication system has the following temporary configurations for testing purposes:

#### Users Page Middleware

The authentication middleware is currently disabled on the users page (`frontend/pages/users.vue`). This middleware normally:

- Protects the user management interface from unauthenticated access
- Redirects unauthenticated users to the login page
- Ensures only logged-in users can access user management features

#### Login Page Status

The login page (`frontend/app/pages/login.vue`) has been temporarily simplified to a basic test page for debugging purposes. The current implementation:

- Shows a simple "Login Page" test interface
- Does not integrate the LoginForm component (which exists separately as a fully functional component)
- Displays a basic test message to verify page rendering

**Note**: The LoginForm component (`frontend/components/Auth/LoginForm.vue`) is fully functional and ready for integration. It includes:

- Complete form validation and error handling
- Role-based authentication with proper API integration
- Loading states and user feedback
- TypeScript support with proper type definitions

#### Guest Middleware

The guest middleware is currently temporarily disabled on the login page for testing purposes. This middleware normally:

- Redirects authenticated users away from the login page
- Prevents unnecessary access to guest-only pages
- Automatically navigates logged-in users to the `/users` dashboard

#### Debug Logging

Enhanced debug logging has been added to the main app.vue component for development troubleshooting:

- **Route Tracking**: Console logs show current route path during component initialization and mounting
- **Router Inspection**: Available routes are logged to help debug navigation issues
- **Component Lifecycle**: Mounting events are tracked to verify proper component initialization
- **Debug Markers**: All debug logs are prefixed with 🔍 emoji for easy identification in console output

This debug logging helps identify routing issues, monitor toast system behavior, and ensures proper component initialization during development.

### Restoring Full Authentication

To restore the complete authentication system:

1. **Users Page**: Re-enable the authentication middleware by uncommenting `middleware: "auth"` in `frontend/app/pages/users.vue`
2. **Login Page**: Re-integrate the LoginForm component in `frontend/app/pages/login.vue` by replacing the current content with:

   ```vue
   <template>
     <LoginForm />
   </template>

   <script setup lang="ts">
   // Guest middleware to redirect authenticated users
   // definePageMeta({
   //   middleware: "guest"
   // });
   </script>
   ```

3. **Guest Middleware**: Re-enable the guest middleware on the login page by uncommenting the middleware definition
4. **Page Layout**: The LoginForm component includes its own complete styling and layout

Both the LoginForm component (`frontend/components/Auth/LoginForm.vue`) and authentication middleware remain fully functional and ready for integration.

For detailed integration instructions, see [AUTHENTICATION_INTEGRATION.md](docs/AUTHENTICATION_INTEGRATION.md).

## Current Implementation

### ✅ Authentication System

- **Login Form**: LoginForm component available but currently not integrated (login page simplified for testing)
- **Authentication Composable**: `useAuth` composable with role-based access control methods
- **Route Protection**: Middleware for protected pages (`auth`, `admin`, `guest`) with proper string-based syntax
- **Session Management**: Optimized session handling with server-side session clearing and proper logout functionality
- **Role-Based Access**: Complete Administrator/Reviewer role differentiation
- **Code Quality**: Consistent formatting with ESLint/Prettier integration and resolved HTML structure issues
- **Landing Page**: Simple index page with welcome message and navigation links to key application areas
- **Middleware Syntax**: Fixed middleware definition syntax for better Nuxt 3 compatibility
- **UI Components**: Fixed Button component NuxtLink tag comparison for proper router link rendering
- **App Configuration**: Cleaned up app.vue with consistent formatting and proper script setup structure
- **Debug Logging**: Enhanced debug logging in app.vue with route tracking and router inspection for development troubleshooting, plus toast system debugging in ToastContainer

### ✅ API Integration

- `useApi` composable for HTTP requests with proper error class hierarchy
- CSRF token handling with `useCsrf`
- Centralized error handling and response interceptors
- TypeScript interfaces for all API responses
- Fixed duplicate class definitions and logger initialization issues
- Improved code maintainability with cleaner composable structure

### ✅ User Management Interface

- **User Store**: Complete Pinia store implementation with comprehensive state management
- **User Listing**: Fully functional user listing page with pagination, search, and filtering
- **Modal Components**: Complete modal system for create/edit/delete operations with validation
- **CRUD Operations**: Full create, read, update, and delete functionality with proper error handling
- **Table Component**: Fixed TypeScript type safety issues with proper column key handling and slot name generation
- **UI Components**: Resolved type conversion issues for better TypeScript compatibility

## API Integration

The frontend communicates with the Laravel backend API through:

- **Base URL**: Configured via `NUXT_PUBLIC_API_BASE` environment variable
- **Authentication**: Token-based authentication using Nuxt Auth Utils
- **Error Handling**: Centralized error handling for API requests
- **Type Safety**: TypeScript interfaces for all API responses

## Test Pages

For development and debugging purposes, several test pages are available:

- **`/simple`** - Simple test page with minimal dependencies for basic routing verification
- **`/test-simple`** - Alternative simple test page for debugging complex routing issues
- **`/test`** - General test page for development purposes

These pages help verify that the Nuxt.js routing system is working correctly without complex authentication or component dependencies. They're particularly useful when debugging routing issues or testing basic page rendering.

## Development Guidelines

- Use TypeScript for all new files
- Follow Vue 3 Composition API patterns
- Write tests for all components and composables
- Use Tailwind CSS for styling
- Follow the established project structure
- Ensure responsive design for all components

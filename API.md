# API Documentation

## Authentication Endpoints

### POST /api/auth/login

Login with email and password credentials.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "user": {
    "id": 1,
    "name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "role": "administrator"
  },
  "token": "1|abc123..."
}
```

**Error Responses:**

- `401` - Invalid credentials
- `422` - Validation errors
- `429` - Too many login attempts

### POST /api/auth/logout

Logout and invalidate the current token.

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

### GET /api/auth/user

Get the currently authenticated user information.

**Headers:**

```
Accept: application/json
```

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "role": "administrator",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (401):**

```json
{
  "data": null
}
```

## User Management Endpoints

### GET /api/users

Get paginated list of users.

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

- `page` (optional) - Page number (default: 1)
- `search` (optional) - Search term for name/email
- `role` (optional) - Filter by user role (administrator/reviewer)

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "role": "administrator",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "current_page": 1,
  "last_page": 5,
  "per_page": 15,
  "total": 75
}
```

### POST /api/users

Create a new user (Administrator only).

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "role": "reviewer"
}
```

**Success Response (201):**

```json
{
  "data": {
    "id": 2,
    "name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "role": "reviewer",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/users/{id}

Update an existing user (Administrator only).

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "password": "NewPassword123!",
  "role": "administrator"
}
```

**Success Response (200):**

```json
{
  "data": {
    "id": 2,
    "name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "role": "administrator",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### DELETE /api/users/{id}

Soft delete a user (Administrator only).

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200):**

```json
{
  "message": "User deleted successfully"
}
```

## Error Responses

### Validation Errors (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "The email field is required.",
      "The email must be a valid email address."
    ],
    "password": ["The password field is required."]
  }
}
```

### Authentication Errors (401)

```json
{
  "message": "Unauthenticated"
}
```

### Authorization Errors (403)

```json
{
  "message": "This action is unauthorized."
}
```

### Rate Limiting (429)

```json
{
  "message": "Too Many Attempts."
}
```

## User Roles

The system uses a PHP enum (`App\Enums\UserRole`) for type-safe role management:

- **administrator**: Full access to all endpoints and operations
- **reviewer**: Read-only access to user listings

**Note**: API responses return role values as strings (`"administrator"`, `"reviewer"`), but they are backed by the `UserRole` enum in the backend for type safety and consistency. The enum provides display labels via the `label()` method (e.g., "Administrator", "Reviewer") which are used in email templates and UI displays.

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {token}
```

Tokens are obtained through the login endpoint and should be stored securely on the client side.

### Development Notes

- **Authentication Middleware**: Currently temporarily disabled on the users page for testing purposes. This middleware normally protects the user management interface and redirects unauthenticated users to the login page.
- **Landing Page**: The index page (`/`) has been simplified to a basic welcome page with navigation links, removing automatic authentication redirects to avoid routing complexity.
- **Guest Middleware**: Currently temporarily disabled on the frontend login page for testing purposes. This middleware normally prevents authenticated users from accessing the login page.
- **Middleware Syntax**: Updated to use string-based middleware definitions for better Nuxt 3 compatibility (e.g., `middleware: "auth"` instead of imported middleware functions).
- **Code Quality**: Recent formatting improvements include standardized quote usage and cleaned up duplicate code blocks in core application files like app.vue.
- **Debug Logging**: Enhanced debug logging in the frontend app.vue component provides route tracking and router inspection for development troubleshooting. Console logs include current route monitoring and available routes listing to help debug navigation and API integration issues. ToastContainer component also includes debug logging for monitoring toast notifications and user feedback systems.

### Recent API Integration Updates

- **Modal Component Events**: Updated frontend modal components to properly emit user data on success events, ensuring consistent data flow between API responses and UI components.
- **Error Handling**: Enhanced form error handling composable with proper HTTP status code constants and improved TypeScript type safety for better API error processing.
- **Type Safety**: Fixed TypeScript errors in form error handling by properly importing HTTP status constants from the centralized types file.
- **Import Fix**: Resolved missing `useToast` import in users.vue page to ensure proper toast notification functionality for user management operations.
- **Email Template Enhancement**: Updated email template to use UserRole enum `label()` method for proper role display (e.g., "Administrator" instead of "administrator").
- **Test Fixes**: Resolved test failures related to validation rules, route parameter handling, and password uniqueness requirements.

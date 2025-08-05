# Design Document

## Overview

This document outlines the design for a comprehensive user management system built with Laravel backend and Nuxt.js frontend. The system provides secure authentication, role-based access control, and full CRUD operations for user management. The architecture follows modern web development best practices with clear separation of concerns between frontend and backend.

The system supports two distinct user roles:

- **Administrator**: Full access to all system features including user creation, editing, and deletion
- **Reviewer**: Read-only access to view user listings

## Architecture

### High-Level Architecture

The system follows a modern full-stack architecture with clear separation between frontend and backend:

```
┌─────────────────┐    HTTP/API     ┌─────────────────┐
│   Nuxt.js       │◄──────────────►│   Laravel       │
│   Frontend      │    Requests     │   Backend       │
│                 │                 │                 │
│ - Vue Components│                 │ - API Routes    │
│ - Authentication│                 │ - Controllers   │
│ - Role Guards   │                 │ - Middleware    │
│ - State Mgmt    │                 │ - Models        │
└─────────────────┘                 └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │   MySQL         │
                                    │   Database      │
                                    │                 │
                                    │ - Users Table   │
                                    │ - Sessions      │
                                    │ - Migrations    │
                                    └─────────────────┘
```

### Technology Stack

**Backend (Laravel)**

- Laravel 10+ with PHP 8.1+
- MySQL database
- Laravel Sanctum for API authentication
- Laravel Mail for email notifications
- PHPUnit for testing

**Frontend (Nuxt.js)**

- Nuxt 3 with Vue 3
- TypeScript for type safety
- Pinia for state management
- Nuxt Auth Utils for authentication
- Tailwind CSS for styling

## Components and Interfaces

### Backend Components

#### 1. Authentication System

- **Laravel Sanctum**: Provides API token authentication
- **Custom Middleware**: Role-based access control
- **Password Hashing**: Bcrypt with configurable rounds
- **Session Management**: Secure session handling

#### 2. User Management API

```php
// API Routes Structure
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store'])->middleware('role:administrator');
    Route::put('/users/{id}', [UserController::class, 'update'])->middleware('role:administrator');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('role:administrator');
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
```

#### 3. Middleware Stack

- **Authentication Middleware**: Verifies valid API tokens
- **Role Middleware**: Checks user permissions
- **CORS Middleware**: Handles cross-origin requests
- **Rate Limiting**: Prevents brute force attacks

#### 4. Controllers

```php
class UserController extends Controller
{
    public function index(Request $request)
    {
        return UserResource::collection(
            User::whereNull('deleted_at')->paginate(15)
        );
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        // Send credentials email
        Mail::to($user->email)->send(new UserCredentialsMail($user, $request->password));

        return new UserResource($user);
    }
}
```

### Frontend Components

#### 1. Authentication Layer

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const { data: user, refresh } = useUserSession();

  const login = async (credentials: LoginCredentials) => {
    const { data } = await $fetch("/api/auth/login", {
      method: "POST",
      body: credentials,
    });

    await setUserSession(data.user);
    return data;
  };

  const hasRole = (role: string) => {
    return user.value?.role === role;
  };

  return { user, login, hasRole, refresh };
};
```

#### 2. Component Structure

```
components/
├── Auth/
│   ├── LoginForm.vue
│   └── AuthGuard.vue
├── Users/
│   ├── UserList.vue
│   ├── UserModal.vue
│   ├── CreateUserModal.vue
│   └── EditUserModal.vue
├── UI/
│   ├── Modal.vue
│   ├── Button.vue
│   └── Table.vue
└── Layout/
    ├── Header.vue
    └── Sidebar.vue
```

#### 3. State Management (Pinia)

```typescript
// stores/users.ts
export const useUsersStore = defineStore("users", () => {
  const users = ref<User[]>([]);
  const loading = ref(false);

  const fetchUsers = async () => {
    loading.value = true;
    try {
      const data = await $fetch("/api/users");
      users.value = data.data;
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (userData: CreateUserData) => {
    const newUser = await $fetch("/api/users", {
      method: "POST",
      body: userData,
    });
    users.value.push(newUser.data);
    return newUser;
  };

  return { users, loading, fetchUsers, createUser };
});
```

## Data Models

### User Model (Laravel)

```php
class User extends Authenticatable
{
    use HasApiTokens, SoftDeletes;

    protected $fillable = [
        'name',
        'last_name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function isAdministrator(): bool
    {
        return $this->role === 'administrator';
    }

    public function isReviewer(): bool
    {
        return $this->role === 'reviewer';
    }
}
```

### Database Schema

```sql
-- Users table migration
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('administrator', 'reviewer') NOT NULL DEFAULT 'reviewer',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_deleted_at (deleted_at)
);

-- Personal access tokens table (Laravel Sanctum)
CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_tokenable (tokenable_type, tokenable_id),
    INDEX idx_token (token)
);
```

### Frontend Types (TypeScript)

```typescript
// types/user.ts
export interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  role: "administrator" | "reviewer";
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  name: string;
  last_name: string;
  email: string;
  password: string;
  role: "administrator" | "reviewer";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  last_name: string;
  email: string;
  role: "administrator" | "reviewer";
}
```

## Error Handling

### Backend Error Handling

```php
// app/Exceptions/Handler.php
class Handler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        if ($request->expectsJson()) {
            if ($exception instanceof ValidationException) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $exception->errors()
                ], 422);
            }

            if ($exception instanceof AuthenticationException) {
                return response()->json([
                    'message' => 'Unauthenticated'
                ], 401);
            }

            if ($exception instanceof AuthorizationException) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }
        }

        return parent::render($request, $exception);
    }
}
```

### Frontend Error Handling

```typescript
// plugins/api.client.ts
export default defineNuxtPlugin(() => {
  $fetch.create({
    onResponseError({ response }) {
      if (response.status === 401) {
        // Redirect to login
        navigateTo("/login");
      } else if (response.status === 403) {
        // Show unauthorized message
        showError("You are not authorized to perform this action");
      } else if (response.status === 422) {
        // Handle validation errors
        const errors = response._data.errors;
        // Display validation errors to user
      }
    },
  });
});
```

## Testing Strategy

### Backend Testing

```php
// tests/Feature/UserManagementTest.php
class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_user()
    {
        $admin = User::factory()->administrator()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john@example.com',
                'password' => 'password123',
                'role' => 'reviewer'
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name', 'email', 'role']]);
    }

    public function test_reviewer_cannot_create_user()
    {
        $reviewer = User::factory()->reviewer()->create();

        $response = $this->actingAs($reviewer, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john@example.com',
                'password' => 'password123',
                'role' => 'reviewer'
            ]);

        $response->assertStatus(403);
    }
}
```

### Frontend Testing

```typescript
// tests/components/UserList.test.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import UserList from "~/components/Users/UserList.vue";

describe("UserList", () => {
  it("renders user list correctly", () => {
    const users = [
      {
        id: 1,
        name: "John",
        last_name: "Doe",
        email: "john@example.com",
        role: "administrator",
      },
    ];

    const wrapper = mount(UserList, {
      props: { users },
    });

    expect(wrapper.text()).toContain("John Doe");
    expect(wrapper.text()).toContain("john@example.com");
  });

  it("shows action buttons for administrators", () => {
    const wrapper = mount(UserList, {
      global: {
        mocks: {
          $auth: { user: { role: "administrator" } },
        },
      },
    });

    expect(wrapper.find('[data-testid="create-user-btn"]').exists()).toBe(true);
  });
});
```

### Security Considerations

#### Authentication Security

- JWT tokens with appropriate expiration times
- Secure password hashing with bcrypt
- CSRF protection for web routes
- Rate limiting on authentication endpoints
- Secure session management

#### Authorization Security

- Role-based middleware on all protected routes
- Frontend route guards to prevent unauthorized access
- API endpoint protection with proper middleware
- Input validation and sanitization

#### Data Security

- Soft deletes to maintain data integrity
- Encrypted sensitive data in database
- Secure email transmission for credentials
- Environment-based configuration management

#### Frontend Security

- XSS protection through Vue's built-in sanitization
- Secure API communication over HTTPS
- Client-side route protection
- Secure token storage and management

This design provides a robust, scalable, and secure foundation for the user management system while following modern development best practices and security standards.

# Rate Limiting Implementation

## Overview

This document describes the rate limiting implementation for the User Management System API. Rate limiting helps protect the application from abuse, brute force attacks, and excessive resource consumption.

## Rate Limiting Configuration

### Authentication Endpoints

-   **Login endpoint** (`/api/auth/login`): 5 attempts per minute per IP address
-   **Other auth endpoints** (`/api/auth/logout`, `/api/auth/me`): 60 requests per minute per user

### API Endpoints

-   **General API endpoints**: 60 requests per minute per authenticated user, 20 requests per minute per IP for unauthenticated requests
-   **User management operations** (create/update/delete): 10 requests per minute per user
-   **Read operations** (user listing): 60 requests per minute per user

## Implementation Details

### Rate Limiter Configuration

Rate limiters are configured in `app/Providers/AppServiceProvider.php`:

```php
protected function configureRateLimiting(): void
{
    // Login rate limiting - 5 attempts per minute per IP
    RateLimiter::for('login', function (Request $request) {
        return Limit::perMinute(5)->by($request->ip());
    });

    // API rate limiting - 60 requests per minute per user
    RateLimiter::for('api', function (Request $request) {
        return $request->user()
            ? Limit::perMinute(60)->by($request->user()->id)
            : Limit::perMinute(20)->by($request->ip());
    });

    // Sensitive operations - 10 requests per minute per user
    RateLimiter::for('sensitive-operations', function (Request $request) {
        return $request->user()
            ? Limit::perMinute(10)->by($request->user()->id)
            : Limit::perMinute(5)->by($request->ip());
    });
}
```

### Route Configuration

Rate limiting is applied to routes in `routes/api.php`:

```php
// Login with strict rate limiting
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:login');

// Protected routes with general API rate limiting
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    // User management with stricter rate limiting
    Route::middleware(['role:administrator', 'throttle:sensitive-operations'])->group(function () {
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });
});
```

### Error Handling

Rate limit exceptions are handled in `bootstrap/app.php`:

```php
$exceptions->render(function (ThrottleRequestsException $e, Request $request) {
    if ($request->expectsJson() || $request->is('api/*')) {
        return response()->json([
            'success' => false,
            'message' => 'Too many requests. Please try again later.',
            'error_code' => 'RATE_LIMIT_EXCEEDED',
            'retry_after' => $e->getHeaders()['Retry-After'] ?? null
        ], 429);
    }
});
```

## Rate Limiting Behavior

### Login Attempts

1. Users can make up to 5 failed login attempts per minute
2. After exceeding the limit, subsequent requests return HTTP 429
3. The rate limit is based on IP address to prevent account enumeration
4. Successful logins clear the rate limit counter for that IP

### API Requests

1. Authenticated users get higher rate limits than anonymous users
2. Write operations (create/update/delete) have stricter limits than read operations
3. Rate limits are applied per user ID for authenticated requests
4. Rate limits are applied per IP address for unauthenticated requests

### Error Responses

When rate limits are exceeded, the API returns:

```json
{
    "success": false,
    "message": "Too many requests. Please try again later.",
    "error_code": "RATE_LIMIT_EXCEEDED",
    "retry_after": 52
}
```

The `retry_after` field indicates how many seconds to wait before making another request.

## Testing

Rate limiting functionality is tested in `tests/Feature/RateLimitingTest.php`:

-   Tests login rate limiting blocks excessive attempts
-   Tests API endpoints have appropriate rate limiting
-   Tests user management operations have stricter rate limiting
-   Tests rate limit responses include retry-after information

## Security Benefits

1. **Brute Force Protection**: Limits login attempts to prevent password guessing
2. **DoS Protection**: Prevents overwhelming the server with excessive requests
3. **Resource Conservation**: Ensures fair usage of server resources
4. **Account Protection**: Prevents automated attacks on user accounts

## Monitoring and Logging

Rate limiting events are logged in the application logs:

-   Failed login attempts with rate limit information
-   Rate limit exceeded events with IP addresses and user information
-   Successful logins that clear rate limits

## Configuration

Rate limits can be adjusted by modifying the values in `AppServiceProvider.php`. Consider the following factors when setting limits:

-   **User Experience**: Don't make limits too restrictive for normal usage
-   **Security**: Ensure limits are low enough to prevent abuse
-   **Server Capacity**: Set limits based on server resources and expected load
-   **Business Requirements**: Consider legitimate use cases that might require higher limits

## Future Enhancements

Potential improvements to the rate limiting system:

1. **Dynamic Rate Limiting**: Adjust limits based on user behavior or system load
2. **Whitelist/Blacklist**: Allow certain IPs to bypass limits or block malicious IPs
3. **Rate Limit Headers**: Include rate limit information in response headers
4. **Redis Backend**: Use Redis for distributed rate limiting in multi-server setups
5. **User-Specific Limits**: Allow different limits for different user roles or subscription tiers

# Security Configuration Documentation

This document outlines the comprehensive security measures implemented in the User Management System to protect against common web vulnerabilities and attacks.

## Overview

The security implementation follows industry best practices and includes multiple layers of protection:

-   **CORS Configuration**: Controlled cross-origin resource sharing
-   **CSRF Protection**: Cross-site request forgery prevention
-   **Security Headers**: HTTP security headers to prevent common attacks
-   **Input Sanitization**: Server-side and client-side input validation and sanitization
-   **Rate Limiting**: Protection against brute force and DoS attacks
-   **Session Security**: Secure session management and token handling

## Backend Security Measures

### 1. CORS Configuration (`config/cors.php`)

```php
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:3000'),
    // Production URLs configured via environment
],
'allowed_headers' => [
    'Accept', 'Authorization', 'Content-Type',
    'X-Requested-With', 'X-CSRF-TOKEN', 'X-XSRF-TOKEN'
],
'supports_credentials' => true,
```

**Features:**

-   Restricted HTTP methods to only necessary ones
-   Environment-based origin configuration
-   Specific header allowlist
-   Credential support for authenticated requests

### 2. Security Headers Middleware (`app/Http/Middleware/SecurityHeaders.php`)

Automatically adds security headers to all responses:

-   `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
-   `X-Frame-Options: DENY` - Prevents clickjacking attacks
-   `X-XSS-Protection: 1; mode=block` - Enables XSS filtering
-   `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
-   `Content-Security-Policy` - Prevents code injection attacks
-   `Strict-Transport-Security` - Enforces HTTPS connections (production)

### 3. Input Sanitization Middleware (`app/Http/Middleware/SanitizeInput.php`)

Automatically sanitizes all API input:

-   Removes null bytes and control characters
-   Trims whitespace
-   Preserves password field integrity
-   Recursive sanitization for nested data

### 4. Enhanced Rate Limiting (`app/Providers/AppServiceProvider.php`)

Multiple rate limiting strategies:

```php
// Login attempts: 5 per minute per IP
RateLimiter::for('login', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip());
});

// API requests: 60 per minute per user
RateLimiter::for('api', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(60)->by($request->user()->id)
        : Limit::perMinute(20)->by($request->ip());
});

// Sensitive operations: 10 per minute per user
RateLimiter::for('sensitive-operations', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(10)->by($request->user()->id)
        : Limit::perMinute(5)->by($request->ip());
});
```

### 5. Enhanced Form Validation

#### Login Request (`app/Http/Requests/LoginRequest.php`)

-   Email format validation with DNS checking
-   Password validation with character restrictions
-   Input sanitization and logging

#### User Management Requests (`app/Http/Requests/BaseUserRequest.php`)

-   Name validation with international character support
-   Enhanced email validation with malicious pattern detection
-   Strong password requirements
-   Automatic input sanitization

### 6. Session Security Configuration

```env
SESSION_ENCRYPT=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
SESSION_SECURE_COOKIE=false  # Set to true in production with HTTPS
```

### 7. API Token Security (Sanctum)

```php
'expiration' => env('SANCTUM_TOKEN_EXPIRATION', 60 * 24), // 24 hours
'stateful' => array_filter(explode(',', env('SANCTUM_STATEFUL_DOMAINS', ...))),
```

## Frontend Security Measures

### 1. Security Headers in Nuxt Configuration

```typescript
app: {
  head: {
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { "http-equiv": "X-Content-Type-Options", content: "nosniff" },
      { "http-equiv": "X-Frame-Options", content: "DENY" },
      { "http-equiv": "X-XSS-Protection", content: "1; mode=block" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
    ],
  },
}
```

### 2. CSRF Protection (`composables/useCsrf.ts`)

-   Automatic CSRF token retrieval from Sanctum
-   Token validation for state-changing requests
-   Fallback token endpoints

### 3. Input Sanitization Utilities (`utils/security.ts`)

Client-side security utilities:

```typescript
// String sanitization
export const sanitizeString = (input: string): string => { ... }

// Email sanitization
export const sanitizeEmail = (email: string): string => { ... }

// Name sanitization with international support
export const sanitizeName = (name: string): string => { ... }

// Password strength validation
export const validatePasswordStrength = (password: string) => { ... }

// HTML escaping
export const escapeHtml = (text: string): string => { ... }

// URL safety checking
export const isSafeUrl = (url: string): boolean => { ... }

// Client-side rate limiting
export const createRateLimiter = (maxRequests: number, windowMs: number) => { ... }
```

### 4. API Security (`composables/useApi.ts`)

-   Automatic CSRF token inclusion
-   Request/response interceptors
-   Standardized error handling
-   Credential management
-   Request timeout configuration

## Environment Configuration

### Backend Environment Variables

```env
# Security Configuration
FRONTEND_URL=http://localhost:3000
PRODUCTION_FRONTEND_URL=
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SANCTUM_TOKEN_EXPIRATION=1440

# Session Security
SESSION_ENCRYPT=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
SESSION_SECURE_COOKIE=false

# Rate Limiting
THROTTLE_LOGIN_ATTEMPTS=5
THROTTLE_API_REQUESTS=60
THROTTLE_SENSITIVE_OPERATIONS=10
THROTTLE_GLOBAL_REQUESTS=100
```

### Frontend Environment Variables

```env
# Security Configuration
NUXT_PUBLIC_ENABLE_CSRF=true
NUXT_PUBLIC_API_TIMEOUT=10000
NUXT_PUBLIC_FRONTEND_URL="http://localhost:3000"

# Session Security
NUXT_SESSION_PASSWORD="your-secure-session-password-here"
```

## Security Best Practices Implemented

### 1. Defense in Depth

-   Multiple layers of security controls
-   Client-side and server-side validation
-   Input sanitization at multiple points

### 2. Principle of Least Privilege

-   Role-based access control
-   Minimal CORS permissions
-   Restricted API endpoints

### 3. Secure by Default

-   Security headers applied automatically
-   Input sanitization enabled by default
-   Strong password requirements

### 4. Monitoring and Logging

-   Failed login attempt logging
-   Validation failure logging
-   Rate limit exceeded logging
-   Security event tracking

## Production Deployment Considerations

### 1. HTTPS Configuration

```env
SESSION_SECURE_COOKIE=true
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 2. Environment-Specific Settings

-   Update CORS origins for production domains
-   Configure proper session domains
-   Set secure cookie flags
-   Enable HSTS headers

### 3. Additional Security Measures

-   Web Application Firewall (WAF)
-   DDoS protection
-   Regular security audits
-   Dependency vulnerability scanning

## Testing Security Measures

### 1. Rate Limiting Tests

```bash
# Test login rate limiting
for i in {1..10}; do curl -X POST http://localhost:8000/api/auth/login; done
```

### 2. CORS Tests

```bash
# Test CORS headers
curl -H "Origin: http://malicious-site.com" http://localhost:8000/api/users
```

### 3. Security Headers Tests

```bash
# Check security headers
curl -I http://localhost:8000/api/health
```

## Maintenance and Updates

### 1. Regular Security Reviews

-   Review and update security configurations quarterly
-   Monitor security advisories for dependencies
-   Update rate limiting thresholds based on usage patterns

### 2. Security Monitoring

-   Monitor failed authentication attempts
-   Track rate limiting violations
-   Review security logs regularly

### 3. Dependency Management

-   Keep all dependencies updated
-   Regular security vulnerability scans
-   Monitor for security patches

## Compliance and Standards

This security implementation addresses requirements from:

-   OWASP Top 10 Web Application Security Risks
-   NIST Cybersecurity Framework
-   ISO 27001 Security Controls
-   GDPR Data Protection Requirements

## Contact and Support

For security-related questions or to report vulnerabilities:

-   Review security logs in `storage/logs/laravel.log`
-   Check rate limiting status via API responses
-   Monitor application performance for security impacts

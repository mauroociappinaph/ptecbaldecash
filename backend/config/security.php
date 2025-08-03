<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Security Headers Configuration
    |--------------------------------------------------------------------------
    |
    | Configure security headers that will be applied to all responses
    | to protect against common web vulnerabilities.
    |
    */

    'headers' => [
        'x_content_type_options' => 'nosniff',
        'x_frame_options' => 'DENY',
        'x_xss_protection' => '1; mode=block',
        'referrer_policy' => 'strict-origin-when-cross-origin',
        'content_security_policy' => [
            'api' => "default-src 'none'; frame-ancestors 'none';",
            'web' => "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';",
        ],
        'strict_transport_security' => 'max-age=31536000; includeSubDomains; preload',
    ],

    /*
    |--------------------------------------------------------------------------
    | Input Sanitization Configuration
    |--------------------------------------------------------------------------
    |
    | Configure input sanitization rules and patterns for different
    | types of user input to prevent injection attacks.
    |
    */

    'sanitization' => [
        'remove_null_bytes' => true,
        'trim_whitespace' => true,
        'remove_control_characters' => true,
        'strip_tags_except_password' => true,
        'normalize_unicode' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Configuration
    |--------------------------------------------------------------------------
    |
    | Configure rate limiting thresholds for different types of requests
    | to prevent abuse and brute force attacks.
    |
    */

    'rate_limiting' => [
        'login_attempts' => env('THROTTLE_LOGIN_ATTEMPTS', 5),
        'api_requests' => env('THROTTLE_API_REQUESTS', 60),
        'sensitive_operations' => env('THROTTLE_SENSITIVE_OPERATIONS', 10),
        'global_requests' => env('THROTTLE_GLOBAL_REQUESTS', 100),
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Security Configuration
    |--------------------------------------------------------------------------
    |
    | Configure password security requirements and validation rules
    | to ensure strong password policies.
    |
    */

    'password' => [
        'min_length' => 8,
        'require_letters' => true,
        'require_mixed_case' => true,
        'require_numbers' => true,
        'require_symbols' => true,
        'check_compromised' => true,
        'max_length' => 255,
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Security Configuration
    |--------------------------------------------------------------------------
    |
    | Configure session security settings to protect user sessions
    | from hijacking and other session-based attacks.
    |
    */

    'session' => [
        'encrypt' => env('SESSION_ENCRYPT', true),
        'http_only' => env('SESSION_HTTP_ONLY', true),
        'secure' => env('SESSION_SECURE_COOKIE', false),
        'same_site' => env('SESSION_SAME_SITE', 'lax'),
        'lifetime' => env('SESSION_LIFETIME', 120),
    ],

    /*
    |--------------------------------------------------------------------------
    | API Token Security Configuration
    |--------------------------------------------------------------------------
    |
    | Configure API token security settings for Sanctum tokens
    | to ensure secure API authentication.
    |
    */

    'api_tokens' => [
        'expiration' => env('SANCTUM_TOKEN_EXPIRATION', 60 * 24), // 24 hours
        'prefix' => env('SANCTUM_TOKEN_PREFIX', ''),
        'prune_expired' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging Configuration
    |--------------------------------------------------------------------------
    |
    | Configure security-related logging to monitor and detect
    | potential security threats and attacks.
    |
    */

    'logging' => [
        'failed_logins' => true,
        'validation_failures' => true,
        'rate_limit_exceeded' => true,
        'authorization_failures' => true,
        'suspicious_activity' => true,
    ],

];

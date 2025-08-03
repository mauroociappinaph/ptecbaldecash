<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Configuration
    |--------------------------------------------------------------------------
    |
    | Configure rate limiting thresholds for different types of operations.
    | These values can be overridden via environment variables.
    |
    */

    'disabled' => env('THROTTLE_DISABLED', false),

    'login_attempts' => env('THROTTLE_LOGIN_ATTEMPTS', 5),
    'api_requests' => env('THROTTLE_API_REQUESTS', 60),
    'sensitive_operations' => env('THROTTLE_SENSITIVE_OPERATIONS', 10),
    'global_requests' => env('THROTTLE_GLOBAL_REQUESTS', 100),

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Multipliers
    |--------------------------------------------------------------------------
    |
    | These multipliers are used to calculate derived limits for different
    | user types and time windows.
    |
    */

    'multipliers' => [
        'unauthenticated_api_ratio' => 0.33, // 1/3 of authenticated limit
        'unauthenticated_sensitive_ratio' => 0.5, // 1/2 of authenticated limit
        'hourly_sensitive_multiplier' => 6, // 6x minute limit per hour
        'hourly_unauthenticated_multiplier' => 3, // 3x minute limit per hour
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Messages
    |--------------------------------------------------------------------------
    |
    | Customize error messages for different rate limiting scenarios.
    |
    */

    'messages' => [
        'login' => 'Too many login attempts. Please try again later.',
        'api' => 'Too many API requests. Please slow down.',
        'sensitive' => 'Too many sensitive operations. Please wait before trying again.',
        'global' => 'Too many requests from your IP. Please try again later.',
    ],
];

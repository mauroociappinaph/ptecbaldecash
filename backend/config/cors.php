<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    // API paths that should handle CORS requests
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // HTTP methods allowed for cross-origin requests
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_filter([
        env('FRONTEND_URL', 'http://localhost:3000'),
        // Development origins
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        // Production origins (HTTPS)
        env('APP_ENV') === 'production' ? env('PRODUCTION_FRONTEND_URL') : null,
        // Staging environment support
        env('APP_ENV') === 'staging' ? env('STAGING_FRONTEND_URL') : null,
    ]),

    'allowed_origins_patterns' => array_filter([
        // Allow localhost with any port for development
        env('APP_ENV') === 'local' ? '/^http:\/\/localhost:\d+$/' : null,
        env('APP_ENV') === 'local' ? '/^http:\/\/127\.0\.0\.1:\d+$/' : null,
    ]),

    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
    ],

    'exposed_headers' => [
        // Rate limiting headers
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        // Pagination headers for API responses
        'X-Total-Count',
        'X-Per-Page',
        'X-Current-Page',
        // API version header
        'X-API-Version',
    ],

    'max_age' => 86400, // 24 hours

    'supports_credentials' => true,

];

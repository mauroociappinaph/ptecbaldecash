<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only sanitize for API requests
        if ($request->is('api/*')) {
            $input = $request->all();
            $sanitized = $this->sanitizeArray($input);
            $request->replace($sanitized);
        }

        return $next($request);
    }

    /**
     * Recursively sanitize an array of input data
     */
    private function sanitizeArray(array $data): array
    {
        $sanitized = [];

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $sanitized[$key] = $this->sanitizeArray($value);
            } elseif (is_string($value)) {
                $sanitized[$key] = $this->sanitizeString($value);
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }

    /**
     * Sanitize a string value
     */
    private function sanitizeString(string $value): string
    {
        // Remove null bytes
        $value = str_replace("\0", '', $value);

        // Trim whitespace
        $value = trim($value);

        // Remove control characters except newlines and tabs
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);

        // For specific fields that should not contain HTML, strip tags
        if (request()->routeIs('api.auth.login') ||
            request()->routeIs('api.users.*')) {

            // Don't strip tags from password fields to preserve special characters
            $passwordFields = ['password', 'password_confirmation'];
            $currentField = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3)[2]['args'][0] ?? '';

            if (!in_array($currentField, $passwordFields)) {
                $value = strip_tags($value);
            }
        }

        return $value;
    }
}

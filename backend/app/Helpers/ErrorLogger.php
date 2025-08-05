<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Throwable;

class ErrorLogger
{
    /**
     * Log application errors with context
     */
    public static function logError(
        Throwable $exception,
        Request $request = null,
        array $additionalContext = []
    ): void {
        $context = [
            'exception' => [
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'code' => $exception->getCode(),
                'trace' => $exception->getTraceAsString(),
            ],
            'timestamp' => now()->toISOString(),
            'memory_usage' => self::formatBytes(memory_get_usage(true)),
            'peak_memory' => self::formatBytes(memory_get_peak_usage(true)),
        ];

        if ($request) {
            $context['request'] = [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'user_id' => $request->user()?->id,
                'headers' => self::sanitizeHeaders($request->headers->all()),
                'input' => self::sanitizeInput($request->all()),
            ];
        }

        $context = array_merge($context, $additionalContext);

        Log::channel('user_management')->error('Application error occurred', $context);

        // Log critical errors to a separate channel
        if (self::isCriticalError($exception)) {
            Log::channel('security')->critical('Critical error detected', $context);
        }
    }

    /**
     * Log performance issues
     */
    public static function logPerformanceIssue(
        string $operation,
        float $duration,
        array $context = []
    ): void {
        $logContext = [
            'operation' => $operation,
            'duration_ms' => round($duration, 2),
            'memory_usage' => self::formatBytes(memory_get_usage(true)),
            'timestamp' => now()->toISOString(),
        ];

        $logContext = array_merge($logContext, $context);

        if ($duration > 1000) { // Over 1 second
            Log::channel('user_management')->warning('Slow operation detected', $logContext);
        } else {
            Log::channel('user_management')->info('Performance metric', $logContext);
        }
    }

    /**
     * Log security events
     */
    public static function logSecurityEvent(
        string $event,
        Request $request = null,
        array $context = []
    ): void {
        $logContext = [
            'event' => $event,
            'timestamp' => now()->toISOString(),
        ];

        if ($request) {
            $logContext['request'] = [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'user_id' => $request->user()?->id,
            ];
        }

        $logContext = array_merge($logContext, $context);

        Log::channel('security')->warning('Security event', $logContext);
    }

    /**
     * Determine if an error is critical
     */
    private static function isCriticalError(Throwable $exception): bool
    {
        $criticalExceptions = [
            \Illuminate\Database\QueryException::class,
            \Symfony\Component\HttpKernel\Exception\HttpException::class,
        ];

        foreach ($criticalExceptions as $criticalException) {
            if ($exception instanceof $criticalException) {
                return true;
            }
        }

        return false;
    }

    /**
     * Sanitize request headers for logging
     */
    private static function sanitizeHeaders(array $headers): array
    {
        $sensitiveHeaders = ['authorization', 'cookie', 'x-csrf-token'];

        foreach ($sensitiveHeaders as $header) {
            if (isset($headers[$header])) {
                $headers[$header] = ['***REDACTED***'];
            }
        }

        return $headers;
    }

    /**
     * Sanitize request input for logging
     */
    private static function sanitizeInput(array $input): array
    {
        $sensitiveFields = ['password', 'password_confirmation', 'token'];

        foreach ($sensitiveFields as $field) {
            if (isset($input[$field])) {
                $input[$field] = '***REDACTED***';
            }
        }

        return $input;
    }

    /**
     * Format bytes to human readable format
     */
    private static function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}

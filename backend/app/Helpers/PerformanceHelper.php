<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PerformanceHelper
{
    /**
     * Monitor database query performance
     */
    public static function monitorQueries(): void
    {
        if (config('app.debug')) {
            DB::listen(function ($query) {
                // Log slow queries (over 100ms)
                if ($query->time > 100) {
                    Log::channel('user_management')->warning('Slow query detected', [
                        'sql' => $query->sql,
                        'bindings' => $query->bindings,
                        'time' => $query->time . 'ms',
                        'connection' => $query->connectionName,
                    ]);
                }
            });
        }
    }

    /**
     * Log memory usage
     */
    public static function logMemoryUsage(string $context = ''): void
    {
        if (config('app.debug')) {
            $memoryUsage = memory_get_usage(true);
            $peakMemory = memory_get_peak_usage(true);

            Log::channel('user_management')->info('Memory usage', [
                'context' => $context,
                'current_memory' => self::formatBytes($memoryUsage),
                'peak_memory' => self::formatBytes($peakMemory),
                'memory_limit' => ini_get('memory_limit'),
            ]);
        }
    }

    /**
     * Time execution of a callback
     */
    public static function timeExecution(callable $callback, string $operation = 'operation')
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage(true);

        $result = $callback();

        $endTime = microtime(true);
        $endMemory = memory_get_usage(true);

        $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds
        $memoryUsed = $endMemory - $startMemory;

        if ($executionTime > 50) { // Log operations taking more than 50ms
            Log::channel('user_management')->info('Performance metrics', [
                'operation' => $operation,
                'execution_time' => round($executionTime, 2) . 'ms',
                'memory_used' => self::formatBytes($memoryUsed),
                'timestamp' => now()->toISOString(),
            ]);
        }

        return $result;
    }

    /**
     * Format bytes to human readable format
     */
    private static function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    /**
     * Log API response times
     */
    public static function logApiResponse(string $endpoint, float $responseTime, int $statusCode): void
    {
        $logLevel = $responseTime > 1000 ? 'warning' : 'info'; // Warn if over 1 second

        Log::channel('user_management')->{$logLevel}('API response time', [
            'endpoint' => $endpoint,
            'response_time' => round($responseTime, 2) . 'ms',
            'status_code' => $statusCode,
            'timestamp' => now()->toISOString(),
        ]);
    }
}

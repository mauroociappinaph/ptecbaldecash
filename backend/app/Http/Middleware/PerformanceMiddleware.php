<?php

namespace App\Http\Middleware;

use App\Helpers\PerformanceHelper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PerformanceMiddleware
{
    /**
     * Handle an incoming request and monitor performance.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);

        $response = $next($request);

        $endTime = microtime(true);
        $responseTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

        // Log API response performance
        PerformanceHelper::logApiResponse(
            $request->getPathInfo(),
            $responseTime,
            $response->getStatusCode()
        );

        // Add performance headers in debug mode
        if (config('app.debug')) {
            $response->headers->set('X-Response-Time', round($responseTime, 2) . 'ms');
            $response->headers->set('X-Memory-Usage', $this->formatBytes(memory_get_peak_usage(true)));
        }

        return $response;
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}

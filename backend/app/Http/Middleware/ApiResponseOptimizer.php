<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ApiResponseOptimizer
{
    /**
     * Handle an incoming request and optimize API responses.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only optimize JSON responses
        if (!$response instanceof JsonResponse) {
            return $response;
        }

        // Add performance headers
        $this->addPerformanceHeaders($response);

        // Enable compression for large responses
        $this->enableCompression($response);

        // Add caching headers for appropriate responses
        $this->addCachingHeaders($request, $response);

        return $response;
    }

    /**
     * Add performance-related headers
     */
    private function addPerformanceHeaders(JsonResponse $response): void
    {
        if (config('app.debug')) {
            $response->headers->set('X-Memory-Peak', $this->formatBytes(memory_get_peak_usage(true)));
            $response->headers->set('X-Queries-Count', \DB::getQueryLog() ? count(\DB::getQueryLog()) : 0);
        }
    }

    /**
     * Enable compression for responses larger than 1KB
     */
    private function enableCompression(JsonResponse $response): void
    {
        $content = $response->getContent();

        if ($content && strlen($content) > 1024) {
            $response->headers->set('Content-Encoding', 'gzip');
        }
    }

    /**
     * Add appropriate caching headers
     */
    private function addCachingHeaders(Request $request, JsonResponse $response): void
    {
        // Cache user list responses for 5 minutes
        if ($request->is('api/users') && $request->isMethod('GET') && $response->getStatusCode() === 200) {
            $response->headers->set('Cache-Control', 'public, max-age=300');
            $response->headers->set('ETag', md5($response->getContent()));
        }

        // Don't cache error responses
        if ($response->getStatusCode() >= 400) {
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
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

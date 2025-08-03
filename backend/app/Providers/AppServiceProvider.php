<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        if ($this->shouldSkipRateLimiting()) {
            $this->configureTestingRateLimits();
            return;
        }

        $this->configureProductionRateLimits();
    }

    /**
     * Determine if rate limiting should be skipped.
     */
    private function shouldSkipRateLimiting(): bool
    {
        return app()->environment('testing') || config('throttle.disabled', false);
    }

    /**
     * Configure rate limits for testing environment.
     */
    private function configureTestingRateLimits(): void
    {
        $limiters = ['login', 'api', 'user-management', 'sensitive-operations', 'global'];

        foreach ($limiters as $limiter) {
            RateLimiter::for($limiter, fn() => Limit::none());
        }
    }

    /**
     * Configure rate limits for production environment.
     */
    private function configureProductionRateLimits(): void
    {
        $rateLimiters = [
            'login' => $this->configureLoginRateLimit(),
            'api' => $this->configureApiRateLimit(),
            'user-management' => $this->configureUserManagementRateLimit(),
            'sensitive-operations' => $this->configureSensitiveOperationsRateLimit(),
            'global' => $this->configureGlobalRateLimit(),
        ];

        foreach ($rateLimiters as $name => $callback) {
            RateLimiter::for($name, $callback);
        }
    }

    /**
     * Configure login rate limiting with progressive delays.
     */
    private function configureLoginRateLimit(): callable
    {
        return function (Request $request) {
            $attempts = config('throttle.login_attempts');

            return [
                Limit::perMinute($attempts)->by($request->ip()),
                Limit::perMinute(1)->by($request->ip())
                    ->response($this->createRateLimitResponse(config('throttle.messages.login')))
            ];
        };
    }

    /**
     * Configure API rate limiting with different limits for authenticated/unauthenticated users.
     */
    private function configureApiRateLimit(): callable
    {
        return function (Request $request) {
            $authenticatedLimit = config('throttle.api_requests');
            $unauthenticatedRatio = config('throttle.multipliers.unauthenticated_api_ratio');
            $unauthenticatedLimit = (int) ($authenticatedLimit * $unauthenticatedRatio);

            return $request->user()
                ? Limit::perMinute($authenticatedLimit)->by($request->user()->id)
                : Limit::perMinute($unauthenticatedLimit)->by($request->ip());
        };
    }

    /**
     * Configure user management operations rate limiting.
     */
    private function configureUserManagementRateLimit(): callable
    {
        return function (Request $request) {
            return $request->user()
                ? Limit::perMinute(30)->by($request->user()->id)
                : Limit::perMinute(10)->by($request->ip());
        };
    }

    /**
     * Configure sensitive operations rate limiting with both minute and hourly limits.
     */
    private function configureSensitiveOperationsRateLimit(): callable
    {
        return function (Request $request) {
            $minuteLimit = config('throttle.sensitive_operations');
            $hourlyMultiplier = config('throttle.multipliers.hourly_sensitive_multiplier');
            $unauthenticatedRatio = config('throttle.multipliers.unauthenticated_sensitive_ratio');
            $unauthenticatedHourlyMultiplier = config('throttle.multipliers.hourly_unauthenticated_multiplier');

            return $request->user()
                ? [
                    Limit::perMinute($minuteLimit)->by($request->user()->id),
                    Limit::perHour($minuteLimit * $hourlyMultiplier)->by($request->user()->id),
                ]
                : [
                    Limit::perMinute((int) ($minuteLimit * $unauthenticatedRatio))->by($request->ip()),
                    Limit::perHour($minuteLimit * $unauthenticatedHourlyMultiplier)->by($request->ip()),
                ];
        };
    }

    /**
     * Configure global rate limiting for unauthenticated requests.
     */
    private function configureGlobalRateLimit(): callable
    {
        return function (Request $request) {
            $limit = config('throttle.global_requests');
            return Limit::perMinute($limit)->by($request->ip());
        };
    }

    /**
     * Create a standardized rate limit response.
     */
    private function createRateLimitResponse(string $message, string $errorCode = 'RATE_LIMIT_EXCEEDED'): \Closure
    {
        return function () use ($message, $errorCode) {
            return response()->json([
                'success' => false,
                'message' => $message,
                'error_code' => $errorCode,
                'retry_after' => request()->header('Retry-After')
            ], 429);
        };
    }
}

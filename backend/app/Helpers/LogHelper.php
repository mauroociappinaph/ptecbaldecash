<?php

namespace App\Helpers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogHelper
{
    private array $context = [];
    private string $channel = 'default';
    private string $level = 'info';

    /**
     * Create a new log builder instance.
     */
    public static function make(): self
    {
        return new self();
    }

    /**
     * Set the log channel.
     */
    public function channel(string $channel): self
    {
        $this->channel = $channel;
        return $this;
    }

    /**
     * Set the log level.
     */
    public function level(string $level): self
    {
        $this->level = $level;
        return $this;
    }

    /**
     * Add context data.
     */
    public function with(array $context): self
    {
        $this->context = array_merge($this->context, $context);
        return $this;
    }

    /**
     * Add request context automatically.
     */
    public function withRequest(?Request $request = null): self
    {
        $request = $request ?? request();

        if ($request) {
            $this->context = array_merge($this->context, [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'user_id' => auth()->id(),
            ]);
        }

        return $this;
    }

    /**
     * Log the message with accumulated context.
     */
    public function log(string $message): void
    {
        $baseContext = [
            'timestamp' => now()->toISOString(),
        ];

        $finalContext = array_merge($baseContext, $this->context);

        Log::channel($this->channel)->{$this->level}($message, $finalContext);
    }

    /**
     * Log user management activities.
     */
    public static function logUserActivity(string $action, array $context = []): void
    {
        self::make()
            ->channel('user_management')
            ->with(['action' => $action])
            ->with($context)
            ->log($action);
    }

    /**
     * Log security-related events.
     */
    public static function logSecurityEvent(string $event, array $context = []): void
    {
        $baseContext = [
            'timestamp' => now()->toISOString(),
            'event' => $event,
            'ip' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ];

        Log::channel('security')->warning($event, array_merge($baseContext, $context));
    }

    /**
     * Log authentication events.
     */
    public static function logAuthEvent(string $event, ?int $userId = null, array $context = []): void
    {
        $baseContext = [
            'timestamp' => now()->toISOString(),
            'event' => $event,
            'user_id' => $userId,
            'ip' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ];

        Log::channel('security')->info($event, array_merge($baseContext, $context));
    }

    /**
     * Log API errors with request context.
     */
    public static function logApiError(string $message, \Throwable $exception, ?Request $request = null): void
    {
        $request = $request ?? request();

        $context = [
            'timestamp' => now()->toISOString(),
            'exception' => get_class($exception),
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'url' => $request?->fullUrl(),
            'method' => $request?->method(),
            'ip' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'user_id' => auth()->id(),
            'request_data' => $request?->except(['password', 'password_confirmation', 'current_password']),
        ];

        Log::error($message, $context);
    }

    /**
     * Log validation errors.
     */
    public static function logValidationError(string $action, array $errors, ?Request $request = null): void
    {
        $request = $request ?? request();

        $context = [
            'timestamp' => now()->toISOString(),
            'action' => $action,
            'validation_errors' => $errors,
            'url' => $request?->fullUrl(),
            'method' => $request?->method(),
            'ip' => $request?->ip(),
            'user_id' => auth()->id(),
            'request_data' => $request?->except(['password', 'password_confirmation', 'current_password']),
        ];

        Log::warning('Validation failed: ' . $action, $context);
    }

    /**
     * Log rate limiting events.
     */
    public static function logRateLimitExceeded(string $endpoint, ?Request $request = null): void
    {
        $request = $request ?? request();

        $context = [
            'timestamp' => now()->toISOString(),
            'endpoint' => $endpoint,
            'ip' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'user_id' => auth()->id(),
        ];

        self::logSecurityEvent('Rate limit exceeded', $context);
    }

    /**
     * Log unauthorized access attempts.
     */
    public static function logUnauthorizedAccess(string $resource, ?Request $request = null): void
    {
        $request = $request ?? request();

        $context = [
            'timestamp' => now()->toISOString(),
            'resource' => $resource,
            'url' => $request?->fullUrl(),
            'method' => $request?->method(),
            'ip' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'user_id' => auth()->id(),
            'user_role' => auth()->user()?->role?->value,
        ];

        self::logSecurityEvent('Unauthorized access attempt', $context);
    }
}

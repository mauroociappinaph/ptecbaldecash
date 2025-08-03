<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Throwable;
use Illuminate\Support\Facades\Log;
use App\Exceptions\UserManagementException;
use App\Exceptions\EmailDeliveryException;
use App\Exceptions\RolePermissionException;

class Handler extends ExceptionHandler
{
    /**
     * HTTP status codes for different exception types.
     */
    private const HTTP_STATUS_CODES = [
        'validation' => 422,
        'unauthenticated' => 401,
        'unauthorized' => 403,
        'not_found' => 404,
        'method_not_allowed' => 405,
        'conflict' => 409,
        'internal_server_error' => 500,
    ];

    /**
     * Error codes for API responses.
     */
    private const ERROR_CODES = [
        'validation' => 'VALIDATION_ERROR',
        'unauthenticated' => 'UNAUTHENTICATED',
        'unauthorized' => 'UNAUTHORIZED',
        'not_found' => 'RESOURCE_NOT_FOUND',
        'route_not_found' => 'NOT_FOUND',
        'method_not_allowed' => 'METHOD_NOT_ALLOWED',
        'duplicate_entry' => 'DUPLICATE_ENTRY',
        'foreign_key_constraint' => 'FOREIGN_KEY_CONSTRAINT',
        'database_error' => 'DATABASE_ERROR',
        'http_error' => 'HTTP_ERROR',
        'internal_server_error' => 'INTERNAL_SERVER_ERROR',
    ];

    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            // Log all exceptions with context
            Log::error('Exception occurred', [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'url' => request()->fullUrl(),
                'method' => request()->method(),
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'user_id' => auth()->id(),
            ]);
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e): Response|JsonResponse
    {
        // Handle API requests with JSON responses
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    /**
     * Convert a validation exception into a JSON response.
     */
    protected function invalidJson($request, ValidationException $exception): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $exception->getMessage(),
            'errors' => $exception->errors(),
            'error_code' => self::ERROR_CODES['validation']
        ], $exception->status);
    }

    /**
     * Handle API exceptions and return appropriate JSON responses.
     */
    protected function handleApiException(Request $request, Throwable $e): JsonResponse
    {
        // Validation Exception
        if ($e instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'error_code' => self::ERROR_CODES['validation']
            ], self::HTTP_STATUS_CODES['validation']);
        }

        // Authentication Exception
        if ($e instanceof AuthenticationException) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required',
                'error_code' => self::ERROR_CODES['unauthenticated']
            ], self::HTTP_STATUS_CODES['unauthenticated']);
        }

        // Authorization Exception
        if ($e instanceof AuthorizationException) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to perform this action',
                'error_code' => self::ERROR_CODES['unauthorized']
            ], self::HTTP_STATUS_CODES['unauthorized']);
        }

        // Model Not Found Exception
        if ($e instanceof ModelNotFoundException) {
            $model = class_basename($e->getModel());
            return response()->json([
                'success' => false,
                'message' => "{$model} not found",
                'error_code' => self::ERROR_CODES['not_found']
            ], self::HTTP_STATUS_CODES['not_found']);
        }

        // Not Found HTTP Exception
        if ($e instanceof NotFoundHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'The requested resource was not found',
                'error_code' => self::ERROR_CODES['route_not_found']
            ], self::HTTP_STATUS_CODES['not_found']);
        }

        // Method Not Allowed Exception
        if ($e instanceof MethodNotAllowedHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'Method not allowed',
                'error_code' => self::ERROR_CODES['method_not_allowed']
            ], self::HTTP_STATUS_CODES['method_not_allowed']);
        }

        // Database Query Exception
        if ($e instanceof QueryException) {
            // Log the actual database error for debugging
            Log::error('Database query error', [
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
                'error' => $e->getMessage()
            ]);

            // Check for specific database errors
            $errorCode = $e->getCode();
            $message = 'Database error occurred';

            // Handle common database errors
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                $message = 'A record with this information already exists';
                $statusCode = self::HTTP_STATUS_CODES['conflict'];
                $errorCode = self::ERROR_CODES['duplicate_entry'];
            } elseif (str_contains($e->getMessage(), 'foreign key constraint')) {
                $message = 'Cannot perform this action due to related data';
                $statusCode = self::HTTP_STATUS_CODES['conflict'];
                $errorCode = self::ERROR_CODES['foreign_key_constraint'];
            } else {
                $statusCode = self::HTTP_STATUS_CODES['internal_server_error'];
                $errorCode = self::ERROR_CODES['database_error'];
            }

            return response()->json([
                'success' => false,
                'message' => $message,
                'error_code' => $errorCode
            ], $statusCode);
        }

        // Custom Application Exceptions
        if ($e instanceof UserManagementException ||
            $e instanceof EmailDeliveryException ||
            $e instanceof RolePermissionException) {
            return $e->render();
        }

        // HTTP Exception
        if ($e instanceof HttpException) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'An error occurred',
                'error_code' => self::ERROR_CODES['http_error']
            ], $e->getStatusCode());
        }

        // Generic Exception
        return $this->handleGenericException($e);
    }

    /**
     * Create a standardized error response.
     */
    protected function createErrorResponse(
        string $message,
        string $errorCode,
        int $statusCode,
        array $additionalData = []
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
            'error_code' => $errorCode,
        ];

        if (!empty($additionalData)) {
            $response = array_merge($response, $additionalData);
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Handle generic exceptions.
     */
    protected function handleGenericException(Throwable $e): JsonResponse
    {
        $statusCode = self::HTTP_STATUS_CODES['internal_server_error'];
        $message = 'An unexpected error occurred';
        $errorCode = self::ERROR_CODES['internal_server_error'];

        // In development, show more detailed error information
        if (config('app.debug')) {
            $message = $e->getMessage();
            $response = [
                'success' => false,
                'message' => $message,
                'error_code' => $errorCode,
                'debug' => [
                    'exception' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTrace()
                ]
            ];
        } else {
            $response = [
                'success' => false,
                'message' => $message,
                'error_code' => $errorCode
            ];
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Convert an authentication exception into a response.
     */
    protected function unauthenticated($request, AuthenticationException $exception): Response|JsonResponse
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required',
                'error_code' => self::ERROR_CODES['unauthenticated']
            ], self::HTTP_STATUS_CODES['unauthenticated']);
        }

        return redirect()->guest($exception->redirectTo() ?? route('login'));
    }
}

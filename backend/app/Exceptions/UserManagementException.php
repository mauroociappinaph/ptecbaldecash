<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class UserManagementException extends Exception
{
    protected $errorCode;
    protected $statusCode;

    public function __construct(string $message, string $errorCode = 'USER_MANAGEMENT_ERROR', int $statusCode = 400)
    {
        parent::__construct($message);
        $this->errorCode = $errorCode;
        $this->statusCode = $statusCode;
    }

    /**
     * Render the exception as an HTTP response.
     */
    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'error_code' => $this->errorCode
        ], $this->statusCode);
    }

    /**
     * Get the error code.
     */
    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    /**
     * Get the HTTP status code.
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}

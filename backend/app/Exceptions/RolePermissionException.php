<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class RolePermissionException extends Exception
{
    public function __construct(string $message = 'Insufficient permissions for this action')
    {
        parent::__construct($message);
    }

    /**
     * Render the exception as an HTTP response.
     */
    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'error_code' => 'INSUFFICIENT_PERMISSIONS'
        ], 403);
    }
}

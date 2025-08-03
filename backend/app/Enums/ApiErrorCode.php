<?php

namespace App\Enums;

enum ApiErrorCode: string
{
    case VALIDATION_ERROR = 'VALIDATION_ERROR';
    case UNAUTHENTICATED = 'UNAUTHENTICATED';
    case UNAUTHORIZED = 'UNAUTHORIZED';
    case INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS';
    case RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND';
    case NOT_FOUND = 'NOT_FOUND';
    case METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED';
    case EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS';
    case SELF_DELETION_NOT_ALLOWED = 'SELF_DELETION_NOT_ALLOWED';
    case DUPLICATE_ENTRY = 'DUPLICATE_ENTRY';
    case FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT';
    case DATABASE_ERROR = 'DATABASE_ERROR';
    case HTTP_ERROR = 'HTTP_ERROR';
    case INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR';
    case ACCOUNT_DEACTIVATED = 'ACCOUNT_DEACTIVATED';
    case INVALID_MIDDLEWARE_CONFIG = 'INVALID_MIDDLEWARE_CONFIG';
    case INVALID_ROLE_CONFIG = 'INVALID_ROLE_CONFIG';
    case MIDDLEWARE_ERROR = 'MIDDLEWARE_ERROR';

    /**
     * Get the HTTP status code for this error.
     */
    public function getHttpStatus(): int
    {
        return match ($this) {
            self::VALIDATION_ERROR, self::SELF_DELETION_NOT_ALLOWED => 422,
            self::UNAUTHENTICATED => 401,
            self::UNAUTHORIZED, self::INSUFFICIENT_PERMISSIONS,
            self::ACCOUNT_DEACTIVATED, self::INVALID_ROLE_CONFIG => 403,
            self::RESOURCE_NOT_FOUND, self::NOT_FOUND => 404,
            self::METHOD_NOT_ALLOWED => 405,
            self::EMAIL_ALREADY_EXISTS, self::DUPLICATE_ENTRY,
            self::FOREIGN_KEY_CONSTRAINT => 409,
            default => 500,
        };
    }

    /**
     * Get a user-friendly message for this error.
     */
    public function getMessage(): string
    {
        return match ($this) {
            self::VALIDATION_ERROR => 'Validation failed',
            self::UNAUTHENTICATED => 'Authentication required',
            self::UNAUTHORIZED => 'You are not authorized to perform this action',
            self::INSUFFICIENT_PERMISSIONS => 'You do not have permission to access this resource',
            self::RESOURCE_NOT_FOUND => 'The requested resource was not found',
            self::NOT_FOUND => 'The requested resource was not found',
            self::METHOD_NOT_ALLOWED => 'Method not allowed',
            self::EMAIL_ALREADY_EXISTS => 'A user with this email address already exists',
            self::SELF_DELETION_NOT_ALLOWED => 'You cannot delete your own account',
            self::DUPLICATE_ENTRY => 'A record with this information already exists',
            self::FOREIGN_KEY_CONSTRAINT => 'Cannot perform this action due to related data',
            self::DATABASE_ERROR => 'Database error occurred',
            self::HTTP_ERROR => 'An error occurred',
            self::INTERNAL_SERVER_ERROR => 'An unexpected error occurred',
            self::ACCOUNT_DEACTIVATED => 'Account has been deactivated',
            self::INVALID_MIDDLEWARE_CONFIG => 'No roles specified for access control',
            self::INVALID_ROLE_CONFIG => 'Access denied. Invalid role configuration',
            self::MIDDLEWARE_ERROR => 'An error occurred while checking permissions',
        };
    }
}

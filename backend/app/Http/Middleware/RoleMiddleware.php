<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Exceptions\RolePermissionException;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Role-based access control middleware.
 *
 * This middleware checks if the authenticated user has one of the required roles
 * to access a protected route. It supports multiple roles and case-insensitive
 * role matching.
 *
 * Usage examples:
 * - Route::middleware('role:administrator')->group(function () { ... });
 * - Route::middleware('role:administrator,reviewer')->group(function () { ... });
 * - Route::get('/admin', [Controller::class, 'method'])->middleware('role:administrator');
 *
 * @package App\Http\Middleware
 */
class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        try {
            // Validate that roles are provided
            if (empty($roles)) {
                Log::error('RoleMiddleware: No roles specified for access control', [
                    'route' => $request->route()?->getName() ?? $request->path(),
                    'method' => $request->method()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'No roles specified for access control',
                    'error_code' => 'INVALID_MIDDLEWARE_CONFIG'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            // Check if user is authenticated
            if (!$request->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required',
                    'error_code' => 'UNAUTHENTICATED'
                ], Response::HTTP_UNAUTHORIZED);
            }

            $user = $request->user();

            // Check if user account is soft deleted
            if ($user->trashed()) {
                Log::warning('Soft deleted user attempted access', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'route' => $request->route()?->getName() ?? $request->path()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Account has been deactivated',
                    'error_code' => 'ACCOUNT_DEACTIVATED'
                ], Response::HTTP_FORBIDDEN);
            }

            // Convert string roles to UserRole enums for comparison
            $allowedRoles = collect($roles)
                ->map(fn($role) => $this->convertStringToRole($role))
                ->filter();

            // Check if any valid roles were provided
            if ($allowedRoles->isEmpty()) {
                Log::warning('RoleMiddleware: No valid roles found', [
                    'provided_roles' => $roles,
                    'user_id' => $user->id,
                    'route' => $request->route()?->getName() ?? $request->path()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Invalid role configuration',
                    'error_code' => 'INVALID_ROLE_CONFIG'
                ], Response::HTTP_FORBIDDEN);
            }

            // Check if user has any of the required roles
            if (!$allowedRoles->contains($user->role)) {
                Log::info('RoleMiddleware: Access denied for user', [
                    'user_id' => $user->id,
                    'user_role' => $user->role->value,
                    'required_roles' => $allowedRoles->map(fn($role) => $role->value)->toArray(),
                    'route' => $request->route()?->getName() ?? $request->path(),
                    'ip' => $request->ip()
                ]);

                throw new RolePermissionException(
                    'You do not have permission to access this resource'
                );
            }

        } catch (RolePermissionException $e) {
            // Let the exception handler format the response
            throw $e;
        } catch (\Exception $e) {
            Log::error('Unexpected error in RoleMiddleware', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()?->id,
                'route' => $request->route()?->getName() ?? $request->path(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while checking permissions',
                'error_code' => 'MIDDLEWARE_ERROR'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $next($request);
    }

    /**
     * Convert a string role to UserRole enum.
     *
     * This method supports both the enum value ('administrator', 'reviewer')
     * and common variations for better developer experience.
     *
     * @param string $role
     * @return UserRole|null
     */
    private function convertStringToRole(string $role): ?UserRole
    {
        $normalizedRole = strtolower(trim($role));

        // Try direct enum conversion first
        $enumRole = UserRole::tryFrom($normalizedRole);
        if ($enumRole) {
            return $enumRole;
        }

        // Handle common variations
        return match ($normalizedRole) {
            'admin' => UserRole::ADMINISTRATOR,
            'review' => UserRole::REVIEWER,
            default => null,
        };
    }
}

<?php

namespace App\Services;

use App\Enums\UserRole;
use Illuminate\Support\Collection;

class RoleService
{
    /**
     * Convert string roles to UserRole enums.
     */
    public static function convertStringRolesToEnums(array $roles): Collection
    {
        return collect($roles)
            ->map(fn($role) => self::convertStringToRole($role))
            ->filter();
    }

    /**
     * Convert a string role to UserRole enum.
     */
    public static function convertStringToRole(string $role): ?UserRole
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

    /**
     * Check if user has any of the required roles.
     */
    public static function userHasAnyRole($user, Collection $allowedRoles): bool
    {
        return $allowedRoles->contains($user->role);
    }

    /**
     * Validate that roles are provided and valid.
     */
    public static function validateRoles(array $roles): array
    {
        if (empty($roles)) {
            return ['error' => 'No roles specified for access control'];
        }

        $allowedRoles = self::convertStringRolesToEnums($roles);

        if ($allowedRoles->isEmpty()) {
            return ['error' => 'No valid roles found', 'provided_roles' => $roles];
        }

        return ['roles' => $allowedRoles];
    }
}

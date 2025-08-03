<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMINISTRATOR = 'administrator';
    case REVIEWER = 'reviewer';

    /**
     * Get all role values as an array
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get role display name
     */
    public function label(): string
    {
        return match($this) {
            self::ADMINISTRATOR => 'Administrator',
            self::REVIEWER => 'Reviewer',
        };
    }

    /**
     * Check if role has administrative privileges
     */
    public function isAdministrator(): bool
    {
        return $this === self::ADMINISTRATOR;
    }

    /**
     * Check if role is reviewer
     */
    public function isReviewer(): bool
    {
        return $this === self::REVIEWER;
    }
}

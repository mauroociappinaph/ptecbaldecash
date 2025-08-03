<?php

namespace App\Transformers;

use App\Models\User;

class UserTransformer
{
    /**
     * Transform user data for API response.
     */
    public static function transform(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role->value,
            'full_name' => $user->full_name,
            'created_at' => $user->created_at?->toISOString(),
            'updated_at' => $user->updated_at?->toISOString(),
        ];
    }

    /**
     * Transform user data for authentication response.
     */
    public static function transformForAuth(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role->value,
            'full_name' => $user->full_name,
        ];
    }

    /**
     * Transform collection of users.
     */
    public static function transformCollection(iterable $users): array
    {
        return array_map([self::class, 'transform'],
            is_array($users) ? $users : $users->toArray()
        );
    }

    /**
     * Transform user data for public display (hide sensitive info).
     */
    public static function transformPublic(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'last_name' => $user->last_name,
            'full_name' => $user->full_name,
            'role' => $user->role->value,
        ];
    }
}

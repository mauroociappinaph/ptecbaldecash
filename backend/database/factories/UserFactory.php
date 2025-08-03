<?php

namespace Database\Factories;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => fake()->randomElement(UserRole::cases()),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create a user with administrator role.
     */
    public function administrator(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::ADMINISTRATOR,
        ]);
    }

    /**
     * Create a user with reviewer role.
     */
    public function reviewer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::REVIEWER,
        ]);
    }

    /**
     * Create users with balanced role distribution.
     * Useful for seeding with predictable role ratios.
     */
    public function balancedRoles(): static
    {
        static $counter = 0;
        $counter++;

        // Create 80% reviewers, 20% administrators for realistic distribution
        $role = ($counter % 5 === 0) ? UserRole::ADMINISTRATOR : UserRole::REVIEWER;

        return $this->state(fn (array $attributes) => [
            'role' => $role,
        ]);
    }

    /**
     * Create users with varied passwords for more realistic test data.
     */
    public function withVariedPasswords(): static
    {
        return $this->state(fn (array $attributes) => [
            'password' => Hash::make(fake()->password(8, 20)),
        ]);
    }
}

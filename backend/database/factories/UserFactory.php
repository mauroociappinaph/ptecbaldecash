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
     * Uses reviewer role by default for more predictable testing.
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
            'role' => UserRole::REVIEWER, // Default to reviewer for predictable testing
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
     * Creates 80% reviewers and 20% administrators by default.
     *
     * @param int $reviewerRatio Number of reviewers per administrator (default: 4)
     * @return static
     */
    public function balancedRoles(int $reviewerRatio = 4): static
    {
        $sequence = [];

        // Add reviewers based on ratio
        for ($i = 0; $i < $reviewerRatio; $i++) {
            $sequence[] = ['role' => UserRole::REVIEWER];
        }

        // Add one administrator
        $sequence[] = ['role' => UserRole::ADMINISTRATOR];

        return $this->sequence(...$sequence);
    }

    /**
     * Create users with varied passwords for more realistic test data.
     *
     * @param int $minLength Minimum password length (default: 8)
     * @param int $maxLength Maximum password length (default: 20)
     * @return static
     */
    public function withVariedPasswords(int $minLength = 8, int $maxLength = 20): static
    {
        return $this->state(fn (array $attributes) => [
            'password' => Hash::make(fake()->password($minLength, $maxLength)),
        ]);
    }

    /**
     * Create users with a specific password for testing.
     *
     * @param string $password Plain text password to hash
     * @return static
     */
    public function withPassword(string $password): static
    {
        return $this->state(fn (array $attributes) => [
            'password' => Hash::make($password),
        ]);
    }

    /**
     * Create users with weak passwords for security testing.
     *
     * @return static
     */
    public function withWeakPasswords(): static
    {
        $weakPasswords = ['123456', 'password', 'admin', 'test', '12345678'];

        return $this->state(fn (array $attributes) => [
            'password' => Hash::make(fake()->randomElement($weakPasswords)),
        ]);
    }

    /**
     * Create users with realistic corporate email domains.
     *
     * @return static
     */
    public function withCorporateEmails(): static
    {
        $domains = ['company.com', 'corp.org', 'business.net', 'enterprise.co'];

        return $this->state(fn (array $attributes) => [
            'email' => fake()->unique()->userName() . '@' . fake()->randomElement($domains),
        ]);
    }

    /**
     * Create users with specific name patterns for testing search functionality.
     *
     * @return static
     */
    public function withSearchableNames(): static
    {
        $firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa'];
        $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];

        return $this->state(fn (array $attributes) => [
            'name' => fake()->randomElement($firstNames),
            'last_name' => fake()->randomElement($lastNames),
        ]);
    }

    /**
     * Create users for performance testing with minimal data.
     *
     * @return static
     */
    public function minimal(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'User',
            'last_name' => fake()->numberBetween(1, 10000),
            'email' => 'user' . fake()->unique()->numberBetween(1, 100000) . '@test.com',
            'remember_token' => null,
        ]);
    }

    /**
     * Create users with soft-deleted state for testing deletion functionality.
     *
     * @return static
     */
    public function deleted(): static
    {
        return $this->state(fn (array $attributes) => [
            'deleted_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ]);
    }

    /**
     * Create users with random role distribution.
     * Useful when you need unpredictable role assignment.
     *
     * @return static
     */
    public function withRandomRoles(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => fake()->randomElement(UserRole::cases()),
        ]);
    }
}

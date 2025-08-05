<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a default administrator for testing
        User::factory()->administrator()->create([
            'name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create a default reviewer for testing
        User::factory()->reviewer()->create([
            'name' => 'Reviewer',
            'last_name' => 'User',
            'email' => 'reviewer@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create 98 additional users with balanced role distribution
        // This will create approximately 78 reviewers and 20 administrators
        User::factory()
            ->count(98)
            ->balancedRoles() // Uses default 4:1 ratio
            ->withCorporateEmails()
            ->create();
    }
}

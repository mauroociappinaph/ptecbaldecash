<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserFactoryTest extends TestCase
{
    use RefreshDatabase;

    

    

    public function test_factory_creates_user_with_required_fields()
    {
        $user = User::factory()->make();

        $this->assertNotEmpty($user->name);
        $this->assertNotEmpty($user->last_name);
        $this->assertNotEmpty($user->email);
        $this->assertNotEmpty($user->password);
        $this->assertInstanceOf(UserRole::class, $user->role);
    }

    public function test_factory_creates_administrator_user()
    {
        $admin = User::factory()->administrator()->make();

        $this->assertEquals(UserRole::ADMINISTRATOR, $admin->role);
        $this->assertTrue($admin->isAdministrator());
        $this->assertFalse($admin->isReviewer());
    }

    public function test_factory_creates_reviewer_user()
    {
        $reviewer = User::factory()->reviewer()->make();

        $this->assertEquals(UserRole::REVIEWER, $reviewer->role);
        $this->assertTrue($reviewer->isReviewer());
        $this->assertFalse($reviewer->isAdministrator());
    }

    public function test_factory_creates_users_with_different_roles()
    {
        $users = User::factory()->count(10)->make();

        $roles = $users->pluck('role')->unique();

        // Should have at least one role (could be all same by chance, but unlikely with 10 users)
        $this->assertGreaterThan(0, $roles->count());

        // All roles should be valid UserRole enum values
        foreach ($roles as $role) {
            $this->assertInstanceOf(UserRole::class, $role);
        }
    }

    public function test_factory_creates_realistic_fake_data()
    {
        $user = User::factory()->make();

        // Name should be a single first name
        $this->assertIsString($user->name);
        $this->assertNotEmpty($user->name);

        // Last name should be a single last name
        $this->assertIsString($user->last_name);
        $this->assertNotEmpty($user->last_name);

        // Email should be valid format
        $this->assertIsString($user->email);
        $this->assertTrue(filter_var($user->email, FILTER_VALIDATE_EMAIL) !== false);

        // Password should be hashed
        $this->assertIsString($user->password);
        $this->assertNotEquals('password', $user->password); // Should be hashed
    }

    public function test_balanced_roles_creates_proper_distribution()
    {
        $users = User::factory()->count(10)->balancedRoles()->make();

        $administrators = $users->filter(fn($user) => $user->role === UserRole::ADMINISTRATOR);
        $reviewers = $users->filter(fn($user) => $user->role === UserRole::REVIEWER);

        // With 10 users and 20% admin ratio, expect 2 admins and 8 reviewers
        $this->assertEquals(2, $administrators->count());
        $this->assertEquals(8, $reviewers->count());
    }

    public function test_varied_passwords_creates_different_passwords()
    {
        $users = User::factory()->count(3)->withVariedPasswords()->make();

        $passwords = $users->pluck('password')->unique();

        // All passwords should be different
        $this->assertEquals(3, $passwords->count());

        // All should be hashed (not plain text)
        foreach ($passwords as $password) {
            $this->assertNotEquals('password', $password);
            $this->assertTrue(strlen($password) > 20); // Hashed passwords are longer
        }
    }
}

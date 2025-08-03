<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleBasedApiAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_access_admin_only_endpoint(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::ADMINISTRATOR
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin-test');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Administrator access granted',
                'user' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'role' => 'administrator'
                ]
            ]);
    }

    public function test_reviewer_cannot_access_admin_only_endpoint(): void
    {
        $reviewer = User::factory()->create([
            'role' => UserRole::REVIEWER
        ]);

        Sanctum::actingAs($reviewer);

        $response = $this->getJson('/api/admin-test');

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Unauthorized. You do not have permission to access this resource.'
            ]);
    }

    public function test_administrator_can_access_user_list_endpoint(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::ADMINISTRATOR
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/user-list-test');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'User listing access granted',
                'user' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'role' => 'administrator'
                ],
                'can_manage_users' => true
            ]);
    }

    public function test_reviewer_can_access_user_list_endpoint(): void
    {
        $reviewer = User::factory()->create([
            'role' => UserRole::REVIEWER
        ]);

        Sanctum::actingAs($reviewer);

        $response = $this->getJson('/api/user-list-test');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'User listing access granted',
                'user' => [
                    'id' => $reviewer->id,
                    'name' => $reviewer->name,
                    'email' => $reviewer->email,
                    'role' => 'reviewer'
                ],
                'can_manage_users' => false
            ]);
    }

    public function test_unauthenticated_user_cannot_access_protected_endpoints(): void
    {
        $response = $this->getJson('/api/admin-test');
        $response->assertStatus(401);

        $response = $this->getJson('/api/user-list-test');
        $response->assertStatus(401);
    }
}

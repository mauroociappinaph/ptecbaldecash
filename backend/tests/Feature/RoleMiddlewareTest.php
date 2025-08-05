<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Authentication required',
                'error_code' => 'UNAUTHENTICATED'
            ]);
    }

    public function test_administrator_can_access_administrator_only_routes(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::ADMINISTRATOR
        ]);

        Sanctum::actingAs($admin);

        // Test a route that would require administrator role
        $response = $this->getJson('/api/user');
        $response->assertStatus(200);
    }

    public function test_reviewer_cannot_access_administrator_only_routes(): void
    {
        $reviewer = User::factory()->create([
            'role' => UserRole::REVIEWER
        ]);

        Sanctum::actingAs($reviewer);

        // Create a test route that requires administrator role
        $this->app['router']->get('/test-admin-only', function () {
            return response()->json(['message' => 'Admin access granted']);
        })->middleware(['auth:sanctum', 'role:administrator']);

        $response = $this->getJson('/test-admin-only');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to access this resource',
                'error_code' => 'INSUFFICIENT_PERMISSIONS'
            ]);
    }

    public function test_both_roles_can_access_multi_role_routes(): void
    {
        // Test administrator access
        $admin = User::factory()->create([
            'role' => UserRole::ADMINISTRATOR
        ]);

        Sanctum::actingAs($admin);

        $this->app['router']->get('/test-multi-role', function () {
            return response()->json(['message' => 'Multi-role access granted']);
        })->middleware(['auth:sanctum', 'role:administrator,reviewer']);

        $response = $this->getJson('/test-multi-role');
        $response->assertStatus(200)
            ->assertJson(['message' => 'Multi-role access granted']);

        // Test reviewer access
        $reviewer = User::factory()->create([
            'role' => UserRole::REVIEWER
        ]);

        Sanctum::actingAs($reviewer);

        $response = $this->getJson('/test-multi-role');
        $response->assertStatus(200)
            ->assertJson(['message' => 'Multi-role access granted']);
    }

    public function test_invalid_role_denies_access(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::REVIEWER
        ]);

        Sanctum::actingAs($user);

        $this->app['router']->get('/test-invalid-role', function () {
            return response()->json(['message' => 'Should not reach here']);
        })->middleware(['auth:sanctum', 'role:invalid_role']);

        $response = $this->getJson('/test-invalid-role');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Access denied. Invalid role configuration',
                'error_code' => 'INVALID_ROLE_CONFIG'
            ]);
    }

    public function test_middleware_handles_case_insensitive_roles(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::ADMINISTRATOR
        ]);

        Sanctum::actingAs($admin);

        // Test with uppercase role name
        $this->app['router']->get('/test-case-insensitive', function () {
            return response()->json(['message' => 'Case insensitive access granted']);
        })->middleware(['auth:sanctum', 'role:ADMINISTRATOR']);

        $response = $this->getJson('/test-case-insensitive');
        $response->assertStatus(200)
            ->assertJson(['message' => 'Case insensitive access granted']);
    }
}

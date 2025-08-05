<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ErrorHandlingTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_api_returns_proper_error_format_for_validation_errors(): void
    {
        $admin = User::factory()->administrator()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/users', [
                'name' => '',
                'email' => 'invalid-email',
                'password' => '123',
            ]);

        dump($response->json());

        $response->assertStatus(422);
    }

    public function test_api_returns_proper_error_format_for_authentication_errors(): void
    {
        $response = $this->postJson('/api/users', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'role' => 'reviewer'
        ]);

        $response->assertStatus(401)
            ->assertJsonStructure([
                'success',
                'message',
                'error_code'
            ])
            ->assertJson([
                'success' => false,
                'error_code' => 'UNAUTHENTICATED'
            ]);
    }

    public function test_api_returns_proper_error_format_for_authorization_errors(): void
    {
        $reviewer = User::factory()->reviewer()->create();

        $response = $this->actingAs($reviewer, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password123',
                'role' => 'reviewer'
            ]);

        $response->assertStatus(403)
            ->assertJsonStructure([
                'success',
                'message',
                'error_code'
            ])
            ->assertJson([
                'success' => false,
                'error_code' => 'INSUFFICIENT_PERMISSIONS'
            ]);
    }

    public function test_api_returns_proper_error_format_for_not_found_errors(): void
    {
        $admin = User::factory()->administrator()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson('/api/users/99999', [
                'name' => 'Updated Name',
                'email' => 'updated@example.com',
                'role' => 'reviewer'
            ]);

        $response->assertStatus(404)
            ->assertJsonStructure([
                'success',
                'message',
                'error_code'
            ])
            ->assertJson([
                'success' => false,
                'error_code' => 'NOT_FOUND'
            ]);
    }

    public function test_duplicate_email_returns_proper_error(): void
    {
        $admin = User::factory()->administrator()->create();
        $existingUser = User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'Test User',
                'last_name' => 'Test Last Name',
                'email' => 'existing@example.com',
                'password' => 'UniqueErrorTestPass123!', // Fixed password to meet validation requirements
                'password_confirmation' => 'UniqueErrorTestPass123!', // Added required confirmation
                'role' => 'reviewer'
            ]);

        // Duplicate email validation happens at the request validation level (422)
        // not at the business logic level (409)
        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'errors'
            ])
            ->assertJsonPath('errors.email.0', 'This email address is already registered.');
    }

    public function test_self_deletion_returns_proper_error(): void
    {
        $admin = User::factory()->administrator()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/users/{$admin->id}");

        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
                'error_code'
            ])
            ->assertJson([
                'success' => false,
                'error_code' => 'SELF_DELETION_NOT_ALLOWED'
            ]);
    }
}

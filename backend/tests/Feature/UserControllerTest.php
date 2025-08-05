<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test users
        $this->administrator = User::factory()->create([
            'role' => UserRole::ADMINISTRATOR,
        ]);

        $this->reviewer = User::factory()->create([
            'role' => UserRole::REVIEWER,
        ]);
    }

    /** @test */
    public function administrator_can_view_user_list()
    {
        Sanctum::actingAs($this->administrator);

        // Create some test users
        User::factory()->count(5)->create();

        $response = $this->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'last_name',
                        'email',
                        'role',
                        'full_name',
                        'created_at',
                        'updated_at',
                    ]
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                    'from',
                    'to',
                ],
                'links' => [
                    'first',
                    'last',
                    'prev',
                    'next',
                ]
            ]);

        $this->assertEquals('Users retrieved successfully', $response->json('message'));
        $this->assertGreaterThanOrEqual(7, $response->json('meta.total')); // 2 test users + 5 created
    }

    /** @test */
    public function reviewer_can_view_user_list()
    {
        Sanctum::actingAs($this->reviewer);

        $response = $this->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data',
                'meta',
                'links'
            ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_view_user_list()
    {
        $response = $this->getJson('/api/users');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Authentication required',
                'error_code' => 'UNAUTHENTICATED'
            ]);
    }

    /** @test */
    public function user_list_supports_pagination()
    {
        Sanctum::actingAs($this->administrator);

        // Create 25 users
        User::factory()->count(25)->create();

        $response = $this->getJson('/api/users?per_page=10&page=1');

        $response->assertStatus(200);
        $this->assertEquals(10, count($response->json('data')));
        $this->assertEquals(1, $response->json('meta.current_page'));
        $this->assertGreaterThanOrEqual(3, $response->json('meta.last_page'));
    }

    /** @test */
    public function user_list_supports_search()
    {
        Sanctum::actingAs($this->administrator);

        $testUser = User::factory()->create([
            'name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
        ]);

        $response = $this->getJson('/api/users?search=John');

        $response->assertStatus(200);
        $users = $response->json('data');
        $this->assertTrue(collect($users)->contains('name', 'John'));
    }

    /** @test */
    public function user_list_supports_role_filter()
    {
        Sanctum::actingAs($this->administrator);

        User::factory()->count(3)->create(['role' => UserRole::ADMINISTRATOR]);
        User::factory()->count(2)->create(['role' => UserRole::REVIEWER]);

        $response = $this->getJson('/api/users?role=administrator');

        $response->assertStatus(200);
        $users = $response->json('data');

        foreach ($users as $user) {
            $this->assertEquals('administrator', $user['role']);
        }
    }

    /** @test */
    public function administrator_can_create_user()
    {
        Sanctum::actingAs($this->administrator);

        $userData = [
            'name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@example.com',
            'password' => 'SecureTest123!@#',
            'password_confirmation' => 'SecureTest123!@#',
            'role' => 'reviewer',
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'name',
                    'last_name',
                    'email',
                    'role',
                    'full_name',
                    'created_at',
                    'updated_at',
                ]
            ]);

        $this->assertEquals('User created successfully', $response->json('message'));
        $this->assertEquals('Jane Smith', $response->json('data.full_name'));

        // Verify user was created in database
        $this->assertDatabaseHas('users', [
            'email' => 'jane.smith@example.com',
            'name' => 'Jane',
            'last_name' => 'Smith',
            'role' => 'reviewer',
        ]);
    }

    /** @test */
    public function reviewer_cannot_create_user()
    {
        Sanctum::actingAs($this->reviewer);

        $userData = [
            'name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@example.com',
            'password' => 'password123',
            'role' => 'reviewer',
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Unauthorized. You do not have permission to access this resource.'
            ]);
    }

    /** @test */
    public function create_user_validates_required_fields()
    {
        Sanctum::actingAs($this->administrator);

        $response = $this->postJson('/api/users', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'last_name', 'email', 'password', 'role']);
    }

    /** @test */
    public function create_user_validates_unique_email()
    {
        Sanctum::actingAs($this->administrator);

        $existingUser = User::factory()->create();

        $userData = [
            'name' => 'Jane',
            'last_name' => 'Smith',
            'email' => $existingUser->email, // Duplicate email
            'password' => 'password123',
            'role' => 'reviewer',
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function create_user_validates_role_values()
    {
        Sanctum::actingAs($this->administrator);

        $userData = [
            'name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@example.com',
            'password' => 'password123',
            'role' => 'invalid_role',
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    /** @test */
    public function administrator_can_update_user()
    {
        Sanctum::actingAs($this->administrator);

        $user = User::factory()->create([
            'name' => 'Original',
            'last_name' => 'Name',
            'email' => 'original@example.com',
            'role' => UserRole::REVIEWER,
        ]);

        $updateData = [
            'name' => 'Updated',
            'last_name' => 'Name',
            'email' => 'updated@example.com',
            'role' => 'administrator',
        ];

        $response = $this->putJson("/api/users/{$user->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'name',
                    'last_name',
                    'email',
                    'role',
                    'full_name',
                    'created_at',
                    'updated_at',
                ]
            ]);

        $this->assertEquals('User updated successfully', $response->json('message'));
        $this->assertEquals('Updated Name', $response->json('data.full_name'));

        // Verify user was updated in database
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated',
            'email' => 'updated@example.com',
            'role' => 'administrator',
        ]);
    }

    /** @test */
    public function reviewer_cannot_update_user()
    {
        Sanctum::actingAs($this->reviewer);

        $user = User::factory()->create();

        $updateData = [
            'name' => 'Updated',
        ];

        $response = $this->putJson("/api/users/{$user->id}", $updateData);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Unauthorized. You do not have permission to access this resource.'
            ]);
    }

    /** @test */
    public function update_user_validates_unique_email()
    {
        Sanctum::actingAs($this->administrator);

        $user1 = User::factory()->create(['email' => 'user1@example.com']);
        $user2 = User::factory()->create(['email' => 'user2@example.com']);

        $updateData = [
            'email' => 'user2@example.com', // Trying to use user2's email
        ];

        $response = $this->putJson("/api/users/{$user1->id}", $updateData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function update_user_allows_keeping_same_email()
    {
        Sanctum::actingAs($this->administrator);

        $user = User::factory()->create(['email' => 'user@example.com']);

        $updateData = [
            'name' => 'Updated Name',
            'email' => 'user@example.com', // Same email should be allowed
        ];

        $response = $this->putJson("/api/users/{$user->id}", $updateData);

        $response->assertStatus(200);
    }

    /** @test */
    public function administrator_can_delete_user()
    {
        Sanctum::actingAs($this->administrator);

        $user = User::factory()->create();

        $response = $this->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'email',
                    'deleted_at',
                ]
            ]);

        $this->assertEquals('User deleted successfully', $response->json('message'));

        // Verify user was soft deleted
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    /** @test */
    public function reviewer_cannot_delete_user()
    {
        Sanctum::actingAs($this->reviewer);

        $user = User::factory()->create();

        $response = $this->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Unauthorized. You do not have permission to access this resource.'
            ]);
    }

    /** @test */
    public function user_cannot_delete_themselves()
    {
        Sanctum::actingAs($this->administrator);

        $response = $this->deleteJson("/api/users/{$this->administrator->id}");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'You cannot delete your own account.'
            ]);
    }

    /** @test */
    public function cannot_update_deleted_user()
    {
        Sanctum::actingAs($this->administrator);

        $user = User::factory()->create();
        $user->delete(); // Soft delete the user

        $updateData = [
            'name' => 'Updated Name',
        ];

        $response = $this->putJson("/api/users/{$user->id}", $updateData);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'User not found or has been deleted.'
            ]);
    }

    /** @test */
    public function cannot_delete_already_deleted_user()
    {
        Sanctum::actingAs($this->administrator);

        $user = User::factory()->create();
        $user->delete(); // Soft delete the user

        $response = $this->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'User not found or has already been deleted.'
            ]);
    }

    /** @test */
    public function user_tokens_are_revoked_when_deleted()
    {
        Sanctum::actingAs($this->administrator);

        $user = User::factory()->create();
        $token = $user->createToken('test-token');

        // Verify token exists
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'test-token',
        ]);

        $response = $this->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(200);

        // Verify token was deleted
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'test-token',
        ]);
    }
}

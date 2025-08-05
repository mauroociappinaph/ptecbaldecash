<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Mail\UserCredentialsMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * End-to-End Integration Test Suite
 *
 * This comprehensive test suite validates the complete user management system
 * including authentication flow, CRUD operations, role-based access control,
 * and email functionality as specified in requirements 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 8.1
 */
class EndToEndIntegrationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $administrator;
    protected User $reviewer;

    // Test data constants for consistency
    private const ADMIN_PASSWORD = 'admin123';
    private const REVIEWER_PASSWORD = 'reviewer123';
    private const TEST_PASSWORD = 'SecureTestPass123!';

    private const ADMIN_EMAIL = 'admin@example.com';
    private const REVIEWER_EMAIL = 'reviewer@example.com';

    protected function setUp(): void
    {
        parent::setUp();

        // Create test users for role-based testing
        $this->administrator = User::factory()->create([
            'name' => 'Admin',
            'last_name' => 'User',
            'email' => self::ADMIN_EMAIL,
            'password' => bcrypt(self::ADMIN_PASSWORD),
            'role' => UserRole::ADMINISTRATOR,
        ]);

        $this->reviewer = User::factory()->create([
            'name' => 'Reviewer',
            'last_name' => 'User',
            'email' => self::REVIEWER_EMAIL,
            'password' => bcrypt(self::REVIEWER_PASSWORD),
            'role' => UserRole::REVIEWER,
        ]);
    }

    /**
     * Helper method to authenticate and get token
     */
    private function authenticateUser(string $email, string $password): string
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => $email,
            'password' => $password,
        ]);

        $response->assertStatus(200);
        return $response->json('data.token');
    }

    /**
     * Helper method to create test user data
     */
    private function createTestUserData(string $suffix = ''): array
    {
        return [
            'name' => 'Test' . $suffix,
            'last_name' => 'User' . $suffix,
            'email' => 'test' . strtolower($suffix) . '@example.com',
            'password' => self::TEST_PASSWORD,
            'password_confirmation' => self::TEST_PASSWORD,
            'role' => 'reviewer',
        ];
    }

    /**
     * Test complete user authentication flow (Requirement 1.1)
     *
     * @test
     */
    public function complete_user_authentication_flow_works_correctly()
    {
        // Test login with valid credentials
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => self::ADMIN_EMAIL,
            'password' => self::ADMIN_PASSWORD,
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'last_name', 'email', 'role', 'full_name'],
                    'token',
                ],
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'email' => self::ADMIN_EMAIL,
                        'role' => 'administrator',
                    ],
                ],
            ]);

        $token = $loginResponse->json('data.token');
        $this->assertNotEmpty($token);

        // Test accessing protected route with token
        $protectedResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/auth/me');

        $protectedResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => self::ADMIN_EMAIL,
                        'role' => 'administrator',
                    ],
                ],
            ]);

        // Test logout functionality
        $logoutResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/logout');

        $logoutResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logout successful'
            ]);

        // Test invalid credentials
        $invalidLoginResponse = $this->postJson('/api/auth/login', [
            'email' => self::ADMIN_EMAIL,
            'password' => 'wrongpassword',
        ]);

        $invalidLoginResponse->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test complete CRUD operations work correctly (Requirements 2.1, 3.1, 4.1, 5.1)
     *
     * @test
     */
    public function complete_crud_operations_work_correctly()
    {
        Sanctum::actingAs($this->administrator);

        // Test CREATE operation (Requirement 3.1)
        Mail::fake();

        $createData = [
            'name' => 'New',
            'last_name' => 'User',
            'email' => 'newuser@example.com',
            'password' => 'UniqueSecurePassword2024!@#',
            'password_confirmation' => 'UniqueSecurePassword2024!@#',
            'role' => 'reviewer',
        ];

        $createResponse = $this->postJson('/api/users', $createData);

        $createResponse->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => ['id', 'name', 'last_name', 'email', 'role', 'full_name'],
            ])
            ->assertJson([
                'message' => 'User created successfully',
                'data' => [
                    'name' => 'New',
                    'last_name' => 'User',
                    'email' => 'newuser@example.com',
                    'role' => 'reviewer',
                    'full_name' => 'New User',
                ],
            ]);

        $createdUserId = $createResponse->json('data.id');

        // Verify user exists in database
        $this->assertDatabaseHas('users', [
            'id' => $createdUserId,
            'email' => 'newuser@example.com',
            'role' => 'reviewer',
        ]);

        // Test READ operation (Requirement 2.1)
        $readResponse = $this->getJson('/api/users');

        $readResponse->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    '*' => ['id', 'name', 'last_name', 'email', 'role', 'full_name'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $users = $readResponse->json('data');
        $this->assertTrue(collect($users)->contains('email', 'newuser@example.com'));

        // Test UPDATE operation (Requirement 4.1)
        $updateData = [
            'name' => 'Updated',
            'last_name' => 'Name',
            'email' => 'updated@example.com',
            'role' => 'administrator',
        ];

        $updateResponse = $this->putJson("/api/users/{$createdUserId}", $updateData);

        $updateResponse->assertStatus(200)
            ->assertJson([
                'message' => 'User updated successfully',
                'data' => [
                    'id' => $createdUserId,
                    'name' => 'Updated',
                    'last_name' => 'Name',
                    'email' => 'updated@example.com',
                    'role' => 'administrator',
                    'full_name' => 'Updated Name',
                ],
            ]);

        // Verify update in database
        $this->assertDatabaseHas('users', [
            'id' => $createdUserId,
            'email' => 'updated@example.com',
            'role' => 'administrator',
        ]);

        // Test DELETE operation (Requirement 5.1)
        $deleteResponse = $this->deleteJson("/api/users/{$createdUserId}");

        $deleteResponse->assertStatus(200)
            ->assertJson([
                'message' => 'User deleted successfully',
                'data' => [
                    'id' => $createdUserId,
                    'email' => 'updated@example.com',
                ],
            ]);

        // Verify soft delete
        $this->assertSoftDeleted('users', ['id' => $createdUserId]);

        // Verify deleted user doesn't appear in user list
        $afterDeleteResponse = $this->getJson('/api/users');
        $usersAfterDelete = $afterDeleteResponse->json('data');
        $this->assertFalse(collect($usersAfterDelete)->contains('id', $createdUserId));
    }

    /**
     * Test role-based access control across the application (Requirement 6.1)
     *
     * @test
     */
    public function role_based_access_control_works_correctly()
    {
        // Test Administrator permissions
        Sanctum::actingAs($this->administrator);

        // Administrator can view users
        $adminViewResponse = $this->getJson('/api/users');
        $adminViewResponse->assertStatus(200);

        // Administrator can create users
        $adminCreateResponse = $this->postJson('/api/users', [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'reviewer',
        ]);
        $adminCreateResponse->assertStatus(201);

        $createdUserId = $adminCreateResponse->json('data.id');

        // Administrator can update users
        $adminUpdateResponse = $this->putJson("/api/users/{$createdUserId}", [
            'name' => 'Updated Test',
        ]);
        $adminUpdateResponse->assertStatus(200);

        // Administrator can delete users
        $adminDeleteResponse = $this->deleteJson("/api/users/{$createdUserId}");
        $adminDeleteResponse->assertStatus(200);

        // Test Reviewer permissions
        Sanctum::actingAs($this->reviewer);

        // Reviewer can view users
        $reviewerViewResponse = $this->getJson('/api/users');
        $reviewerViewResponse->assertStatus(200);

        // Reviewer cannot create users
        $reviewerCreateResponse = $this->postJson('/api/users', [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test2@example.com',
            'password' => 'password123',
            'role' => 'reviewer',
        ]);
        $reviewerCreateResponse->assertStatus(403)
            ->assertJson([
                'message' => 'Unauthorized. You do not have permission to access this resource.',
            ]);

        // Reviewer cannot update users
        $reviewerUpdateResponse = $this->putJson("/api/users/{$this->administrator->id}", [
            'name' => 'Hacked',
        ]);
        $reviewerUpdateResponse->assertStatus(403);

        // Reviewer cannot delete users
        $reviewerDeleteResponse = $this->deleteJson("/api/users/{$this->administrator->id}");
        $reviewerDeleteResponse->assertStatus(403);

        // Test unauthenticated access
        $this->withoutMiddleware();

        $unauthenticatedResponse = $this->getJson('/api/users');
        $unauthenticatedResponse->assertStatus(401);
    }

    /**
     * Test email sending functionality (Requirement 8.1)
     *
     * @test
     */
    public function email_sending_functionality_works_correctly()
    {
        Mail::fake();
        Sanctum::actingAs($this->administrator);

        $userData = [
            'name' => 'Email',
            'last_name' => 'Test',
            'email' => 'emailtest@example.com',
            'password' => 'UniqueEmailTestPassword2024!@#',
            'password_confirmation' => 'UniqueEmailTestPassword2024!@#',
            'role' => 'reviewer',
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(201);

        // Verify email was queued
        Mail::assertQueued(UserCredentialsMail::class, function ($mail) use ($userData) {
            return $mail->hasTo($userData['email']) &&
                   $mail->user->email === $userData['email'];
        });

        // Verify only one email was queued
        Mail::assertQueuedCount(1);
    }

    /**
     * Test complete user management workflow
     *
     * @test
     */
    public function complete_user_management_workflow()
    {
        Mail::fake();

        // Step 1: Administrator logs in
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => self::ADMIN_EMAIL,
            'password' => self::ADMIN_PASSWORD,
        ]);

        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('data.token');

        // Step 2: Administrator views user list
        $listResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/users');

        $listResponse->assertStatus(200);
        $initialUserCount = $listResponse->json('meta.total');

        // Step 3: Administrator creates a new user
        $newUserData = [
            'name' => 'Workflow',
            'last_name' => 'Test',
            'email' => 'workflow@example.com',
            'password' => 'UniqueWorkflowPassword2024!@#',
            'password_confirmation' => 'UniqueWorkflowPassword2024!@#',
            'role' => 'reviewer',
        ];

        $createResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/users', $newUserData);

        $createResponse->assertStatus(201);
        $newUserId = $createResponse->json('data.id');

        // Verify email was queued
        Mail::assertQueued(UserCredentialsMail::class);

        // Step 4: Verify user appears in list
        $updatedListResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/users');

        $updatedListResponse->assertStatus(200);
        $this->assertEquals($initialUserCount + 1, $updatedListResponse->json('meta.total'));

        // Step 5: Administrator updates the user
        $updateData = [
            'name' => 'Updated Workflow',
            'role' => 'administrator',
        ];

        $updateResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/users/{$newUserId}", $updateData);

        $updateResponse->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Updated Workflow',
                    'role' => 'administrator',
                ],
            ]);

        // Step 6: New user can now log in with updated role
        $newUserLoginResponse = $this->postJson('/api/auth/login', [
            'email' => 'workflow@example.com',
            'password' => 'UniqueWorkflowPassword2024!@#',
        ]);

        $newUserLoginResponse->assertStatus(200)
            ->assertJson([
                'data' => [
                    'user' => [
                        'role' => 'administrator',
                    ],
                ],
            ]);

        // Step 7: Administrator soft deletes the user
        $deleteResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson("/api/users/{$newUserId}");

        $deleteResponse->assertStatus(200);

        // Step 8: Verify user is soft deleted and cannot log in
        $deletedUserLoginResponse = $this->postJson('/api/auth/login', [
            'email' => 'workflow@example.com',
            'password' => 'UniqueWorkflowPassword2024!@#',
        ]);

        $deletedUserLoginResponse->assertStatus(422);

        // Step 9: Verify user doesn't appear in active user list
        $finalListResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/users');

        $finalListResponse->assertStatus(200);
        $this->assertEquals($initialUserCount, $finalListResponse->json('meta.total'));
    }

    /**
     * Test error handling and edge cases
     *
     * @test
     */
    public function error_handling_works_correctly()
    {
        Sanctum::actingAs($this->administrator);

        // Test validation errors
        $invalidCreateResponse = $this->postJson('/api/users', []);
        $invalidCreateResponse->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'last_name', 'email', 'password', 'role']);

        // Test duplicate email
        $duplicateEmailResponse = $this->postJson('/api/users', [
            'name' => 'Test',
            'last_name' => 'User',
            'email' => $this->administrator->email, // Duplicate
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'reviewer',
        ]);
        $duplicateEmailResponse->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        // Test updating non-existent user
        $nonExistentUpdateResponse = $this->putJson('/api/users/99999', [
            'name' => 'Test',
        ]);
        $nonExistentUpdateResponse->assertStatus(404);

        // Test deleting non-existent user
        $nonExistentDeleteResponse = $this->deleteJson('/api/users/99999');
        $nonExistentDeleteResponse->assertStatus(404);

        // Test self-deletion prevention
        $selfDeleteResponse = $this->deleteJson("/api/users/{$this->administrator->id}");
        $selfDeleteResponse->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'You cannot delete your own account',
                'error_code' => 'SELF_DELETION_NOT_ALLOWED'
            ]);
    }

    /**
     * Test pagination and filtering functionality
     *
     * @test
     */
    public function pagination_and_filtering_work_correctly()
    {
        Sanctum::actingAs($this->administrator);

        // Create additional test users
        User::factory()->count(25)->create();

        // Test pagination
        $paginatedResponse = $this->getJson('/api/users?per_page=10&page=1');
        $paginatedResponse->assertStatus(200);
        $this->assertEquals(10, count($paginatedResponse->json('data')));
        $this->assertEquals(1, $paginatedResponse->json('meta.current_page'));

        // Test search functionality
        $testUser = User::factory()->create([
            'name' => 'Searchable',
            'last_name' => 'User',
            'email' => 'searchable@example.com',
        ]);

        $searchResponse = $this->getJson('/api/users?search=Searchable');
        $searchResponse->assertStatus(200);
        $users = $searchResponse->json('data');
        $this->assertTrue(collect($users)->contains('name', 'Searchable'));

        // Test role filtering
        $roleFilterResponse = $this->getJson('/api/users?role=administrator');
        $roleFilterResponse->assertStatus(200);
        $filteredUsers = $roleFilterResponse->json('data');

        foreach ($filteredUsers as $user) {
            $this->assertEquals('administrator', $user['role']);
        }
    }
}

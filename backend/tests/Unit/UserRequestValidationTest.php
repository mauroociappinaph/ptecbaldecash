<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserRequestValidationTest extends TestCase
{
    use RefreshDatabase;

    protected User $administrator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->administrator = User::factory()->administrator()->create();
    }

    /**
     * Get valid user data for testing
     */
    private function getValidUserData(array $overrides = []): array
    {
        return array_merge([
            'name' => 'John',
            'last_name' => 'Doe',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'administrator'
        ], $overrides);
    }

    /**
     * Create a request instance with authenticated user
     */
    private function createStoreRequest(): StoreUserRequest
    {
        $request = new StoreUserRequest();
        $request->setUserResolver(fn() => $this->administrator);
        return $request;
    }

    /**
     * Create an update request instance with authenticated user and route
     */
    private function createUpdateRequest(int $userId = 1): UpdateUserRequest
    {
        $request = new UpdateUserRequest();
        $request->setUserResolver(fn() => $this->administrator);
        $request->setRouteResolver(fn() => \Tests\Support\MockRoute::withUser($userId));
        return $request;
    }

    /**
     * Helper method to validate data against request rules
     */
    private function validateData(array $data, array $rules): \Illuminate\Validation\Validator
    {
        return Validator::make($data, $rules);
    }

    /**
     * Assert validation passes for given data and rules
     */
    private function assertValidationPasses(array $data, array $rules): void
    {
        $validator = $this->validateData($data, $rules);
        $this->assertFalse($validator->fails(), 'Validation should pass but failed with errors: ' . json_encode($validator->errors()->toArray()));
    }

    /**
     * Assert validation fails for given data and rules
     */
    private function assertValidationFails(array $data, array $rules, ?string $field = null): void
    {
        $validator = $this->validateData($data, $rules);
        $this->assertTrue($validator->fails(), 'Validation should fail but passed');

        if ($field) {
            $this->assertArrayHasKey($field, $validator->errors()->toArray(), "Expected validation error for field: {$field}");
        }
    }

    /** @test */
    public function store_request_validates_name_requirements()
    {
        Sanctum::actingAs($this->administrator);
        $request = $this->createStoreRequest();

        // Test minimum length
        $this->assertValidationFails(['name' => 'A'], $request->rules(), 'name');

        // Test regex validation - numbers should fail
        $this->assertValidationFails(['name' => 'John123'], $request->rules(), 'name');

        // Test valid name with accents
        $validData = $this->getValidUserData(['name' => 'José María', 'last_name' => 'González']);
        $this->assertValidationPasses($validData, $request->rules());
    }

    /** @test */
    public function store_request_validates_password_strength()
    {
        Sanctum::actingAs($this->administrator);

        $request = new StoreUserRequest();
        $request->setUserResolver(fn() => $this->administrator);

        $baseData = [
            'name' => 'John',
            'last_name' => 'Doe',
            'email' => 'test@example.com',
            'role' => 'administrator'
        ];

        // Test weak password - no uppercase
        $validator = Validator::make(array_merge($baseData, [
            'password' => 'password123!',
            'password_confirmation' => 'password123!'
        ]), $request->rules());
        $this->assertTrue($validator->fails());

        // Test weak password - no numbers
        $validator = Validator::make(array_merge($baseData, [
            'password' => 'Password!',
            'password_confirmation' => 'Password!'
        ]), $request->rules());
        $this->assertTrue($validator->fails());

        // Test weak password - no symbols
        $validator = Validator::make(array_merge($baseData, [
            'password' => 'Password123',
            'password_confirmation' => 'Password123'
        ]), $request->rules());
        $this->assertTrue($validator->fails());

        // Test strong password
        $validator = Validator::make(array_merge($baseData, [
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!'
        ]), $request->rules());
        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function store_request_validates_password_confirmation()
    {
        Sanctum::actingAs($this->administrator);

        $request = new StoreUserRequest();
        $request->setUserResolver(fn() => $this->administrator);

        $data = [
            'name' => 'John',
            'last_name' => 'Doe',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'DifferentPassword123!',
            'role' => 'administrator'
        ];

        $validator = Validator::make($data, $request->rules());
        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('password', $validator->errors()->toArray());
    }

    /** @test */
    public function store_request_validates_email_uniqueness_with_soft_deletes()
    {
        Sanctum::actingAs($this->administrator);

        // Create and soft delete a user
        $deletedUser = User::factory()->create(['email' => 'deleted@example.com']);
        $deletedUser->delete();

        $request = new StoreUserRequest();
        $request->setUserResolver(fn() => $this->administrator);

        $data = [
            'name' => 'John',
            'last_name' => 'Doe',
            'email' => 'deleted@example.com', // Should be allowed since original is soft deleted
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'administrator'
        ];

        $validator = Validator::make($data, $request->rules());
        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function update_request_allows_partial_updates()
    {
        Sanctum::actingAs($this->administrator);

        $existingUser = User::factory()->create();

        $request = $this->createUpdateRequest(1);

        // Test updating only name
        $this->assertValidationPasses(['name' => 'Updated Name'], $request->rules());

        // Test updating only email
        $this->assertValidationPasses(['email' => 'newemail@example.com'], $request->rules());

        // Test updating only role
        $this->assertValidationPasses(['role' => 'reviewer'], $request->rules());
    }

    /** @test */
    public function update_request_validates_email_uniqueness_ignoring_current_user()
    {
        Sanctum::actingAs($this->administrator);

        $user1 = User::factory()->create(['email' => 'user1@example.com']);
        $user2 = User::factory()->create(['email' => 'user2@example.com']);

        $request = new UpdateUserRequest();
        $request->setUserResolver(fn() => $this->administrator);
        $request->setRouteResolver(fn() => \Tests\Support\MockRoute::withUser($user1->id));

        // Should allow keeping same email
        $validator = Validator::make(['email' => 'user1@example.com'], $request->rules());
        $this->assertFalse($validator->fails());

        // Should reject using another user's email
        $validator = Validator::make(['email' => 'user2@example.com'], $request->rules());
        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('email', $validator->errors()->toArray());
    }

    /** @test */
    public function update_request_validates_optional_password_confirmation()
    {
        Sanctum::actingAs($this->administrator);

        $request = $this->createUpdateRequest(1);

        // Should fail if password provided without confirmation
        $validator = Validator::make(['password' => 'NewPassword123!'], $request->rules());
        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('password_confirmation', $validator->errors()->toArray());

        // Should pass if both password and confirmation provided
        $validator = Validator::make([
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!'
        ], $request->rules());
        $this->assertFalse($validator->fails());

        // Should pass if neither password nor confirmation provided
        $validator = Validator::make(['name' => 'Updated Name'], $request->rules());
        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function requests_validate_role_enum_values()
    {
        Sanctum::actingAs($this->administrator);

        $request = new StoreUserRequest();
        $request->setUserResolver(fn() => $this->administrator);

        $baseData = [
            'name' => 'John',
            'last_name' => 'Doe',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!'
        ];

        // Test valid roles
        foreach (UserRole::values() as $role) {
            $validator = Validator::make(array_merge($baseData, ['role' => $role]), $request->rules());
            $this->assertFalse($validator->fails(), "Role '{$role}' should be valid");
        }

        // Test invalid role
        $validator = Validator::make(array_merge($baseData, ['role' => 'invalid_role']), $request->rules());
        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('role', $validator->errors()->toArray());
    }

    /** @test */
    public function requests_trim_and_normalize_input_data()
    {
        Sanctum::actingAs($this->administrator);

        $request = new StoreUserRequest();
        $request->setUserResolver(fn() => $this->administrator);

        // Simulate request with whitespace and mixed case email
        $request->merge([
            'name' => '  John  ',
            'last_name' => '  Doe  ',
            'email' => '  TEST@EXAMPLE.COM  '
        ]);

        $request->prepareForValidation();

        $this->assertEquals('John', $request->input('name'));
        $this->assertEquals('Doe', $request->input('last_name'));
        $this->assertEquals('test@example.com', $request->input('email'));
    }
}

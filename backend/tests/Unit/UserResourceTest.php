<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Tests\TestCase;

class UserResourceTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_resource_transforms_user_data_correctly()
    {
        $user = User::factory()->create([
            'name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'role' => UserRole::ADMINISTRATOR,
        ]);

        $resource = new UserResource($user);
        $request = new Request();
        $resourceArray = $resource->toArray($request);

        // Check that all expected fields are present
        $this->assertArrayHasKey('id', $resourceArray);
        $this->assertArrayHasKey('name', $resourceArray);
        $this->assertArrayHasKey('last_name', $resourceArray);
        $this->assertArrayHasKey('email', $resourceArray);
        $this->assertArrayHasKey('role', $resourceArray);
        $this->assertArrayHasKey('full_name', $resourceArray);
        $this->assertArrayHasKey('created_at', $resourceArray);
        $this->assertArrayHasKey('updated_at', $resourceArray);

        // Check that sensitive data is not exposed
        $this->assertArrayNotHasKey('password', $resourceArray);
        $this->assertArrayNotHasKey('remember_token', $resourceArray);

        // Check data values
        $this->assertEquals($user->id, $resourceArray['id']);
        $this->assertEquals('John', $resourceArray['name']);
        $this->assertEquals('Doe', $resourceArray['last_name']);
        $this->assertEquals('john@example.com', $resourceArray['email']);
        $this->assertEquals('administrator', $resourceArray['role']);
        $this->assertEquals('John Doe', $resourceArray['full_name']);
    }

    /** @test */
    public function user_resource_handles_reviewer_role_correctly()
    {
        $user = User::factory()->create([
            'role' => UserRole::REVIEWER,
        ]);

        $resource = new UserResource($user);
        $request = new Request();
        $resourceArray = $resource->toArray($request);

        $this->assertEquals('reviewer', $resourceArray['role']);
    }

    /** @test */
    public function user_collection_provides_pagination_metadata()
    {
        // Create some users
        $users = User::factory()->count(25)->create();

        // Create a paginated collection
        $paginator = new LengthAwarePaginator(
            $users->take(15), // items for current page
            25, // total items
            15, // per page
            1, // current page
            ['path' => '/api/users'] // options
        );

        $collection = new UserCollection($paginator);
        $request = new Request();
        $collectionArray = $collection->toArray($request);

        // Check structure
        $this->assertArrayHasKey('data', $collectionArray);
        $this->assertArrayHasKey('meta', $collectionArray);
        $this->assertArrayHasKey('links', $collectionArray);

        // Check meta data
        $this->assertArrayHasKey('current_page', $collectionArray['meta']);
        $this->assertArrayHasKey('last_page', $collectionArray['meta']);
        $this->assertArrayHasKey('per_page', $collectionArray['meta']);
        $this->assertArrayHasKey('total', $collectionArray['meta']);
        $this->assertArrayHasKey('from', $collectionArray['meta']);
        $this->assertArrayHasKey('to', $collectionArray['meta']);

        // Check links
        $this->assertArrayHasKey('first', $collectionArray['links']);
        $this->assertArrayHasKey('last', $collectionArray['links']);
        $this->assertArrayHasKey('prev', $collectionArray['links']);
        $this->assertArrayHasKey('next', $collectionArray['links']);

        // Check values
        $this->assertEquals(1, $collectionArray['meta']['current_page']);
        $this->assertEquals(2, $collectionArray['meta']['last_page']);
        $this->assertEquals(15, $collectionArray['meta']['per_page']);
        $this->assertEquals(25, $collectionArray['meta']['total']);
    }

    /** @test */
    public function user_collection_transforms_individual_users_correctly()
    {
        $users = User::factory()->count(3)->create();

        $paginator = new LengthAwarePaginator(
            $users,
            3,
            15,
            1,
            ['path' => '/api/users']
        );

        $collection = new UserCollection($paginator);
        $request = new Request();
        $collectionArray = $collection->toArray($request);

        // Check that data contains transformed users
        $this->assertCount(3, $collectionArray['data']);

        foreach ($collectionArray['data'] as $userData) {
            // Debug: Let's see what's actually in the userData
            if (is_array($userData)) {
                // If it's an array, check the keys
                $this->assertArrayHasKey('id', $userData);
                $this->assertArrayHasKey('name', $userData);
                $this->assertArrayHasKey('last_name', $userData);
                $this->assertArrayHasKey('email', $userData);
                $this->assertArrayHasKey('role', $userData);
                $this->assertArrayHasKey('full_name', $userData);
                $this->assertArrayHasKey('created_at', $userData);
                $this->assertArrayHasKey('updated_at', $userData);

                // Ensure sensitive data is not exposed
                $this->assertArrayNotHasKey('password', $userData);
                $this->assertArrayNotHasKey('remember_token', $userData);
            } else {
                // If it's a UserResource object, convert it to array
                $userArray = $userData->toArray($request);

                $this->assertArrayHasKey('id', $userArray);
                $this->assertArrayHasKey('name', $userArray);
                $this->assertArrayHasKey('last_name', $userArray);
                $this->assertArrayHasKey('email', $userArray);
                $this->assertArrayHasKey('role', $userArray);
                $this->assertArrayHasKey('full_name', $userArray);
                $this->assertArrayHasKey('created_at', $userArray);
                $this->assertArrayHasKey('updated_at', $userArray);

                // Ensure sensitive data is not exposed
                $this->assertArrayNotHasKey('password', $userArray);
                $this->assertArrayNotHasKey('remember_token', $userArray);
            }
        }
    }

    /** @test */
    public function user_resource_formats_dates_as_iso_strings()
    {
        $user = User::factory()->create();

        $resource = new UserResource($user);
        $request = new Request();
        $resourceArray = $resource->toArray($request);

        // Check that dates are formatted as ISO strings
        $this->assertIsString($resourceArray['created_at']);
        $this->assertIsString($resourceArray['updated_at']);

        // Verify ISO format (should contain 'T' and 'Z' or timezone offset)
        $this->assertStringContainsString('T', $resourceArray['created_at']);
        $this->assertStringContainsString('T', $resourceArray['updated_at']);
    }
}

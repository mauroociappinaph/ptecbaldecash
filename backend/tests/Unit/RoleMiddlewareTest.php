<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Http\Middleware\RoleMiddleware;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Tests\TestCase;

/**
 * Test suite for RoleMiddleware functionality.
 *
 * This test suite covers all aspects of role-based access control including:
 * - Successful access with correct roles
 * - Access denial for incorrect roles
 * - Authentication requirements
 * - Edge cases and error handling
 */
class RoleMiddlewareTest extends TestCase
{
    private RoleMiddleware $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new RoleMiddleware();
    }

    /**
     * Create a mock request with a user resolver.
     */
    private function createRequestWithUser(?User $user): Request
    {
        $request = Request::create('/test');
        $request->setUserResolver(fn() => $user);
        return $request;
    }

    /**
     * Create a simple next closure for middleware testing.
     */
    private function createNextClosure(): \Closure
    {
        return function ($req) {
            return response()->json(['success' => true]);
        };
    }

    public function test_middleware_allows_access_for_correct_role(): void
    {
        $user = User::factory()->make([
            'role' => UserRole::ADMINISTRATOR
        ]);

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $user);

        $response = $this->middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'administrator');

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('{"success":true}', $response->getContent());
    }

    public function test_middleware_denies_access_for_incorrect_role(): void
    {
        $user = User::factory()->make([
            'role' => UserRole::REVIEWER
        ]);

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $user);

        // The middleware throws a RolePermissionException which gets handled by the exception handler
        $this->expectException(\App\Exceptions\RolePermissionException::class);
        $this->expectExceptionMessage('You do not have permission to access this resource');

        $this->middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'administrator');
    }

    public function test_middleware_renders_correct_response_for_role_permission_exception(): void
    {
        $user = User::factory()->make([
            'role' => UserRole::REVIEWER
        ]);

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $user);

        try {
            $this->middleware->handle($request, function ($req) {
                return response()->json(['success' => true]);
            }, 'administrator');
        } catch (\App\Exceptions\RolePermissionException $e) {
            $response = $e->render();

            $this->assertEquals(Response::HTTP_FORBIDDEN, $response->getStatusCode());
            $responseData = json_decode($response->getContent(), true);
            $this->assertEquals([
                'success' => false,
                'message' => 'You do not have permission to access this resource',
                'error_code' => 'INSUFFICIENT_PERMISSIONS'
            ], $responseData);
        }
    }

    public function test_middleware_denies_access_for_unauthenticated_user(): void
    {
        $request = Request::create('/test');
        $request->setUserResolver(fn() => null);

        $response = $this->middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'administrator');

        $this->assertEquals(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals([
            'success' => false,
            'message' => 'Authentication required',
            'error_code' => 'UNAUTHENTICATED'
        ], $responseData);
    }

    public function test_middleware_allows_access_for_multiple_roles(): void
    {
        $reviewer = User::factory()->make([
            'role' => UserRole::REVIEWER
        ]);

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $reviewer);

        $response = $this->middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'administrator', 'reviewer');

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('{"success":true}', $response->getContent());
    }

    public function test_middleware_handles_case_insensitive_roles(): void
    {
        $admin = User::factory()->make([
            'role' => UserRole::ADMINISTRATOR
        ]);

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $admin);

        $response = $this->middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'ADMINISTRATOR');

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('{"success":true}', $response->getContent());
    }

    public function test_middleware_denies_access_for_invalid_role(): void
    {
        $user = User::factory()->make([
            'role' => UserRole::ADMINISTRATOR
        ]);

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $user);

        $response = $this->middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'invalid_role');

        $this->assertEquals(Response::HTTP_FORBIDDEN, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals([
            'success' => false,
            'message' => 'Access denied. Invalid role configuration',
            'error_code' => 'INVALID_ROLE_CONFIG'
        ], $responseData);
    }

    public function test_middleware_handles_no_roles_provided(): void
    {
        $user = User::factory()->make([
            'role' => UserRole::ADMINISTRATOR
        ]);

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $user);

        $response = $this->middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(Response::HTTP_INTERNAL_SERVER_ERROR, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals([
            'success' => false,
            'message' => 'No roles specified for access control',
            'error_code' => 'INVALID_MIDDLEWARE_CONFIG'
        ], $responseData);
    }

    public function test_middleware_handles_soft_deleted_user(): void
    {
        $user = User::factory()->make([
            'role' => UserRole::ADMINISTRATOR,
            'deleted_at' => now()
        ]);

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $user);

        $response = $this->middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'administrator');

        $this->assertEquals(Response::HTTP_FORBIDDEN, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals([
            'success' => false,
            'message' => 'Account has been deactivated',
            'error_code' => 'ACCOUNT_DEACTIVATED'
        ], $responseData);
    }

    public function test_middleware_handles_role_aliases(): void
    {
        $user = User::factory()->make([
            'role' => UserRole::ADMINISTRATOR
        ]);

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $user);

        $response = $this->middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'admin');

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('{"success":true}', $response->getContent());
    }

    /**
     * Data provider for valid role combinations.
     */
    public static function validRoleProvider(): array
    {
        return [
            'administrator with exact match' => [UserRole::ADMINISTRATOR, ['administrator'], true],
            'administrator with alias' => [UserRole::ADMINISTRATOR, ['admin'], true],
            'administrator with uppercase' => [UserRole::ADMINISTRATOR, ['ADMINISTRATOR'], true],
            'reviewer with exact match' => [UserRole::REVIEWER, ['reviewer'], true],
            'reviewer with alias' => [UserRole::REVIEWER, ['review'], true],
            'administrator in multiple roles' => [UserRole::ADMINISTRATOR, ['administrator', 'reviewer'], true],
            'reviewer in multiple roles' => [UserRole::REVIEWER, ['administrator', 'reviewer'], true],
            'administrator with wrong role' => [UserRole::ADMINISTRATOR, ['reviewer'], false],
            'reviewer with wrong role' => [UserRole::REVIEWER, ['administrator'], false],
        ];
    }

    /**
     * @dataProvider validRoleProvider
     */
    public function test_middleware_role_access_scenarios(UserRole $userRole, array $requiredRoles, bool $shouldAllow): void
    {
        $user = User::factory()->make(['role' => $userRole]);
        $request = $this->createRequestWithUser($user);

        if (!$shouldAllow) {
            $this->expectException(\App\Exceptions\RolePermissionException::class);
        }

        $response = $this->middleware->handle($request, $this->createNextClosure(), ...$requiredRoles);

        if ($shouldAllow) {
            $this->assertEquals(200, $response->getStatusCode());
            $this->assertEquals('{"success":true}', $response->getContent());
        }
    }
}

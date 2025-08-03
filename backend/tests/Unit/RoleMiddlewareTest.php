<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Http\Middleware\RoleMiddleware;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    private RoleMiddleware $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new RoleMiddleware();
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

        $response = $this->middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'administrator');

        $this->assertEquals(Response::HTTP_FORBIDDEN, $response->getStatusCode());
        $this->assertStringContainsString('Unauthorized', $response->getContent());
    }

    public function test_middleware_denies_access_for_unauthenticated_user(): void
    {
        $request = Request::create('/test');
        $request->setUserResolver(fn() => null);

        $response = $this->middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'administrator');

        $this->assertEquals(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
        $this->assertStringContainsString('Unauthenticated', $response->getContent());
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
        $this->assertStringContainsString('Unauthorized', $response->getContent());
    }
}

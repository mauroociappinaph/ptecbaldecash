<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check route
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'User Management API is running',
        'timestamp' => now()->toISOString()
    ]);
});

// Session check for nuxt-auth-utils (temporarily unprotected for debugging)
Route::get('/_auth/session', function (Request $request) {
    return response()->json($request->user());
});

// Authentication routes
Route::prefix('auth')->group(function () {
    // Login route with strict rate limiting (5 attempts per minute per IP)
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware(app()->environment('testing') ? [] : 'throttle:login');

    // Protected authentication routes
    Route::middleware(array_filter(['auth:sanctum', app()->environment('testing') ? null : 'throttle:api']))->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Protected routes with general API rate limiting
Route::middleware(array_filter(['auth:sanctum', app()->environment('testing') ? null : 'throttle:api']))->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // User listing routes (both administrator and reviewer can access)
    Route::middleware('role:administrator,reviewer')->group(function () {
        Route::get('/users', [UserController::class, 'index']);

        // Test route for multi-role access
        Route::get('/user-list-test', function () {
            return response()->json([
                'message' => 'User listing access granted',
                'user' => auth()->user()->only(['id', 'name', 'email', 'role']),
                'can_manage_users' => auth()->user()->isAdministrator()
            ]);
        });
    });

    // User management routes (administrator only) with stricter rate limiting for write operations
    Route::middleware(array_filter(['role:administrator', app()->environment('testing') ? null : 'throttle:sensitive-operations']))->group(function () {
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        // Test route for administrator-only access
        Route::get('/admin-test', function () {
            return response()->json([
                'message' => 'Administrator access granted',
                'user' => auth()->user()->only(['id', 'name', 'email', 'role'])
            ]);
        });
    });
});

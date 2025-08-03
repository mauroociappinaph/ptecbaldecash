<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ApiResponseTrait;
    /**
     * Transform user data for API response.
     *
     * @param User $user
     * @return array
     */
    private function transformUserData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role->value,
            'full_name' => $user->full_name,
        ];
    }

    /**
     * Validate user credentials and return user if valid.
     *
     * @param string $email
     * @param string $password
     * @return User
     * @throws ValidationException
     */
    private function validateCredentials(string $email, string $password): User
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->trashed()) {
            throw ValidationException::withMessages([
                'email' => ['This account has been deactivated.'],
            ]);
        }

        return $user;
    }

    /**
     * Generate a new API token for the user.
     *
     * @param User $user
     * @return string
     */
    private function generateApiToken(User $user): string
    {
        // Revoke all existing tokens for security
        $user->tokens()->delete();

        // Create new API token
        return $user->createToken('auth-token')->plainTextToken;
    }

    /**
     * Handle user login and generate API token.
     *
     * @param LoginRequest $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $key = 'login_attempts:' . $request->ip();

        try {
            $user = $this->validateCredentials($request->email, $request->password);
            $token = $this->generateApiToken($user);

            // Clear rate limit on successful login
            RateLimiter::clear($key);

            Log::info('User login successful', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return $this->successResponse([
                'user' => $this->transformUserData($user),
                'token' => $token,
            ], 'Login successful');

        } catch (ValidationException $e) {
            Log::warning('Login attempt failed', [
                'email' => $request->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'errors' => $e->errors(),
                'attempts' => RateLimiter::attempts($key) + 1
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Login error occurred', [
                'email' => $request->email,
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);
            return $this->serverErrorResponse('An error occurred during login');
        }
    }

    /**
     * Handle user logout and revoke API token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Revoke the current user's token
            $request->user()->currentAccessToken()->delete();

            Log::info('User logout successful', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return $this->successResponse(null, 'Logout successful');

        } catch (\Exception $e) {
            Log::error('Logout error occurred', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);
            return $this->serverErrorResponse('An error occurred during logout');
        }
    }

    /**
     * Get the authenticated user's information.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return $this->unauthorizedResponse('User not authenticated');
            }

            return $this->successResponse([
                'user' => $this->transformUserData($user)
            ], 'User information retrieved successfully');

        } catch (\Exception $e) {
            Log::error('Error retrieving user information', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->serverErrorResponse('An error occurred while retrieving user information');
        }
    }
}

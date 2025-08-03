<?php

namespace App\Http\Controllers;

use App\Exceptions\EmailDeliveryException;
use App\Exceptions\RolePermissionException;
use App\Exceptions\UserManagementException;
use App\Http\Requests\IndexUserRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Http\Traits\ApiResponseTrait;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private UserService $userService
    ) {}

    /**
     * Display a paginated listing of users.
     *
     * @param IndexUserRequest $request
     * @return JsonResponse
     */
    public function index(IndexUserRequest $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $roleFilter = $request->get('role');

            $users = $this->userService->getPaginatedUsers($perPage, $search, $roleFilter);

            Log::info('Users retrieved successfully', [
                'user_id' => $request->user()->id,
                'per_page' => $perPage,
                'search' => $search,
                'role_filter' => $roleFilter,
                'total_users' => $users->total()
            ]);

            return (new UserCollection($users))
                ->additional([
                    'success' => true,
                    'message' => 'Users retrieved successfully'
                ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve users', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->serverErrorResponse('Failed to retrieve users');
        }
    }

    /**
     * Store a newly created user in storage.
     *
     * @param StoreUserRequest $request
     * @return JsonResponse
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        try {
            $user = $this->userService->createUser($request->validated(), $request->user());

            Log::info('User created successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role->value,
                'created_by' => $request->user()->id
            ]);

            return $this->successResponse(
                new UserResource($user),
                'User created successfully',
                201
            );

        } catch (EmailDeliveryException $e) {
            // User was created but email failed - return partial success
            Log::warning('User created but email delivery failed', [
                'user_id' => $e->getRecipient(),
                'email_type' => $e->getEmailType(),
                'error' => $e->getMessage()
            ]);

            throw $e; // Let the exception handler format the response

        } catch (UserManagementException $e) {
            Log::error('User creation failed - business logic error', [
                'error' => $e->getMessage(),
                'error_code' => $e->getErrorCode(),
                'created_by' => $request->user()->id,
                'request_data' => $request->only(['name', 'last_name', 'email', 'role'])
            ]);

            throw $e; // Let the exception handler format the response

        } catch (\Exception $e) {
            Log::error('User creation failed - unexpected error', [
                'error' => $e->getMessage(),
                'created_by' => $request->user()->id,
                'request_data' => $request->only(['name', 'last_name', 'email', 'role']),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->serverErrorResponse('Failed to create user. Please try again.');
        }
    }

    /**
     * Update the specified user in storage.
     *
     * @param UpdateUserRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        try {
            // Find user including soft deleted ones
            $user = $this->userService->findUserWithTrashed($id);

            // Check if user exists
            if (!$user) {
                return $this->notFoundResponse('User not found');
            }

            // Check if user is soft deleted
            if ($user->trashed()) {
                return $this->notFoundResponse('User not found or has been deleted');
            }

            $updatedUser = $this->userService->updateUser($user, $request->validated(), $request->user());

            Log::info('User updated successfully', [
                'user_id' => $updatedUser->id,
                'email' => $updatedUser->email,
                'updated_by' => $request->user()->id,
                'changes' => $request->only(['name', 'last_name', 'email', 'role'])
            ]);

            return $this->successResponse(
                new UserResource($updatedUser),
                'User updated successfully'
            );

        } catch (UserManagementException $e) {
            Log::error('User update failed - business logic error', [
                'error' => $e->getMessage(),
                'error_code' => $e->getErrorCode(),
                'updated_by' => $request->user()->id,
                'user_id' => $id,
                'request_data' => $request->only(['name', 'last_name', 'email', 'role'])
            ]);

            throw $e; // Let the exception handler format the response

        } catch (\Exception $e) {
            Log::error('User update failed - unexpected error', [
                'error' => $e->getMessage(),
                'updated_by' => $request->user()->id,
                'user_id' => $id,
                'request_data' => $request->only(['name', 'last_name', 'email', 'role']),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->serverErrorResponse('Failed to update user. Please try again.');
        }
    }

    /**
     * Remove the specified user from storage (soft delete).
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            // Authorization check - only administrators can delete users
            if (!$request->user()->isAdministrator()) {
                throw new RolePermissionException('Only administrators can delete users');
            }

            // Find user including soft deleted ones
            $user = $this->userService->findUserWithTrashed($id);

            // Check if user exists
            if (!$user) {
                return $this->notFoundResponse('User not found');
            }

            // Check if user is already soft deleted
            if ($user->trashed()) {
                return $this->notFoundResponse('User not found or has already been deleted');
            }

            // Prevent self-deletion
            if ($user->id === $request->user()->id) {
                throw new UserManagementException(
                    'You cannot delete your own account',
                    'SELF_DELETION_NOT_ALLOWED',
                    422
                );
            }

            $deletedUser = $this->userService->deleteUser($user, $request->user());

            Log::info('User deleted successfully', [
                'user_id' => $deletedUser->id,
                'email' => $deletedUser->email,
                'deleted_by' => $request->user()->id,
                'deleted_at' => $deletedUser->deleted_at
            ]);

            return $this->successResponse([
                'id' => $deletedUser->id,
                'email' => $deletedUser->email,
                'deleted_at' => $deletedUser->deleted_at->toISOString(),
            ], 'User deleted successfully');

        } catch (RolePermissionException | UserManagementException $e) {
            Log::warning('User deletion failed - business logic error', [
                'error' => $e->getMessage(),
                'deleted_by' => $request->user()->id,
                'user_id' => $id
            ]);

            throw $e; // Let the exception handler format the response

        } catch (\Exception $e) {
            Log::error('User deletion failed - unexpected error', [
                'error' => $e->getMessage(),
                'deleted_by' => $request->user()->id,
                'user_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return $this->serverErrorResponse('Failed to delete user. Please try again.');
        }
    }
}

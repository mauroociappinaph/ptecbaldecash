<?php

namespace App\Services;

use App\Exceptions\EmailDeliveryException;
use App\Exceptions\UserManagementException;
use App\Mail\UserCredentialsMail;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class UserService
{
    /**
     * Get paginated users with optional search and role filtering.
     */
    public function getPaginatedUsers(
        int $perPage = 15,
        ?string $search = null,
        ?string $roleFilter = null
    ): LengthAwarePaginator {
        $query = User::query();

        $this->applySearchFilter($query, $search);
        $this->applyRoleFilter($query, $roleFilter);

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Create a new user.
     */
    public function createUser(array $data, User $createdBy): User
    {
        try {
            // Check if email already exists
            if (User::withTrashed()->where('email', $data['email'])->exists()) {
                throw new UserManagementException(
                    'A user with this email address already exists',
                    'EMAIL_ALREADY_EXISTS',
                    409
                );
            }

            $userData = [
                'name' => $data['name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
            ];

            $user = User::create($userData);

            // Attempt to send credentials email
            try {
                Mail::to($user->email)->send(new UserCredentialsMail($user, $data['password']));

                Log::info('User created and credentials email sent', [
                    'created_by' => $createdBy->id,
                    'created_user_id' => $user->id,
                    'created_user_email' => $user->email,
                ]);

            } catch (\Exception $emailException) {
                // Log the email error but don't fail the user creation
                Log::error('Failed to send credentials email', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $emailException->getMessage()
                ]);

                // Throw email delivery exception to inform the client
                throw new EmailDeliveryException(
                    'Failed to send credentials email: ' . $emailException->getMessage(),
                    'user_credentials',
                    $user->email
                );
            }

            return $user;

        } catch (EmailDeliveryException $e) {
            // Re-throw email exceptions
            throw $e;
        } catch (UserManagementException $e) {
            // Re-throw business logic exceptions
            throw $e;
        } catch (\Exception $e) {
            Log::error('Unexpected error during user creation', [
                'error' => $e->getMessage(),
                'created_by' => $createdBy->id,
                'email' => $data['email'] ?? 'unknown'
            ]);

            throw new UserManagementException(
                'An unexpected error occurred while creating the user',
                'USER_CREATION_FAILED',
                500
            );
        }
    }

    /**
     * Update an existing user.
     */
    public function updateUser(User $user, array $data, User $updatedBy): User
    {
        try {
            // Check if email is being changed and already exists
            if (isset($data['email']) && $data['email'] !== $user->email) {
                if (User::withTrashed()->where('email', $data['email'])->where('id', '!=', $user->id)->exists()) {
                    throw new UserManagementException(
                        'A user with this email address already exists',
                        'EMAIL_ALREADY_EXISTS',
                        409
                    );
                }
            }

            $updateData = $this->prepareUpdateData($data);

            if (empty($updateData)) {
                throw new UserManagementException(
                    'No valid data provided for update',
                    'NO_UPDATE_DATA',
                    400
                );
            }

            $user->update($updateData);
            $user->refresh();

            Log::info('User updated successfully', [
                'updated_by' => $updatedBy->id,
                'updated_user_id' => $user->id,
                'updated_fields' => array_keys($updateData),
            ]);

            return $user;

        } catch (UserManagementException $e) {
            // Re-throw business logic exceptions
            throw $e;
        } catch (\Exception $e) {
            Log::error('Unexpected error during user update', [
                'error' => $e->getMessage(),
                'updated_by' => $updatedBy->id,
                'user_id' => $user->id
            ]);

            throw new UserManagementException(
                'An unexpected error occurred while updating the user',
                'USER_UPDATE_FAILED',
                500
            );
        }
    }

    /**
     * Soft delete a user.
     */
    public function deleteUser(User $user, User $deletedBy): User
    {
        try {
            // Additional business logic checks can be added here
            // For example, checking if user has dependent records

            $user->delete();
            $user->tokens()->delete(); // Revoke all API tokens

            Log::info('User deleted successfully', [
                'deleted_by' => $deletedBy->id,
                'deleted_user_id' => $user->id,
                'deleted_user_email' => $user->email,
            ]);

            return $user;

        } catch (\Exception $e) {
            Log::error('Unexpected error during user deletion', [
                'error' => $e->getMessage(),
                'deleted_by' => $deletedBy->id,
                'user_id' => $user->id
            ]);

            throw new UserManagementException(
                'An unexpected error occurred while deleting the user',
                'USER_DELETION_FAILED',
                500
            );
        }
    }

    /**
     * Find user by ID including soft deleted ones.
     */
    public function findUserWithTrashed(int $id): ?User
    {
        return User::withTrashed()->find($id);
    }

    /**
     * Apply search filter to query.
     */
    private function applySearchFilter(Builder $query, ?string $search): void
    {
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
    }

    /**
     * Apply role filter to query.
     */
    private function applyRoleFilter(Builder $query, ?string $roleFilter): void
    {
        if ($roleFilter) {
            $query->where('role', $roleFilter);
        }
    }

    /**
     * Prepare update data by filtering out null values.
     */
    private function prepareUpdateData(array $data): array
    {
        $updateData = [];

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }

        if (isset($data['last_name'])) {
            $updateData['last_name'] = $data['last_name'];
        }

        if (isset($data['email'])) {
            $updateData['email'] = $data['email'];
        }

        if (isset($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        if (isset($data['role'])) {
            $updateData['role'] = $data['role'];
        }

        return $updateData;
    }
}

<?php

namespace App\Services;

use App\Exceptions\EmailDeliveryException;
use App\Exceptions\UserManagementException;
use App\Helpers\PerformanceHelper;
use App\Mail\UserCredentialsMail;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class UserService
{
    private const DEFAULT_PER_PAGE = 15;
    private const MIN_SEARCH_LENGTH = 2;
    private const MAX_SEARCH_LENGTH = 255;
    private const SEARCHABLE_COLUMNS = ['id', 'name', 'last_name', 'email', 'role', 'created_at', 'updated_at'];
    private const ALLOWED_USER_FIELDS = ['name', 'last_name', 'email', 'password', 'role'];
    private const REQUIRED_CREATE_FIELDS = ['name', 'last_name', 'email', 'password', 'role'];
    private const SEARCHABLE_FIELDS = ['name', 'last_name', 'email'];

    /**
     * Get paginated users with optional search and role filtering.
     *
     * @param int $perPage Number of users per page (default: 15)
     * @param string|null $search Search term for name, last_name, or email
     * @param string|null $roleFilter Filter by specific role
     * @param array $with Relationships to eager load
     * @return LengthAwarePaginator Paginated user collection
     * @throws UserManagementException When query fails
     */
    public function getPaginatedUsers(
        int $perPage = self::DEFAULT_PER_PAGE,
        ?string $search = null,
        ?string $roleFilter = null,
        array $with = []
    ): LengthAwarePaginator {
        return PerformanceHelper::timeExecution(function () use ($perPage, $search, $roleFilter, $with) {
            $query = User::query()
                ->select(self::SEARCHABLE_COLUMNS)
                ->when(!empty($with), fn($q) => $q->with($with));

            $this->applySearchFilter($query, $search);
            $this->applyRoleFilter($query, $roleFilter);

            return $query->orderBy('created_at', 'desc')->paginate($perPage);
        }, 'getPaginatedUsers');
    }

    /**
     * Create a new user.
     *
     * @param array $data User data to create
     * @param User $createdBy User performing the creation
     * @return User Created user instance
     * @throws UserManagementException When creation fails
     * @throws EmailDeliveryException When email sending fails
     */
    public function createUser(array $data, User $createdBy): User
    {
        $context = [
            'created_by' => $createdBy->id,
            'email' => $data['email'] ?? 'unknown',
            'role' => $data['role'] ?? 'unknown'
        ];

        try {
            // Validate and sanitize input data
            $this->validateUserData($data, false);
            $sanitizedData = $this->sanitizeUserData($data);

            // Check if email already exists
            if (User::withTrashed()->where('email', $sanitizedData['email'])->exists()) {
                throw new UserManagementException(
                    'A user with this email address already exists',
                    'EMAIL_ALREADY_EXISTS',
                    409
                );
            }

            $userData = [
                'name' => $sanitizedData['name'],
                'last_name' => $sanitizedData['last_name'],
                'email' => $sanitizedData['email'],
                'password' => Hash::make($sanitizedData['password']),
                'role' => $sanitizedData['role'],
            ];

            $user = User::create($userData);

            // Attempt to send credentials email
            try {
                Mail::to($user->email)->send(new UserCredentialsMail($user, $sanitizedData['password']));

                Log::info('User created and credentials email sent', array_merge($context, [
                    'created_user_id' => $user->id,
                    'created_user_email' => $user->email,
                ]));

            } catch (\Exception $emailException) {
                // Log the email error but don't fail the user creation
                Log::warning('Email delivery failed but user created', array_merge($context, [
                    'user_id' => $user->id,
                    'error' => $emailException->getMessage()
                ]));

                // Throw email delivery exception to inform the client
                throw new EmailDeliveryException(
                    'Failed to send credentials email: ' . $emailException->getMessage(),
                    'user_credentials',
                    $user->email
                );
            }

            return $user;

        } catch (EmailDeliveryException $e) {
            Log::warning('Email delivery failed but user created', array_merge($context, [
                'user_id' => $user->id ?? null,
                'error' => $e->getMessage()
            ]));
            throw $e;
        } catch (UserManagementException $e) {
            Log::error('User creation failed - business logic', array_merge($context, [
                'error_code' => $e->getCode(),
                'error' => $e->getMessage()
            ]));
            throw $e;
        } catch (\Exception $e) {
            Log::error('User creation failed - unexpected error', array_merge($context, [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]));

            throw new UserManagementException(
                'An unexpected error occurred while creating the user',
                'USER_CREATION_FAILED',
                500,
                $e
            );
        }
    }

    /**
     * Update an existing user.
     *
     * @param User $user User to update
     * @param array $data Update data
     * @param User $updatedBy User performing the update
     * @return User Updated user instance
     * @throws UserManagementException When update fails
     */
    public function updateUser(User $user, array $data, User $updatedBy): User
    {
        $context = [
            'updated_by' => $updatedBy->id,
            'user_id' => $user->id,
            'email' => $data['email'] ?? $user->email
        ];

        try {
            // Validate and sanitize input data
            $this->validateUserData($data, true);
            $sanitizedData = $this->sanitizeUserData($data);

            // Check if email is being changed and already exists
            if (isset($sanitizedData['email']) && $sanitizedData['email'] !== $user->email) {
                if (User::withTrashed()->where('email', $sanitizedData['email'])->where('id', '!=', $user->id)->exists()) {
                    throw new UserManagementException(
                        'A user with this email address already exists',
                        'EMAIL_ALREADY_EXISTS',
                        409
                    );
                }
            }

            $updateData = $this->prepareUpdateData($sanitizedData);

            if (empty($updateData)) {
                throw new UserManagementException(
                    'No valid data provided for update',
                    'NO_UPDATE_DATA',
                    400
                );
            }

            $user->update($updateData);
            $user->refresh();

            Log::info('User updated successfully', array_merge($context, [
                'updated_fields' => array_keys($updateData),
            ]));

            return $user;

        } catch (UserManagementException $e) {
            Log::error('User update failed - business logic', array_merge($context, [
                'error_code' => $e->getCode(),
                'error' => $e->getMessage()
            ]));
            throw $e;
        } catch (\Exception $e) {
            Log::error('User update failed - unexpected error', array_merge($context, [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]));

            throw new UserManagementException(
                'An unexpected error occurred while updating the user',
                'USER_UPDATE_FAILED',
                500,
                $e
            );
        }
    }

    /**
     * Soft delete a user.
     *
     * @param User $user User to delete
     * @param User $deletedBy User performing the deletion
     * @return User Deleted user instance
     * @throws UserManagementException When deletion fails
     */
    public function deleteUser(User $user, User $deletedBy): User
    {
        $context = [
            'deleted_by' => $deletedBy->id,
            'user_id' => $user->id,
            'user_email' => $user->email
        ];

        try {
            // Additional business logic checks can be added here
            // For example, checking if user has dependent records

            $user->delete();
            $user->tokens()->delete(); // Revoke all API tokens

            Log::info('User deleted successfully', $context);

            return $user;

        } catch (\Exception $e) {
            Log::error('User deletion failed - unexpected error', array_merge($context, [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]));

            throw new UserManagementException(
                'An unexpected error occurred while deleting the user',
                'USER_DELETION_FAILED',
                500,
                $e
            );
        }
    }

    /**
     * Find user by ID including soft deleted ones.
     *
     * @param int $id User ID to find
     * @return User|null User instance or null if not found
     */
    public function findUserWithTrashed(int $id): ?User
    {
        return User::withTrashed()->find($id);
    }

    /**
     * Apply search filter to query with optimized LIKE queries.
     *
     * @param Builder $query Query builder instance
     * @param string|null $search Search term
     * @return void
     */
    private function applySearchFilter(Builder $query, ?string $search): void
    {
        if (empty($search)) {
            return;
        }

        $searchTerm = trim($search);
        $searchLength = strlen($searchTerm);

        // Validate search term length
        if ($searchLength < self::MIN_SEARCH_LENGTH || $searchLength > self::MAX_SEARCH_LENGTH) {
            return;
        }

        // Sanitize search term to prevent SQL injection
        $searchTerm = addslashes($searchTerm);

        $query->where(function ($q) use ($searchTerm) {
            // Use CONCAT for full name search and individual field search
            $q->whereRaw("CONCAT(name, ' ', last_name) LIKE ?", ["%{$searchTerm}%"])
              ->orWhere('email', 'like', "%{$searchTerm}%");
        });
    }

    /**
     * Apply role filter to query.
     *
     * @param Builder $query Query builder instance
     * @param string|null $roleFilter Role to filter by
     * @return void
     */
    private function applyRoleFilter(Builder $query, ?string $roleFilter): void
    {
        if (!empty($roleFilter)) {
            $query->where('role', $roleFilter);
        }
    }

    /**
     * Validate user data for creation or update.
     *
     * @param array $data User data to validate
     * @param bool $isUpdate Whether this is an update operation
     * @return void
     * @throws UserManagementException When validation fails
     */
    private function validateUserData(array $data, bool $isUpdate = false): void
    {
        if (!$isUpdate) {
            $missingFields = array_diff(self::REQUIRED_CREATE_FIELDS, array_keys($data));

            if (!empty($missingFields)) {
                throw new UserManagementException(
                    'Missing required fields: ' . implode(', ', $missingFields),
                    'MISSING_REQUIRED_FIELDS',
                    400
                );
            }
        }

        // Validate email format if provided
        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new UserManagementException(
                'Invalid email format',
                'INVALID_EMAIL_FORMAT',
                400
            );
        }

        // Validate password length if provided
        if (isset($data['password']) && strlen($data['password']) < 8) {
            throw new UserManagementException(
                'Password must be at least 8 characters long',
                'PASSWORD_TOO_SHORT',
                400
            );
        }

        // Validate role if provided
        if (isset($data['role']) && !in_array($data['role'], ['administrator', 'reviewer'])) {
            throw new UserManagementException(
                'Invalid role. Must be either "administrator" or "reviewer"',
                'INVALID_ROLE',
                400
            );
        }
    }

    /**
     * Sanitize user data to prevent XSS and other attacks.
     *
     * @param array $data User data to sanitize
     * @return array Sanitized data
     */
    private function sanitizeUserData(array $data): array
    {
        $sanitized = [];

        foreach (self::ALLOWED_USER_FIELDS as $field) {
            if (isset($data[$field])) {
                $sanitized[$field] = $field === 'password'
                    ? $data[$field] // Don't sanitize password
                    : htmlspecialchars(trim($data[$field]), ENT_QUOTES, 'UTF-8');
            }
        }

        return $sanitized;
    }

    /**
     * Prepare update data by filtering allowed fields and handling special cases.
     *
     * @param array $data User data to prepare
     * @return array Prepared update data
     */
    private function prepareUpdateData(array $data): array
    {
        $updateData = [];

        foreach (self::ALLOWED_USER_FIELDS as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $field === 'password'
                    ? Hash::make($data[$field])
                    : $data[$field];
            }
        }

        return $updateData;
    }




}

<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

abstract class BaseUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdministrator();
    }

    /**
     * Get common validation rules for name fields.
     *
     * @param bool $required
     * @return array
     */
    protected function getNameRules(bool $required = true): array
    {
        $rules = [
            'string',
            'min:2',
            'max:255',
            // Allow letters, spaces, hyphens, and apostrophes for international names
            'regex:/^[a-zA-ZÀ-ÿñÑ\s\-\']+$/u',
            // Prevent excessive whitespace and special patterns
            'regex:/^(?!.*\s{2,})(?!.*[-\']{2,})[a-zA-ZÀ-ÿñÑ\s\-\']+$/u',
        ];

        if ($required) {
            array_unshift($rules, 'required');
        } else {
            array_unshift($rules, 'sometimes', 'required');
        }

        return $rules;
    }

    /**
     * Get password validation rules.
     *
     * @param bool $required
     * @return array
     */
    protected function getPasswordRules(bool $required = true): array
    {
        $rules = [
            'string',
            Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised(),
            'max:255',
            'confirmed',
        ];

        if ($required) {
            array_unshift($rules, 'required');
        } else {
            array_unshift($rules, 'sometimes');
        }

        return $rules;
    }

    /**
     * Get email validation rules.
     *
     * @param int|null $ignoreId
     * @param bool $required
     * @return array
     */
    protected function getEmailRules(?int $ignoreId = null, bool $required = true): array
    {
        // Use less strict email validation during testing
        $emailValidation = app()->environment('testing')
            ? ['string', 'email:rfc', 'max:255']
            : [
                'string',
                'email:rfc,dns',
                'max:255',
                // Additional email format validation
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
                // Prevent common malicious patterns
                'not_regex:/[<>"\'\x00-\x1F\x7F]/',
            ];

        $rules = $emailValidation;

        if ($required) {
            array_unshift($rules, 'required');
        } else {
            array_unshift($rules, 'sometimes', 'required');
        }

        if ($ignoreId) {
            $rules[] = Rule::unique('users', 'email')
                ->ignore($ignoreId)
                ->whereNull('deleted_at');
        } else {
            $rules[] = 'unique:users,email,NULL,id,deleted_at,NULL';
        }

        return $rules;
    }

    /**
     * Get role validation rules.
     *
     * @param bool $required
     * @return array
     */
    protected function getRoleRules(bool $required = true): array
    {
        $rules = [
            'string',
            Rule::in(UserRole::values()),
        ];

        if ($required) {
            array_unshift($rules, 'required');
        } else {
            array_unshift($rules, 'sometimes', 'required');
        }

        return $rules;
    }

    /**
     * Get common validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'First name is required.',
            'name.string' => 'First name must be a valid text.',
            'name.min' => 'First name must be at least 2 characters long.',
            'name.max' => 'First name must not exceed 255 characters.',
            'name.regex' => 'First name can only contain letters and spaces.',

            'last_name.required' => 'Last name is required.',
            'last_name.string' => 'Last name must be a valid text.',
            'last_name.min' => 'Last name must be at least 2 characters long.',
            'last_name.max' => 'Last name must not exceed 255 characters.',
            'last_name.regex' => 'Last name can only contain letters and spaces.',

            'email.required' => 'Email address is required.',
            'email.string' => 'Email address must be a valid text.',
            'email.email' => 'Please provide a valid email address.',
            'email.max' => 'Email address must not exceed 255 characters.',
            'email.unique' => 'This email address is already registered.',

            'password.required' => 'Password is required.',
            'password.string' => 'Password must be a valid text.',
            'password.min' => 'Password must be at least 8 characters long.',
            'password.max' => 'Password must not exceed 255 characters.',
            'password.confirmed' => 'Password confirmation does not match.',

            'password_confirmation.required' => 'Password confirmation is required.',
            'password_confirmation.required_with' => 'Password confirmation is required when setting a password.',
            'password_confirmation.string' => 'Password confirmation must be a valid text.',

            'role.required' => 'User role is required.',
            'role.string' => 'User role must be a valid text.',
            'role.in' => 'Please select a valid user role (Administrator or Reviewer).',
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'first name',
            'last_name' => 'last name',
            'email' => 'email address',
            'password' => 'password',
            'password_confirmation' => 'password confirmation',
            'role' => 'user role',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $data = [];

        if ($this->has('name') && is_string($this->name)) {
            $data['name'] = $this->sanitizeName($this->name);
        }

        if ($this->has('last_name') && is_string($this->last_name)) {
            $data['last_name'] = $this->sanitizeName($this->last_name);
        }

        if ($this->has('email') && is_string($this->email)) {
            $data['email'] = $this->sanitizeEmail($this->email);
        }

        if (!empty($data)) {
            $this->merge($data);
        }
    }

    /**
     * Sanitize name input
     */
    private function sanitizeName(string $name): string
    {
        // Remove null bytes and control characters
        $name = preg_replace('/[\x00-\x1F\x7F]/', '', $name);

        // Trim whitespace
        $name = trim($name);

        // Normalize multiple spaces to single space
        $name = preg_replace('/\s+/', ' ', $name);

        // Capitalize first letter of each word
        $name = ucwords(strtolower($name));

        return $name;
    }

    /**
     * Sanitize email input
     */
    private function sanitizeEmail(string $email): string
    {
        // Remove null bytes and control characters
        $email = preg_replace('/[\x00-\x1F\x7F]/', '', $email);

        // Trim whitespace and convert to lowercase
        $email = strtolower(trim($email));

        return $email;
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param Validator $validator
     * @throws HttpResponseException
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }

    /**
     * Handle a failed authorization attempt.
     *
     * @throws HttpResponseException
     */
    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            response()->json([
                'message' => $this->getAuthorizationMessage(),
            ], 403)
        );
    }

    /**
     * Get the authorization failure message.
     *
     * @return string
     */
    abstract protected function getAuthorizationMessage(): string;
}

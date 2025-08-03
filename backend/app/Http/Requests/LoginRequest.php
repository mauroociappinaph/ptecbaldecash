<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Use less strict email validation during testing
        $emailValidation = app()->environment('testing')
            ? ['required', 'email:rfc', 'max:255']
            : [
                'required',
                'email:rfc,dns',
                'max:255',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
            ];

        return [
            'email' => $emailValidation,
            'password' => [
                'required',
                'string',
                'min:6',
                'max:255',
                // Prevent common injection patterns
                'regex:/^[^\x00-\x1F\x7F]*$/',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.regex' => 'Please provide a valid email address format.',
            'email.max' => 'Email address must not exceed 255 characters.',
            'password.required' => 'Password is required.',
            'password.string' => 'Password must be a valid string.',
            'password.min' => 'Password must be at least 6 characters long.',
            'password.max' => 'Password must not exceed 255 characters.',
            'password.regex' => 'Password contains invalid characters.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => $this->sanitizeEmail($this->input('email')),
        ]);
    }

    /**
     * Sanitize email input
     */
    private function sanitizeEmail(?string $email): ?string
    {
        if (!$email) {
            return $email;
        }

        // Remove whitespace and convert to lowercase
        $email = strtolower(trim($email));

        // Remove any null bytes or control characters
        $email = preg_replace('/[\x00-\x1F\x7F]/', '', $email);

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
        // Log failed validation attempts for security monitoring
        \Log::warning('Login validation failed', [
            'ip' => $this->ip(),
            'user_agent' => $this->userAgent(),
            'email' => $this->input('email'),
            'errors' => $validator->errors()->toArray(),
        ]);

        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'error_code' => 'VALIDATION_ERROR'
            ], 422)
        );
    }
}

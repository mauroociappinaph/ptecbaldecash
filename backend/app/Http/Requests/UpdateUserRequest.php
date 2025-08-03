<?php

namespace App\Http\Requests;

class UpdateUserRequest extends BaseUserRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'name' => $this->getNameRules(false),
            'last_name' => $this->getNameRules(false),
            'email' => $this->getEmailRules($userId, false),
            'password' => $this->getPasswordRules(false),
            'password_confirmation' => [
                'required_with:password',
                'string',
            ],
            'role' => $this->getRoleRules(false),
        ];
    }

    /**
     * Get the authorization failure message.
     *
     * @return string
     */
    protected function getAuthorizationMessage(): string
    {
        return 'You are not authorized to update users.';
    }
}

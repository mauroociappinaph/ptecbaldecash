<?php

namespace App\Http\Requests;

class StoreUserRequest extends BaseUserRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => $this->getNameRules(),
            'last_name' => $this->getNameRules(),
            'email' => $this->getEmailRules(),
            'password' => $this->getPasswordRules(),
            'password_confirmation' => [
                'required',
                'string',
            ],
            'role' => $this->getRoleRules(),
        ];
    }

    /**
     * Get the authorization failure message.
     *
     * @return string
     */
    protected function getAuthorizationMessage(): string
    {
        return 'You are not authorized to create users.';
    }
}

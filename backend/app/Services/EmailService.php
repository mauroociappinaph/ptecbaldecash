<?php

namespace App\Services;

use App\Exceptions\EmailDeliveryException;
use App\Mail\UserCredentialsMail;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    /**
     * Send user credentials email.
     */
    public function sendUserCredentials(User $user, string $password): void
    {
        try {
            Mail::to($user->email)->send(new UserCredentialsMail($user, $password));

            Log::info('User credentials email sent successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send credentials email', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw new EmailDeliveryException(
                'Failed to send credentials email: ' . $e->getMessage(),
                'user_credentials',
                $user->email
            );
        }
    }

    /**
     * Send password reset email.
     */
    public function sendPasswordReset(User $user, string $token): void
    {
        // Implementation for password reset emails
        // This can be added when password reset functionality is needed
    }

    /**
     * Send account activation email.
     */
    public function sendAccountActivation(User $user, string $token): void
    {
        // Implementation for account activation emails
        // This can be added when account activation functionality is needed
    }

    /**
     * Test email configuration.
     */
    public function testEmailConfiguration(): bool
    {
        try {
            // Send a test email to verify configuration
            Mail::raw('Test email from User Management System', function ($message) {
                $message->to(config('mail.test_recipient', 'test@example.com'))
                        ->subject('Email Configuration Test');
            });

            return true;
        } catch (\Exception $e) {
            Log::error('Email configuration test failed', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}

<?php

namespace Tests\Feature;

use App\Mail\UserCredentialsMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class UserCredentialsMailIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_credentials_mail_can_be_queued(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'role' => 'administrator'
        ]);

        $password = 'test-password-123';

        Mail::to($user->email)->send(new UserCredentialsMail($user, $password));

        Mail::assertQueued(UserCredentialsMail::class, function ($mail) use ($user) {
            return $mail->user->id === $user->id &&
                   $mail->hasTo($user->email);
        });
    }

    public function test_user_credentials_mail_contains_correct_data(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'role' => 'reviewer'
        ]);

        $password = 'secure-password-456';

        $mail = new UserCredentialsMail($user, $password);

        Mail::to($user->email)->send($mail);

        Mail::assertQueued(UserCredentialsMail::class, function ($queuedMail) use ($user, $password) {
            $rendered = $queuedMail->render();

            return str_contains($rendered, 'John Doe') &&
                   str_contains($rendered, 'john.doe@example.com') &&
                   str_contains($rendered, 'secure-password-456') &&
                   str_contains($rendered, 'Reviewer') &&
                   str_contains($rendered, 'Welcome to User Management System');
        });
    }
}

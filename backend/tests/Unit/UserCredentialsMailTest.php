<?php

namespace Tests\Unit;

use App\Mail\UserCredentialsMail;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Contracts\Queue\ShouldQueue;
use InvalidArgumentException;

class UserCredentialsMailTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_credentials_mail_can_be_created(): void
    {
        $user = User::factory()->create([
            'name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'role' => 'administrator'
        ]);

        $password = 'test-password-123';

        $mail = new UserCredentialsMail($user, $password);

        $this->assertEquals($user, $mail->user);
    }

    public function test_user_credentials_mail_implements_should_queue(): void
    {
        $user = User::factory()->create();
        $password = 'test-password-123';

        $mail = new UserCredentialsMail($user, $password);

        $this->assertInstanceOf(ShouldQueue::class, $mail);
        $this->assertEquals(3, $mail->tries);
        $this->assertEquals(60, $mail->backoff);
    }

    public function test_user_credentials_mail_validates_empty_password(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Password cannot be empty');

        $user = User::factory()->create();
        new UserCredentialsMail($user, '');
    }

    public function test_user_credentials_mail_validates_short_password(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Password must be at least 8 characters long');

        $user = User::factory()->create();
        new UserCredentialsMail($user, '1234567');
    }

    public function test_user_credentials_mail_accepts_valid_password(): void
    {
        $user = User::factory()->create();
        $password = 'valid-password-123';

        $mail = new UserCredentialsMail($user, $password);

        $this->assertInstanceOf(UserCredentialsMail::class, $mail);
    }

    public function test_user_credentials_mail_has_correct_subject(): void
    {
        $user = User::factory()->create();
        $password = 'test-password-123';

        $mail = new UserCredentialsMail($user, $password);
        $envelope = $mail->envelope();

        $this->assertEquals('Welcome to User Management System - Your Account Credentials', $envelope->subject);
    }

    public function test_user_credentials_mail_uses_correct_view(): void
    {
        $user = User::factory()->create();
        $password = 'test-password-123';

        $mail = new UserCredentialsMail($user, $password);
        $content = $mail->content();

        $this->assertEquals('emails.user-credentials', $content->view);
    }

    public function test_user_credentials_mail_passes_data_to_view(): void
    {
        $user = User::factory()->create([
            'name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
            'role' => 'reviewer'
        ]);

        $password = 'secure-password-123';

        $mail = new UserCredentialsMail($user, $password);
        $content = $mail->content();

        $this->assertArrayHasKey('user', $content->with);
        $this->assertArrayHasKey('password', $content->with);
        $this->assertEquals($user, $content->with['user']);
        $this->assertEquals($password, $content->with['password']);
    }

    public function test_user_credentials_mail_renders_correctly(): void
    {
        $user = User::factory()->create([
            'name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
            'role' => 'reviewer'
        ]);

        $password = 'secure-password-123';

        $mail = new UserCredentialsMail($user, $password);
        $rendered = $mail->render();

        $this->assertStringContainsString('Jane Smith', $rendered);
        $this->assertStringContainsString('jane@example.com', $rendered);
        $this->assertStringContainsString('secure-password-123', $rendered);
        $this->assertStringContainsString('Reviewer', $rendered);
        $this->assertStringContainsString('Welcome to User Management System', $rendered);
    }

    public function test_user_credentials_mail_envelope_configuration(): void
    {
        $user = User::factory()->create();
        $password = 'test-password-123';

        $mail = new UserCredentialsMail($user, $password);
        $envelope = $mail->envelope();

        $this->assertNotNull($envelope->from);
        $this->assertNotNull($envelope->replyTo);
    }
}

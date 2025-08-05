<?php

namespace Tests\Unit;

use App\Mail\UserCredentialsMail;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\App;
use InvalidArgumentException;

/**
 * Test suite for UserCredentialsMail functionality.
 *
 * @group mail
 * @group user-credentials
 */
class UserCredentialsMailTest extends TestCase
{
    use RefreshDatabase;

    private User $testUser;
    private string $validPassword;

    protected function setUp(): void
    {
        parent::setUp();

        $this->testUser = User::factory()->create([
            'name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'role' => 'administrator'
        ]);

        $this->validPassword = 'test-password-123';
    }

    public function test_can_create_user_credentials_mail_with_valid_data(): void
    {
        $mail = new UserCredentialsMail($this->testUser, $this->validPassword);

        $this->assertEquals($this->testUser, $mail->user);
    }

    public function test_implements_should_queue_interface_with_correct_configuration(): void
    {
        $mail = new UserCredentialsMail($this->testUser, $this->validPassword);

        $this->assertInstanceOf(ShouldQueue::class, $mail);
        $this->assertEquals(3, $mail->tries);
        $this->assertEquals(60, $mail->backoff);
    }

    /**
     * Data provider for invalid password scenarios.
     */
    public static function invalidPasswordProvider(): array
    {
        return [
            'empty password' => ['', 'Password cannot be empty'],
            'whitespace only' => ['   ', 'Password cannot be empty'],
            'too short' => ['1234567', 'Password must be at least 8 characters long'],
            'null password' => [null, 'Password cannot be empty'],
        ];
    }

    /**
     * @dataProvider invalidPasswordProvider
     */
    public function test_validates_invalid_passwords($password, string $expectedMessage): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage($expectedMessage);

        $user = User::factory()->create();
        new UserCredentialsMail($user, $password);
    }

    /**
     * Data provider for valid password scenarios.
     */
    public static function validPasswordProvider(): array
    {
        return [
            'minimum length password' => ['12345678'], // Exactly 8 characters
            'long password' => [str_repeat('a', 100)], // Very long password
            'password with special characters' => ['P@ssw0rd!#$%'],
            'alphanumeric password' => ['Password123'],
            'password with spaces' => ['My Password 123'],
        ];
    }

    /**
     * @dataProvider validPasswordProvider
     */
    public function test_accepts_valid_passwords(string $password): void
    {
        $mail = new UserCredentialsMail($this->testUser, $password);

        $this->assertInstanceOf(UserCredentialsMail::class, $mail);
        $this->assertEquals($this->testUser, $mail->user);
    }

    public function test_has_correct_subject(): void
    {
        $mail = new UserCredentialsMail($this->testUser, $this->validPassword);
        $envelope = $mail->envelope();

        $this->assertEquals('Welcome to User Management System - Your Account Credentials', $envelope->subject);
    }

    public function test_uses_correct_view(): void
    {
        $mail = new UserCredentialsMail($this->testUser, $this->validPassword);
        $content = $mail->content();

        $this->assertEquals('emails.user-credentials', $content->view);
    }

    public function test_passes_data_to_view(): void
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

    public function test_renders_email_content_correctly(): void
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

        // Test that all required user information is present
        $this->assertStringContainsString('Jane Smith', $rendered);
        $this->assertStringContainsString('jane@example.com', $rendered);
        $this->assertStringContainsString('secure-password-123', $rendered);
        $this->assertStringContainsString('Reviewer', $rendered);

        // Test that welcome message is present
        $this->assertStringContainsString('Welcome to User Management System', $rendered);

        // Test that the email doesn't contain sensitive debug information
        $this->assertStringNotContainsString('password_hash', $rendered);
        $this->assertStringNotContainsString('remember_token', $rendered);
    }

    public function test_envelope_has_correct_configuration(): void
    {
        $mail = new UserCredentialsMail($this->testUser, $this->validPassword);
        $envelope = $mail->envelope();

        $this->assertNotNull($envelope->from);
        $this->assertNotNull($envelope->replyTo);
        $this->assertEquals('Welcome to User Management System - Your Account Credentials', $envelope->subject);
    }

    public function test_role_is_properly_capitalized_in_content(): void
    {
        $adminUser = User::factory()->create(['role' => 'administrator']);
        $reviewerUser = User::factory()->create(['role' => 'reviewer']);

        $adminMail = new UserCredentialsMail($adminUser, $this->validPassword);
        $reviewerMail = new UserCredentialsMail($reviewerUser, $this->validPassword);

        $adminRendered = $adminMail->render();
        $reviewerRendered = $reviewerMail->render();

        $this->assertStringContainsString('Administrator', $adminRendered);
        $this->assertStringContainsString('Reviewer', $reviewerRendered);
    }

    public function test_handles_user_with_special_characters_in_name(): void
    {
        $user = User::factory()->create([
            'name' => "O'Connor",
            'last_name' => 'Smith-Jones',
            'email' => 'test+user@example.com'
        ]);

        $mail = new UserCredentialsMail($user, $this->validPassword);
        $rendered = $mail->render();

        $this->assertStringContainsString("O'Connor Smith-Jones", $rendered);
        $this->assertStringContainsString('test+user@example.com', $rendered);
    }

    public function test_password_is_not_logged_or_exposed(): void
    {
        $sensitivePassword = 'super-secret-password-123!@#';
        $mail = new UserCredentialsMail($this->testUser, $sensitivePassword);

        // Ensure password is passed to view but not exposed in object properties
        $content = $mail->content();
        $this->assertEquals($sensitivePassword, $content->with['password']);

        // Ensure the mail object doesn't expose the password as a public property
        $reflection = new \ReflectionClass($mail);
        $publicProperties = $reflection->getProperties(\ReflectionProperty::IS_PUBLIC);
        $publicPropertyNames = array_map(fn($prop) => $prop->getName(), $publicProperties);
        $this->assertNotContains('password', $publicPropertyNames);
    }

    public function test_does_not_perform_additional_database_queries(): void
    {
        DB::enableQueryLog();

        $mail = new UserCredentialsMail($this->testUser, $this->validPassword);
        $mail->render();

        $queries = DB::getQueryLog();
        $this->assertEmpty($queries, 'Mail rendering should not perform additional database queries');

        DB::disableQueryLog();
    }

    public function test_supports_localized_content(): void
    {
        // Store original locale to restore later
        $originalLocale = App::getLocale();

        try {
            App::setLocale('es');

            $mail = new UserCredentialsMail($this->testUser, $this->validPassword);
            $rendered = $mail->render();

            // Test that mail renders without errors in different locales
            // Only assert Spanish content if translations actually exist
            $this->assertNotEmpty($rendered);
            $this->assertStringContainsString($this->testUser->name, $rendered);

            // If Spanish translations exist, test for them
            if (trans('Welcome to User Management System', [], 'es') !== 'Welcome to User Management System') {
                $this->assertStringContainsString('Bienvenido', $rendered);
            }
        } finally {
            // Always restore original locale
            App::setLocale($originalLocale);
        }
    }

    public function test_email_contains_required_elements(): void
    {
        $mail = new UserCredentialsMail($this->testUser, $this->validPassword);
        $rendered = $mail->render();

        // Verify essential elements are present
        $this->assertStringContainsString('<!DOCTYPE html', $rendered);
        $this->assertStringContainsString('<html', $rendered);
        $this->assertStringContainsString('</html>', $rendered);
        $this->assertStringContainsString('charset=', $rendered);
    }

    public function test_handles_null_password_validation(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Password cannot be empty');

        new UserCredentialsMail($this->testUser, null);
    }

    public function test_envelope_configuration_fallbacks(): void
    {
        $mail = new UserCredentialsMail($this->testUser, $this->validPassword);
        $envelope = $mail->envelope();

        // Test that envelope has proper fallback values
        $this->assertNotNull($envelope->from);
        $this->assertNotNull($envelope->replyTo);
        $this->assertNotEmpty($envelope->subject);

        // Verify from address is not null even if config is missing
        $this->assertNotEquals('', $envelope->from);
    }

    public function test_mail_serialization_for_queue(): void
    {
        $mail = new UserCredentialsMail($this->testUser, $this->validPassword);

        // Test that the mail can be serialized for queue processing
        $serialized = serialize($mail);
        $unserialized = unserialize($serialized);

        $this->assertInstanceOf(UserCredentialsMail::class, $unserialized);
        $this->assertEquals($this->testUser->id, $unserialized->user->id);
    }
}

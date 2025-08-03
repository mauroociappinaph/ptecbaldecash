<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_fillable_attributes()
    {
        $user = new User();
        $expected = ['name', 'last_name', 'email', 'password', 'role'];

        $this->assertEquals($expected, $user->getFillable());
    }

    public function test_user_has_hidden_attributes()
    {
        $user = new User();
        $expected = ['password', 'remember_token'];

        $this->assertEquals($expected, $user->getHidden());
    }

    public function test_is_administrator_method()
    {
        $user = new User();
        $user->role = UserRole::ADMINISTRATOR;

        $this->assertTrue($user->isAdministrator());
        $this->assertFalse($user->isReviewer());
    }

    public function test_is_reviewer_method()
    {
        $user = new User();
        $user->role = UserRole::REVIEWER;

        $this->assertTrue($user->isReviewer());
        $this->assertFalse($user->isAdministrator());
    }

    public function test_user_uses_soft_deletes()
    {
        $user = User::create([
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'password',
            'role' => UserRole::REVIEWER
        ]);

        $user->delete();

        $this->assertTrue($user->trashed());
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    public function test_user_has_api_tokens_trait()
    {
        $user = new User();

        $this->assertTrue(method_exists($user, 'createToken'));
        $this->assertTrue(method_exists($user, 'tokens'));
    }

    public function test_full_name_attribute()
    {
        $user = new User([
            'name' => 'John',
            'last_name' => 'Doe'
        ]);

        $this->assertEquals('John Doe', $user->full_name);
    }

    public function test_role_enum_casting()
    {
        $user = User::create([
            'name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'password',
            'role' => UserRole::ADMINISTRATOR
        ]);

        $this->assertInstanceOf(UserRole::class, $user->role);
        $this->assertEquals(UserRole::ADMINISTRATOR, $user->role);
    }

    public function test_administrators_scope()
    {
        User::factory()->create(['role' => UserRole::ADMINISTRATOR]);
        User::factory()->create(['role' => UserRole::REVIEWER]);

        $administrators = User::administrators()->get();

        $this->assertCount(1, $administrators);
        $this->assertTrue($administrators->first()->isAdministrator());
    }

    public function test_reviewers_scope()
    {
        User::factory()->create(['role' => UserRole::ADMINISTRATOR]);
        User::factory()->create(['role' => UserRole::REVIEWER]);

        $reviewers = User::reviewers()->get();

        $this->assertCount(1, $reviewers);
        $this->assertTrue($reviewers->first()->isReviewer());
    }
}

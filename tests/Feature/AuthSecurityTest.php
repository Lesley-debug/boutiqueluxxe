<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_reset_does_not_reveal_unknown_accounts(): void
    {
        $response = $this->post('/forgot-password', ['email' => 'unknown@example.com']);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('status', 'If an account exists for that email address, a password reset link has been sent.');
    }

    public function test_login_is_limited_by_email_across_ip_addresses(): void
    {
        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => "198.51.100.{$attempt}"])
                ->post('/login', ['email' => 'target@example.com', 'password' => 'invalid-password'])
                ->assertRedirect();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.99'])
            ->post('/login', ['email' => 'target@example.com', 'password' => 'invalid-password'])
            ->assertTooManyRequests();
    }

    public function test_login_is_limited_by_ip_when_emails_are_rotated(): void
    {
        for ($attempt = 1; $attempt <= 10; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
                ->post('/login', ['email' => "rotated-{$attempt}@example.com", 'password' => 'invalid-password'])
                ->assertRedirect();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
            ->post('/login', ['email' => 'rotated-11@example.com', 'password' => 'invalid-password'])
            ->assertTooManyRequests();
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\WelcomeNotification;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_sends_verification_email_without_authenticating_user(): void
    {
        Notification::fake();

        $response = $this->post('/register', [
            'name' => 'Verification Customer',
            'email' => 'verify@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ]);

        $response->assertRedirect('/login');
        $this->assertGuest();

        $user = User::where('email', 'verify@example.com')->firstOrFail();
        $this->assertFalse($user->hasVerifiedEmail());
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_unverified_user_can_access_account_when_enforcement_is_disabled(): void
    {
        config(['auth_features.email_verification_required' => false]);
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->get('/account')
            ->assertOk();
    }

    public function test_unverified_user_is_redirected_when_enforcement_is_enabled(): void
    {
        config(['auth_features.email_verification_required' => true]);
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->get('/account')
            ->assertRedirect('/email/verify');
    }

    public function test_verified_user_can_access_protected_account_when_enforced(): void
    {
        config(['auth_features.email_verification_required' => true]);
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/account')
            ->assertOk();
    }

    public function test_valid_signed_link_verifies_email_and_sends_welcome_message(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        );

        $this->actingAs($user)
            ->get($url)
            ->assertRedirect('/account');

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        Notification::assertSentTo($user, WelcomeNotification::class);
    }

    public function test_invalid_verification_signature_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();
        $url = route('verification.verify', [
            'id' => $user->id,
            'hash' => sha1($user->email),
        ]);

        $this->actingAs($user)
            ->get($url)
            ->assertForbidden();

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_resend_is_rate_limited(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();
        $this->actingAs($user);

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $this->post('/email/verification-notification')
                ->assertRedirect();
        }

        $this->post('/email/verification-notification')
            ->assertStatus(429);

        Notification::assertSentToTimes($user, VerifyEmail::class, 3);
    }

    public function test_guest_storefront_remains_available_when_verification_is_enforced(): void
    {
        config(['auth_features.email_verification_required' => true]);

        $this->get('/cart')->assertOk();
    }
}

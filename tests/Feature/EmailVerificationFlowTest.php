<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use App\Notifications\WelcomeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_opens_check_email_page_with_pending_authenticated_session(): void
    {
        config(['auth_features.email_verification_required' => true]);
        Notification::fake();

        $response = $this->post('/register', [
            'name' => 'Verification Customer',
            'email' => 'verify@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ]);

        $user = User::where('email', 'verify@example.com')->firstOrFail();
        $response->assertRedirect('/email/verify');
        $this->assertAuthenticatedAs($user);
        $this->assertFalse($user->hasVerifiedEmail());
        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_unverified_user_can_access_account_when_enforcement_is_disabled(): void
    {
        config(['auth_features.email_verification_required' => false]);
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)->get('/account')->assertOk();
    }

    public function test_unverified_user_is_redirected_when_enforcement_is_enabled(): void
    {
        config(['auth_features.email_verification_required' => true]);
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)->get('/account')->assertRedirect('/email/verify');
    }

    public function test_verified_user_can_access_protected_account_when_enforced(): void
    {
        config(['auth_features.email_verification_required' => true]);
        $user = User::factory()->create();

        $this->actingAs($user)->get('/account')->assertOk();
    }

    public function test_guest_can_use_fresh_signed_link_and_is_automatically_authenticated(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())],
        );

        $this->get($url)->assertRedirect('/account');

        $this->assertAuthenticatedAs($user);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        Notification::assertSentTo($user, WelcomeNotification::class);
    }

    public function test_already_verified_user_can_use_signed_link_without_duplicate_welcome(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())],
        );

        $this->get($url)->assertRedirect('/account');
        $this->assertAuthenticatedAs($user);
        Notification::assertNotSentTo($user, WelcomeNotification::class);
    }

    public function test_invalid_signature_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();
        $url = route('verification.verify', [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $this->get($url)->assertForbidden();
        $this->assertGuest();
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_expired_signature_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->subMinute(),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())],
        );

        $this->get($url)->assertForbidden();
        $this->assertGuest();
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_valid_signature_with_wrong_email_hash_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1('wrong@example.com')],
        );

        $this->get($url)->assertForbidden();
        $this->assertGuest();
    }

    public function test_resend_is_rate_limited(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();
        $this->actingAs($user);

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $this->post('/email/verification-notification')->assertRedirect();
        }

        $this->post('/email/verification-notification')->assertStatus(429);
        Notification::assertSentToTimes($user, VerifyEmailNotification::class, 3);
    }

    public function test_guest_storefront_remains_available_when_verification_is_enforced(): void
    {
        config(['auth_features.email_verification_required' => true]);
        $this->get('/cart')->assertOk();
    }
}

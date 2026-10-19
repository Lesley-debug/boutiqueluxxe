<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class StaffLoginBoundaryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['auth_features.email_verification_required' => true, 'app.url' => 'http://localhost']);
        URL::forceRootUrl('http://localhost');
    }

    private function staff(): User
    {
        return User::factory()->create(['is_admin' => true, 'role' => 'manager']);
    }

    public function test_inertia_login_into_staff_requests_full_browser_navigation(): void
    {
        $user = $this->staff();
        $response = $this->withSession(['url.intended' => url('/staff')])
            ->withHeader('X-Inertia', 'true')
            ->post('/login', ['email' => $user->email, 'password' => 'password']);

        $response->assertStatus(409)->assertHeader('X-Inertia-Location', url('/staff'));
        $this->assertAuthenticatedAs($user);
        $response->assertSessionHas('welcomeBack', true);
        $response->assertSessionMissing('url.intended');
    }

    public function test_guest_staff_entry_preserves_intended_url_through_existing_login(): void
    {
        $user = $this->staff();
        $this->get('/staff')->assertRedirect(url('/staff/login'));
        $this->get('/staff/login')->assertRedirect(route('login'));
        $this->withHeader('X-Inertia', 'true')
            ->post('/login', ['email' => $user->email, 'password' => 'password'])
            ->assertStatus(409)->assertHeader('X-Inertia-Location', url('/staff'));
    }

    public function test_plain_http_login_preserves_the_regular_staff_redirect(): void
    {
        $user = $this->staff();
        $response = $this->withSession(['url.intended' => url('/staff')])
            ->post('/login', ['email' => $user->email, 'password' => 'password']);
        $response->assertRedirect(url('/staff'));
        $this->assertFalse($response->headers->has('X-Inertia-Location'));
    }

    public function test_customer_storefront_login_is_not_forced_into_external_navigation(): void
    {
        $user = User::factory()->create();
        $response = $this->withSession(['url.intended' => url('/shop')])
            ->withHeader('X-Inertia', 'true')
            ->post('/login', ['email' => $user->email, 'password' => 'password']);
        $response->assertRedirect(url('/shop'));
        $this->assertFalse($response->headers->has('X-Inertia-Location'));
    }

    public function test_staff_prefix_lookalikes_are_not_treated_as_filament_routes(): void
    {
        $user = $this->staff();
        $response = $this->withSession(['url.intended' => url('/staffing')])
            ->withHeader('X-Inertia', 'true')
            ->post('/login', ['email' => $user->email, 'password' => 'password']);
        $response->assertRedirect(url('/staffing'));
        $this->assertFalse($response->headers->has('X-Inertia-Location'));
    }

    public function test_incorrect_password_does_not_handoff_or_authenticate(): void
    {
        $user = $this->staff();
        $response = $this->from('/login')
            ->withSession(['url.intended' => url('/staff')])
            ->withHeader('X-Inertia', 'true')
            ->post('/login', ['email' => $user->email, 'password' => 'incorrect-password']);
        $response->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->assertFalse($response->headers->has('X-Inertia-Location'));
    }

    public function test_unverified_staff_still_goes_through_existing_verification_flow(): void
    {
        $user = User::factory()->unverified()->create(['is_admin' => true, 'role' => 'manager']);
        $response = $this->withSession(['url.intended' => url('/staff')])
            ->withHeader('X-Inertia', 'true')
            ->post('/login', ['email' => $user->email, 'password' => 'password']);
        $response->assertRedirect(route('verification.notice'));
        $this->assertFalse($response->headers->has('X-Inertia-Location'));
    }
}

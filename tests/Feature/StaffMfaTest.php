<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureStaffMfa;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Services\StaffMfa;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Livewire\Component;
use Livewire\Livewire;
use Livewire\Mechanisms\HandleRequests\HandleRequests;
use Livewire\Mechanisms\PersistentMiddleware\PersistentMiddleware;
use PragmaRX\Google2FAQRCode\Google2FA;
use Tests\TestCase;

class StaffMfaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Livewire has request-local static state that survives in this test process.
        Livewire::flushState();
        config(['auth_features.staff_mfa_required' => true, 'auth_features.email_verification_required' => true]);
        $this->withoutVite();
        // Browser Livewire/fetch requests carry the session cookie too.
        $this->withCredentials();
    }

    /**
     * Laravel's feature HTTP helpers are not a browser cookie jar. Carry the REAL
     * encrypted Set-Cookie from each response so the next request uses that same
     * session, including the newly rotated identifier after a successful factor.
     * No proof is fabricated, no cookie encryption/session middleware is disabled.
     */
    protected function createTestResponse($response, $request)
    {
        $result = parent::createTestResponse($response, $request);
        foreach ($response->headers->getCookies() as $cookie) {
            if ($cookie->getName() === config('session.cookie')) {
                // Already encrypted by the real middleware; do not encrypt twice.
                $this->withUnencryptedCookie($cookie->getName(), $cookie->getValue());
            }
        }
        // Mirror Livewire's own InitialRender/SubsequentRender test helpers:
        // clear request-local middleware memoization and auto-injected asset flags
        // only AFTER the full HTTP response has been produced. This does not
        // remove registered middleware, session data or the signed snapshot.
        Livewire::flushState();
        return $result;
    }

    private function staff(string $role = 'manager'): User
    {
        return User::factory()->create(['is_admin' => true, 'role' => $role]);
    }

    private function enroll(User $user): User
    {
        $user->app_authentication_secret = app(StaffMfa::class)->provider()->generateSecret();
        $user->app_authentication_recovery_codes = [Hash::make('test-recovery-code-one'), Hash::make('test-recovery-code-two')];
        $user->staff_mfa_version = 1;
        $user->saveOrFail();
        return $user->fresh();
    }

    private function code(User $user): string
    {
        return app(Google2FA::class)->getCurrentOtp($user->getAppAuthenticationSecret());
    }

    private function proof(User $user): void
    {
        $this->actingAs($user);
        // Exercise the REAL password+OTP controller, not a test-only proof factory.
        $this->post('/staff/security/challenge', ['password' => 'password', 'code' => $this->code($user)])
            ->assertRedirect(url('/staff'))->assertSessionHas(StaffMfa::PROOF);
    }

    private function requestFor(User $user): Request
    {
        $request = Request::create('/staff');
        $request->setLaravelSession(app('session.store'));
        $request->setUserResolver(fn () => $user);
        return $request;
    }

    public function test_shipped_configuration_requires_staff_mfa_and_persistent_middleware_is_registered(): void
    {
        $this->assertTrue((require config_path('auth_features.php'))['staff_mfa_required']);
        $this->assertContains(EnsureStaffMfa::class, Filament::getPanel('staff')->getAuthMiddleware());
        Filament::setCurrentPanel('staff');
        Filament::bootCurrentPanel();
        $this->assertContains(EnsureStaffMfa::class, app(PersistentMiddleware::class)->getPersistentMiddleware());
    }

    public function test_all_staff_roles_with_old_or_remembered_login_sessions_must_step_up(): void
    {
        foreach (['super_admin', 'manager', 'support_staff'] as $role) {
            $user = $this->staff($role);
            $this->actingAs($user)->get('/staff')->assertRedirect(route('staff.security.show'));
            $this->get('/admin')->assertRedirect(route('staff.security.show'));
            $this->get('/staff/security')->assertOk()->assertSee('Two-factor authentication is required');
        }
    }

    public function test_storefront_staff_login_does_not_mint_mfa_proof_and_customer_login_still_works(): void
    {
        $user = $this->enroll($this->staff());
        $this->withSession(['url.intended' => url('/staff'), StaffMfa::PROOF => ['forged' => true]])
            ->post('/login', ['email' => $user->email, 'password' => 'password', 'remember' => true])
            ->assertRedirect(url('/staff'))->assertSessionMissing(StaffMfa::PROOF);
        $this->get('/staff')->assertRedirect(route('staff.security.show'));
        $this->post('/logout')->assertRedirect('/');
        $customer = User::factory()->create(['is_admin' => false, 'role' => null]);
        $this->withSession(['url.intended' => url('/shop')])->post('/login', ['email' => $customer->email, 'password' => 'password'])
            ->assertRedirect(url('/shop'))->assertSessionMissing(StaffMfa::PROOF);
    }

    public function test_guest_customer_inactive_and_unverified_accounts_cannot_enroll(): void
    {
        $this->get('/staff/security')->assertRedirect(route('login'));
        foreach ([
            User::factory()->create(['is_admin' => false, 'role' => null]),
            User::factory()->create(['is_admin' => false, 'role' => 'manager']),
        ] as $user) {
            $this->actingAs($user)->post('/staff/security/begin', ['password' => 'password'])->assertForbidden();
        }
        $unverified = User::factory()->unverified()->create(['is_admin' => true, 'role' => 'manager']);
        $this->actingAs($unverified)->get('/staff/security')->assertRedirect(route('verification.notice'));
        config(['auth_features.email_verification_required' => false]);
        $this->get('/staff/security')->assertForbidden();
    }

    public function test_setup_requires_password_and_pending_secret_is_encrypted_and_cancelable(): void
    {
        $user = $this->staff();
        $this->actingAs($user)->from('/staff/security')->post('/staff/security/begin', ['password' => 'wrong'])
            ->assertSessionHasErrors('security');
        $this->assertNull($user->fresh()->getAppAuthenticationSecret());
        $this->post('/staff/security/begin', ['password' => 'password'])->assertRedirect(route('staff.security.show'));
        $request = $this->requestFor($user->fresh());
        $secret = app(StaffMfa::class)->pending($request, $user->fresh());
        $this->assertNotEmpty($secret);
        $this->assertStringNotContainsString($secret, session(StaffMfa::PENDING));
        $this->get('/staff/security')->assertOk()->assertSee('Confirm setup')->assertSee($secret);
        $this->assertNull($user->fresh()->getAppAuthenticationSecret());
        $this->post('/staff/security/cancel')->assertSessionMissing(StaffMfa::PENDING);
        $this->assertNull($user->fresh()->getAppAuthenticationSecret());
        $this->assertDatabaseMissing('user_activity_logs', ['activity_type' => 'staff_mfa_enabled']);
    }

    public function test_complete_setup_verifies_password_and_app_code_then_shows_hashed_codes_once(): void
    {
        $user = $this->staff();
        $this->actingAs($user)->post('/staff/security/begin', ['password' => 'password'])->assertRedirect();
        // Compare canonical persisted DB attributes, not factory-side bool/defaults.
        $user = $user->fresh();
        $secret = app(StaffMfa::class)->pending($this->requestFor($user), $user);
        $this->assertNotEmpty($secret, 'A valid pending enrollment secret must exist.');
        $otp = app(Google2FA::class)->getCurrentOtp($secret);
        $this->from('/staff/security')->post('/staff/security/complete', ['password' => 'wrong', 'code' => $otp])->assertSessionHasErrors('security');
        $this->assertNull($user->fresh()->getAppAuthenticationSecret());
        $this->post('/staff/security/complete', ['password' => 'password', 'code' => $otp])->assertRedirect(route('staff.security.show'))
            ->assertSessionHas(StaffMfa::PROOF)->assertSessionMissing(StaffMfa::PENDING);
        $fresh = $user->fresh();
        $this->assertSame($secret, $fresh->getAppAuthenticationSecret());
        $this->assertNotSame($secret, $fresh->getRawOriginal('app_authentication_secret'));
        $this->assertCount(8, $fresh->getAppAuthenticationRecoveryCodes());
        $this->assertNotNull($fresh->staff_mfa_last_step);
        $encrypted = session(StaffMfa::CODES);
        $codes = json_decode(Crypt::decryptString($encrypted), true)['codes'];
        foreach ($codes as $code) {
            $this->assertStringNotContainsString($code, $encrypted);
            $this->assertTrue(Hash::check($code, $fresh->getAppAuthenticationRecoveryCodes()[array_search($code, $codes, true)]));
        }
        $this->get('/staff/security')->assertOk()->assertSee($codes[0])->assertHeader('Referrer-Policy', 'no-referrer');
        $this->get('/staff/security')->assertDontSee($codes[0]);
        $this->get('/staff')->assertOk();
        $this->assertDatabaseHas('user_activity_logs', ['user_id' => $user->id, 'activity_type' => 'staff_mfa_enabled']);
    }

    public function test_expired_or_changed_account_pending_setup_cannot_be_completed(): void
    {
        $user = $this->staff();
        $this->actingAs($user)->post('/staff/security/begin', ['password' => 'password']);
        $p = json_decode(Crypt::decryptString(session(StaffMfa::PENDING)), true);
        $p['at'] = time() - 601;
        session()->put(StaffMfa::PENDING, Crypt::encryptString(json_encode($p)));
        session()->save();
        $this->from('/staff/security')->post('/staff/security/complete', ['password' => 'password', 'code' => '123456'])
            ->assertSessionHasErrors('security')->assertSessionMissing(StaffMfa::PROOF);
        $this->post('/staff/security/begin', ['password' => 'password']);
        $user->update(['email' => 'changed@example.test']);
        $this->post('/staff/security/complete', ['password' => 'password', 'code' => '123456'])->assertSessionHasErrors('security');
        $this->assertNull($user->fresh()->getAppAuthenticationSecret());
    }

    public function test_enrollment_code_cannot_be_reused_for_a_second_challenge(): void
    {
        $user = $this->staff();
        $this->actingAs($user)->post('/staff/security/begin', ['password' => 'password']);
        // Compare canonical persisted DB attributes, not factory-side bool/defaults.
        $user = $user->fresh();
        $secret = app(StaffMfa::class)->pending($this->requestFor($user), $user);
        $this->assertNotEmpty($secret, 'A valid pending enrollment secret must exist.');
        $otp = app(Google2FA::class)->getCurrentOtp($secret);
        $this->post('/staff/security/complete', ['password' => 'password', 'code' => $otp])->assertRedirect();
        session()->forget(StaffMfa::PROOF);
        session()->save();
        $this->from('/staff/security')->post('/staff/security/challenge', ['password' => 'password', 'code' => $otp])
            ->assertSessionHasErrors('security')->assertSessionMissing(StaffMfa::PROOF);
    }

    public function test_password_plus_factor_is_required_and_session_rotates_after_success(): void
    {
        $user = $this->enroll($this->staff());
        $this->actingAs($user)->get('/staff/security');
        $old = session()->getId();
        $this->from('/staff/security')->post('/staff/security/challenge', ['password' => 'wrong', 'code' => $this->code($user)])
            ->assertSessionHasErrors('security')->assertSessionMissing(StaffMfa::PROOF);
        $this->proof($user);
        $this->assertNotSame($old, session()->getId());
        $this->get('/staff')->assertOk();
        $this->get('/admin')->assertRedirect(url('/staff'));
        $this->get('/staff/notification-sound/poll')->assertOk();
    }

    public function test_recovery_codes_are_single_use_and_do_not_reveal_stored_hashes(): void
    {
        $user = $this->enroll($this->staff());
        $this->actingAs($user)->post('/staff/security/challenge', ['password' => 'password', 'recovery_code' => 'test-recovery-code-one'])
            ->assertRedirect(url('/staff'))->assertSessionHas(StaffMfa::PROOF);
        $this->assertCount(1, $user->fresh()->getAppAuthenticationRecoveryCodes());
        session()->forget(StaffMfa::PROOF);
        session()->save();
        $this->from('/staff/security')->post('/staff/security/challenge', ['password' => 'password', 'recovery_code' => 'test-recovery-code-one'])
            ->assertSessionHasErrors('security')->assertSessionMissing(StaffMfa::PROOF);
        $this->assertCount(1, $user->fresh()->getAppAuthenticationRecoveryCodes());
        $this->post('/staff/security/challenge', ['password' => 'password', 'recovery_code' => 'test-recovery-code-two'])->assertRedirect(url('/staff'));
        $this->assertSame([], $user->fresh()->getAppAuthenticationRecoveryCodes());
        session()->forget(StaffMfa::PROOF);
        session()->save();
        $this->post('/staff/security/challenge', ['password' => 'password', 'recovery_code' => 'test-recovery-code-two'])->assertSessionHasErrors('security');
    }

    public function test_replayed_app_codes_are_rejected_even_after_the_cache_is_cleared(): void
    {
        $user = $this->enroll($this->staff());
        $code = $this->code($user);
        $this->proof($user);
        session()->forget(StaffMfa::PROOF);
        session()->save();
        app('cache')->flush();
        $this->from('/staff/security')->post('/staff/security/challenge', ['password' => 'password', 'code' => $code])
            ->assertSessionHasErrors('security')->assertSessionMissing(StaffMfa::PROOF);
        $this->assertSame(1, UserActivityLog::where('activity_type', 'staff_mfa_challenged')->count());
    }

    public function test_five_failures_lock_the_account_across_sessions_for_fifteen_minutes(): void
    {
        $user = $this->enroll($this->staff());
        $this->actingAs($user)->from('/staff/security');
        for ($i = 0; $i < 5; $i++) {
            $this->post('/staff/security/challenge', ['password' => 'wrong', 'recovery_code' => 'wrong'])->assertSessionHasErrors('security');
        }
        $this->assertSame(5, $user->fresh()->staff_mfa_failures);
        session()->flush();
        session()->save();
        $this->actingAs($user)->post('/staff/security/challenge', ['password' => 'password', 'code' => $this->code($user)])->assertStatus(429);
        $this->travel(16)->minutes();
        $this->post('/staff/security/challenge', ['password' => 'password', 'recovery_code' => 'test-recovery-code-one'])->assertRedirect(url('/staff'));
        $this->assertSame(0, $user->fresh()->staff_mfa_failures);
        $this->assertNull($user->fresh()->staff_mfa_locked_until);
    }

    public function test_existing_session_proofs_are_bound_to_password_role_secret_version_and_browser_session(): void
    {
        $user = $this->enroll($this->staff());
        $this->proof($user);
        $mfa = app(StaffMfa::class);
        $request = $this->requestFor($user);
        $this->assertTrue($mfa->passed($request, $user));
        foreach ([
            ['password' => 'a-different-password'], ['role' => 'support_staff'],
            ['email' => 'other@example.test'], ['email_verified_at' => null],
            ['remember_token' => 'rotated'], ['staff_mfa_version' => 50],
            ['app_authentication_secret' => $mfa->provider()->generateSecret()],
        ] as $changes) {
            $copy = $user->replicate();
            $copy->setRawAttributes($user->getRawOriginal(), true);
            foreach ($changes as $key => $value) { $copy->setAttribute($key, $value); }
            $copy->syncOriginal();
            $this->assertFalse($mfa->passed($request, $copy));
        }
        session()->regenerate();
        $this->assertFalse($mfa->passed($request, $user));
    }

    public function test_expired_or_forged_session_proofs_cannot_open_the_dashboard(): void
    {
        $user = $this->enroll($this->staff());
        $this->proof($user);
        $proof = session(StaffMfa::PROOF);
        $proof['at'] = time() - StaffMfa::LIFETIME - 1;
        session()->put(StaffMfa::PROOF, $proof);
        session()->save();
        $this->get('/staff')->assertRedirect(route('staff.security.show'));
        $proof['at'] = time(); $proof['state'] = str_repeat('x', 64);
        session()->put(StaffMfa::PROOF, $proof);
        session()->save();
        $this->get('/staff')->assertRedirect(route('staff.security.show'));
    }

    public function test_legacy_mutations_cannot_write_before_mfa_even_with_stale_inertia_headers(): void
    {
        $user = $this->staff();
        $this->actingAs($user);
        $count = DB::table('products')->count();
        $this->call('POST', '/admin/products', ['name' => 'must-not-save'], [], [], [
            'HTTP_X_INERTIA' => 'true', 'HTTP_X_INERTIA_VERSION' => 'obsolete',
        ])->assertStatus(409)->assertHeader('X-Inertia-Location', route('staff.security.show'));
        $this->assertSame($count, DB::table('products')->count());
        $this->getJson('/staff/notification-sound/poll')->assertForbidden()->assertJsonPath('redirect', route('staff.security.show'));
        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_demotion_is_freshly_checked_even_after_successful_mfa(): void
    {
        $user = $this->enroll($this->staff());
        $this->proof($user);
        User::whereKey($user->id)->update(['is_admin' => false]);
        $this->get('/staff')->assertForbidden();
        $this->post('/staff/security/recovery-codes', ['password' => 'password', 'code' => $this->code($user)])->assertForbidden();
    }

    public function test_missing_mfa_schema_fails_closed_without_mutating_catalog(): void
    {
        $user = $this->staff();
        Schema::shouldReceive('hasColumns')->with('users', \Mockery::type('array'))->once()->andReturn(false);
        $this->actingAs($user)->get('/staff')->assertStatus(503);
    }

    public function test_secret_recovery_and_replay_state_are_not_serialized_or_mass_assignable(): void
    {
        $user = $this->enroll($this->staff());
        foreach (['app_authentication_secret', 'app_authentication_recovery_codes', 'staff_mfa_last_step', 'staff_mfa_version', 'staff_mfa_failures', 'staff_mfa_locked_until'] as $field) {
            $this->assertArrayNotHasKey($field, $user->toArray());
            $this->assertFalse($user->isFillable($field));
        }
        $serialized = $user->toJson();
        $this->assertStringNotContainsString($user->getAppAuthenticationSecret(), $serialized);
        $this->assertStringNotContainsString('test-recovery-code', $serialized);
    }

    public function test_code_replacement_requires_current_proof_password_and_new_factor(): void
    {
        $user = $this->enroll($this->staff());
        $this->actingAs($user)->post('/staff/security/recovery-codes', ['password' => 'password', 'code' => $this->code($user)])->assertForbidden();
        $this->proof($user);
        $oldProof = session(StaffMfa::PROOF);
        $this->post('/staff/security/recovery-codes', ['password' => 'wrong', 'recovery_code' => 'test-recovery-code-one'])->assertSessionHasErrors('security');
        $this->assertSame(1, $user->fresh()->staff_mfa_version);
        $this->post('/staff/security/recovery-codes', ['password' => 'password', 'recovery_code' => 'test-recovery-code-one'])
            ->assertRedirect(route('staff.security.show'))->assertSessionHas(StaffMfa::CODES);
        $fresh = $user->fresh();
        $this->assertSame(2, $fresh->staff_mfa_version);
        $this->assertCount(8, $fresh->getAppAuthenticationRecoveryCodes());
        $request = $this->requestFor($fresh);
        session()->put(StaffMfa::PROOF, $oldProof);
        session()->save();
        $this->assertFalse(app(StaffMfa::class)->passed($request, $fresh));
        $this->assertDatabaseHas('user_activity_logs', ['activity_type' => 'staff_mfa_codes_replaced']);
    }

    public function test_security_page_is_private_and_contains_no_storefront_tracking_or_external_code_service(): void
    {
        $user = $this->enroll($this->staff());
        $response = $this->actingAs($user)->get('/staff/security');
        $response->assertOk()->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')
            ->assertDontSee('smartsupp')->assertDontSee('data-page="app"', false)
            ->assertDontSee($user->getAppAuthenticationSecret());
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $response->assertDontSee('<script', false);
    }

    public function test_security_validation_never_flashes_recovery_or_app_codes_as_old_input(): void
    {
        $user = $this->enroll($this->staff());
        $this->actingAs($user)->from('/staff/security')->post('/staff/security/challenge', [
            'password' => 'private-test-password', 'code' => '123456', 'recovery_code' => 'private-test-code',
        ])->assertSessionHasErrors();
        foreach (['password', 'code', 'recovery_code'] as $key) {
            $this->assertNull(session()->getOldInput($key));
        }
    }

    public function test_audit_failure_rolls_back_recovery_consumption(): void
    {
        $user = $this->enroll($this->staff());
        UserActivityLog::creating(function (UserActivityLog $event): void {
            if ($event->activity_type === 'staff_mfa_challenged') { throw new \RuntimeException('test audit unavailable'); }
        });
        try {
            $this->actingAs($user)->get('/staff/security');
            $request = $this->requestFor($user);
            try {
                app(StaffMfa::class)->challenge($request, 'password', null, 'test-recovery-code-one');
                $this->fail('Audit failure should abort transaction.');
            } catch (\RuntimeException $e) {
                $this->assertSame('test audit unavailable', $e->getMessage());
            }
            $this->assertCount(2, $user->fresh()->getAppAuthenticationRecoveryCodes());
            $this->assertNull(session(StaffMfa::PROOF));
        } finally {
            UserActivityLog::flushEventListeners();
        }
    }


    public function test_customer_account_staff_notification_and_activity_paths_require_staff_proof(): void
    {
        $user = $this->enroll($this->staff());
        $this->actingAs($user);
        foreach (['/account', '/account/activity', '/account/notifications'] as $url) {
            $this->get($url)->assertRedirect(route('staff.security.show'));
        }
        $this->proof($user);
        $this->get('/account')->assertOk();
        $this->get('/account/activity')->assertOk();
        $this->get('/account/notifications')->assertOk();
    }

    public function test_storefront_props_do_not_leak_staff_notification_payloads_before_step_up(): void
    {
        $user = $this->enroll($this->staff());
        DB::table('notifications')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'test', 'notifiable_type' => $user->getMorphClass(), 'notifiable_id' => $user->id,
            'data' => json_encode(['message' => 'PRIVATE-STAFF-NOTICE-TEST']), 'created_at' => now(), 'updated_at' => now(),
        ]);
        $this->actingAs($user)->get('/faqs')->assertOk()->assertDontSee('PRIVATE-STAFF-NOTICE-TEST');
        $this->proof($user);
        $this->get('/faqs')->assertOk()->assertSee('PRIVATE-STAFF-NOTICE-TEST');
    }

    public function test_logout_erases_mfa_proof(): void
    {
        $user = $this->enroll($this->staff());
        $this->proof($user);
        $this->post('/logout')->assertSessionMissing(StaffMfa::PROOF);
        $this->get('/staff')->assertRedirect(url('/staff/login'));
    }

    public function test_actual_livewire_update_cannot_execute_action_after_proof_is_removed(): void
    {
        $user = $this->enroll($this->staff());
        $this->proof($user);
        app('view')->addNamespace('staff_mfa_test', base_path('tests/Fixtures/views'));
        Livewire::component('staff-mfa-probe', StaffMfaProbe::class);
        $panel = Filament::getPanel('staff');
        Route::get('/staff/mfa-probe', StaffMfaProbe::class)->middleware([
            ...$panel->getMiddleware(), ...$panel->getAuthMiddleware(),
        ])->name('staff.mfa-probe');
        $html = $this->get('/staff/mfa-probe')->assertOk()->getContent();
        $this->assertSame(1, preg_match('/wire:snapshot="([^"]+)"/', $html, $matches));
        $snapshot = html_entity_decode($matches[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $uri = app(HandleRequests::class)->getUpdateUri();
        $payload = ['components' => [['snapshot' => $snapshot, 'updates' => (object) [], 'calls' => [['path' => '', 'method' => 'recordProbe', 'params' => []]]]]];
        $this->withHeader('X-Livewire', 'true')->postJson($uri, $payload)->assertOk();
        $this->assertSame(1, UserActivityLog::where('activity_type', 'mfa_probe')->count());
        session()->forget(StaffMfa::PROOF);
        session()->save();
        $this->postJson($uri, $payload)->assertForbidden();
        $this->assertSame(1, UserActivityLog::where('activity_type', 'mfa_probe')->count());
    }

    public function test_console_recovery_revokes_only_target_sessions_and_requires_enrollment_again(): void
    {
        config(['session.driver' => 'database', 'session.connection' => config('database.default')]);
        $user = $this->enroll($this->staff('super_admin'));
        $other = $this->staff();
        foreach ([$user, $other] as $u) {
            DB::table('sessions')->insert(['id' => 'mfa-reset-'.$u->id, 'user_id' => $u->id, 'payload' => '', 'last_activity' => time()]);
        }
        $this->artisan('staff:reset-mfa', ['email' => $user->email])
            ->expectsQuestion('Type the exact email again to confirm', $user->email)
            ->expectsQuestion('Private reason (10–500 characters; do not enter secrets)', 'Verified owner recovery in person')
            ->expectsQuestion('Target staff account’s CURRENT password (hidden; never paste in chat)', 'password')
            ->assertExitCode(0);
        $fresh = $user->fresh();
        $this->assertNull($fresh->getAppAuthenticationSecret());
        $this->assertNull($fresh->getAppAuthenticationRecoveryCodes());
        $this->assertSame(2, $fresh->staff_mfa_version);
        $this->assertNotSame($user->remember_token, $fresh->remember_token);
        $this->assertDatabaseMissing('sessions', ['user_id' => $user->id]);
        $this->assertDatabaseHas('sessions', ['user_id' => $other->id]);
        $this->assertDatabaseHas('user_activity_logs', ['activity_type' => 'staff_mfa_console_reset']);
        $this->actingAs($fresh)->get('/staff')->assertRedirect(route('staff.security.show'));
    }

    public function test_console_recovery_wrong_password_or_email_confirmation_does_not_change_protection(): void
    {
        config(['session.driver' => 'database', 'session.connection' => config('database.default')]);
        $user = $this->enroll($this->staff('super_admin'));
        $before = $user->getRawOriginal();
        $this->artisan('staff:reset-mfa', ['email' => $user->email])
            ->expectsQuestion('Type the exact email again to confirm', 'wrong@example.test')->assertExitCode(1);
        $this->artisan('staff:reset-mfa', ['email' => $user->email])
            ->expectsQuestion('Type the exact email again to confirm', $user->email)
            ->expectsQuestion('Private reason (10–500 characters; do not enter secrets)', 'Verified owner recovery in person')
            ->expectsQuestion('Target staff account’s CURRENT password (hidden; never paste in chat)', 'incorrect')
            ->assertExitCode(1);
        $this->assertSame($before, $user->fresh()->getRawOriginal());
        $this->assertDatabaseMissing('user_activity_logs', ['activity_type' => 'staff_mfa_console_reset']);
    }
}

class StaffMfaProbe extends Component
{
    public function recordProbe(): void
    {
        UserActivityLog::create(['user_id' => auth('web')->id(), 'activity_type' => 'mfa_probe', 'description' => 'Test only']);
    }

    public function render()
    {
        return view('staff_mfa_test::mfa-probe')->layout('staff_mfa_test::mfa-probe-layout');
    }
}

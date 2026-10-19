<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserActivityLog;
use Filament\Auth\MultiFactor\App\AppAuthentication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use PragmaRX\Google2FAQRCode\Google2FA;
use SensitiveParameter;

final class StaffMfa
{
    public const PROOF = 'staff_mfa.proof';
    public const PENDING = 'staff_mfa.pending';
    public const CODES = 'staff_mfa.codes';
    public const LIFETIME = 28800;
    private bool $schemaChecked = false;

    public function ready(): void
    {
        if ($this->schemaChecked) {
            return;
        }
        abort_unless(Schema::hasColumns('users', [
            'app_authentication_secret', 'app_authentication_recovery_codes',
            'staff_mfa_last_step', 'staff_mfa_version', 'staff_mfa_failures',
            'staff_mfa_locked_until',
        ]) && Schema::hasTable('user_activity_logs'), 503, 'Staff security setup is unavailable. Ask the site operator to check the staff MFA migration.');
        $this->schemaChecked = true;
    }

    public function current(Request $request): User
    {
        $this->ready();
        $actor = $request->user('web');
        $user = $actor instanceof User ? $actor->fresh() : null;
        abort_unless($user instanceof User && $user->canAccessStaffPanel() && $user->hasVerifiedEmail(), 403);

        return $user;
    }

    public function provider(): AppAuthentication
    {
        return AppAuthentication::make()->brandName('Boutique Luxxe Staff')->codeWindow(1)->recoverable();
    }

    public function fingerprint(User $user): string
    {
        // Ciphertext, password and remember-token changes invalidate earlier proofs.
        // Recovery consumption alone intentionally does not revoke other good sessions.
        $state = array_intersect_key($user->getRawOriginal(), array_flip([
            'id', 'email', 'email_verified_at', 'password', 'remember_token',
            'role', 'is_admin', 'app_authentication_secret', 'staff_mfa_version',
        ]));
        ksort($state);

        return hash_hmac('sha256', json_encode($state, JSON_THROW_ON_ERROR), (string) config('app.key'));
    }

    public function passed(Request $request, User $user): bool
    {
        $proof = $request->session()->get(self::PROOF);
        if (! $user->getAppAuthenticationSecret() || ! is_array($proof)) {
            return false;
        }
        $at = $proof['at'] ?? null;

        return is_int($at) && $at <= time() + 5 && $at >= time() - self::LIFETIME
            && ($proof['user'] ?? null) === (int) $user->id
            && is_string($proof['state'] ?? null) && hash_equals($this->fingerprint($user), $proof['state'])
            && is_string($proof['session'] ?? null)
            && hash_equals(hash('sha256', $request->session()->getId()), $proof['session']);
    }

    public function grant(Request $request, User $user): void
    {
        $request->session()->regenerate();
        $request->session()->forget(self::PENDING);
        $request->session()->put(self::PROOF, [
            'user' => (int) $user->id, 'state' => $this->fingerprint($user),
            'session' => hash('sha256', $request->session()->getId()), 'at' => time(),
        ]);
    }

    public function pending(Request $request, User $user): ?string
    {
        $value = $request->session()->get(self::PENDING);
        if (! is_string($value)) {
            return null;
        }
        try {
            $p = json_decode(Crypt::decryptString($value), true, flags: JSON_THROW_ON_ERROR);
            if (is_array($p) && ($p['user'] ?? null) === (int) $user->id
                && is_int($p['at'] ?? null) && $p['at'] >= time() - 600 && $p['at'] <= time() + 5
                && is_string($p['state'] ?? null) && hash_equals($this->fingerprint($user), $p['state'])
                && is_string($p['secret'] ?? null)) {
                return $p['secret'];
            }
        } catch (\Illuminate\Contracts\Encryption\DecryptException | \JsonException) {
            // Discard corrupt/expired pending enrollment, never log its contents.
        }
        $request->session()->forget(self::PENDING);

        return null;
    }

    public function begin(Request $request, #[SensitiveParameter] string $password): void
    {
        $user = $this->current($request);
        $result = DB::transaction(function () use ($user, $password): ?User {
            $locked = User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $this->eligible($locked);
            $this->unlocked($locked);
            abort_if((bool) $locked->getAppAuthenticationSecret(), 409);
            if (! Hash::check($password, $locked->password)) {
                $this->failure($locked);
                return null;
            }
            return $locked;
        });
        if (! $result) {
            $this->invalid();
        }
        $request->session()->put(self::PENDING, Crypt::encryptString(json_encode([
            'user' => (int) $result->id, 'state' => $this->fingerprint($result),
            'at' => time(), 'secret' => $this->provider()->generateSecret(),
        ], JSON_THROW_ON_ERROR)));
    }

    public function complete(Request $request, #[SensitiveParameter] string $password, #[SensitiveParameter] string $code): void
    {
        $user = $this->current($request);
        $secret = $this->pending($request, $user);
        if (! $secret) {
            throw ValidationException::withMessages(['security' => 'Setup expired or this account changed. Start setup again.']);
        }
        $result = DB::transaction(function () use ($user, $password, $code, $secret): ?array {
            $locked = User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $this->eligible($locked);
            $this->unlocked($locked);
            abort_unless(hash_equals($this->fingerprint($user), $this->fingerprint($locked)), 409);
            abort_if((bool) $locked->getAppAuthenticationSecret(), 409);
            $step = Hash::check($password, $locked->password) ? $this->step($code, $secret, null) : false;
            if ($step === false) {
                $this->failure($locked);
                return null;
            }
            $codes = $this->provider()->generateRecoveryCodes();
            $locked->app_authentication_secret = $secret;
            $locked->app_authentication_recovery_codes = array_map(fn (string $c): string => Hash::make($c), $codes);
            $locked->staff_mfa_last_step = $step;
            $locked->staff_mfa_version++;
            $locked->staff_mfa_failures = 0;
            $locked->staff_mfa_locked_until = null;
            $locked->saveOrFail();
            $this->audit($locked, 'staff_mfa_enabled', 'Staff two-factor authentication enabled');
            return [$locked, $codes];
        });
        if (! $result) {
            $this->invalid();
        }
        $this->grant($request, $result[0]);
        $this->showCodesOnce($request, $result[0], $result[1]);
    }

    public function challenge(Request $request, #[SensitiveParameter] string $password, #[SensitiveParameter] ?string $code, #[SensitiveParameter] ?string $recovery, bool $regenerate = false): void
    {
        $user = $this->current($request);
        // Replacing codes requires a currently verified session AND a fresh factor/password.
        abort_if($regenerate && ! $this->passed($request, $user), 403);
        $result = DB::transaction(function () use ($user, $password, $code, $recovery, $regenerate): ?array {
            $locked = User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $this->eligible($locked);
            $this->unlocked($locked);
            abort_unless(hash_equals($this->fingerprint($user), $this->fingerprint($locked)), 409);
            $secret = $locked->getAppAuthenticationSecret();
            abort_unless((bool) $secret, 409);
            $valid = false;
            $method = 'app';
            if (Hash::check($password, $locked->password)) {
                if ($code !== null) {
                    $step = $this->step($code, $secret, $locked->staff_mfa_last_step);
                    if ($step !== false) {
                        $locked->staff_mfa_last_step = $step;
                        $valid = true;
                    }
                } elseif ($recovery !== null) {
                    $remaining = $locked->getAppAuthenticationRecoveryCodes() ?? [];
                    foreach ($remaining as $i => $hash) {
                        if (Hash::check($recovery, $hash)) {
                            unset($remaining[$i]);
                            $locked->app_authentication_recovery_codes = array_values($remaining);
                            $valid = true;
                            $method = 'recovery';
                            break;
                        }
                    }
                }
            }
            if (! $valid) {
                $this->failure($locked);
                return null;
            }
            $codes = null;
            if ($regenerate) {
                $codes = $this->provider()->generateRecoveryCodes();
                $locked->app_authentication_recovery_codes = array_map(fn (string $c): string => Hash::make($c), $codes);
                $locked->staff_mfa_version++;
            }
            $locked->staff_mfa_failures = 0;
            $locked->staff_mfa_locked_until = null;
            $locked->saveOrFail();
            $this->audit($locked, $regenerate ? 'staff_mfa_codes_replaced' : 'staff_mfa_challenged', $regenerate ? 'Staff recovery codes replaced; earlier sessions must verify again' : 'Staff two-factor challenge completed', ['method' => $method]);
            return [$locked, $codes];
        });
        if (! $result) {
            $this->invalid();
        }
        $this->grant($request, $result[0]);
        if ($result[1] !== null) {
            $this->showCodesOnce($request, $result[0], $result[1]);
        }
    }

    private function step(#[SensitiveParameter] string $code, #[SensitiveParameter] string $secret, ?int $last): int|false
    {
        $otp = app(Google2FA::class);
        $step = $otp->verifyKeyNewer($secret, $code, $last ?? ($otp->getTimestamp() - 2), 1);
        // Native library verification, with durable replay state under the USER ROW LOCK.
        // No cache flush/restart or parallel request can make a spent timestep usable again.
        return is_int($step) ? $step : false;
    }

    private function eligible(User $user): void
    {
        abort_unless($user->canAccessStaffPanel() && $user->hasVerifiedEmail(), 403);
    }

    private function unlocked(User $user): void
    {
        abort_if($user->staff_mfa_locked_until?->isFuture(), 429, 'Too many staff security attempts. Wait 15 minutes before trying again.');
    }

    private function failure(User $user): void
    {
        // The fifth failure locks this account's security endpoints for 15 minutes.
        // Expired lockout starts a fresh five-attempt budget. Persist BEFORE throwing.
        if ($user->staff_mfa_locked_until && ! $user->staff_mfa_locked_until->isFuture()) {
            $user->staff_mfa_failures = 0;
            $user->staff_mfa_locked_until = null;
        }
        $user->staff_mfa_failures++;
        if ($user->staff_mfa_failures >= 5) {
            $user->staff_mfa_locked_until = now()->addMinutes(15);
        }
        $user->saveOrFail();
    }

    private function invalid(): never
    {
        throw ValidationException::withMessages(['security' => 'The password or security code is incorrect, expired or already used.']);
    }

    private function showCodesOnce(Request $request, User $user, #[SensitiveParameter] array $codes): void
    {
        $request->session()->flash(self::CODES, Crypt::encryptString(json_encode([
            'user' => (int) $user->id, 'state' => $this->fingerprint($user), 'codes' => $codes,
        ], JSON_THROW_ON_ERROR)));
    }

    public function takeCodes(Request $request, User $user): array
    {
        $value = $request->session()->pull(self::CODES);
        if (! is_string($value) || ! $this->passed($request, $user)) {
            return [];
        }
        try {
            $p = json_decode(Crypt::decryptString($value), true, flags: JSON_THROW_ON_ERROR);
            return is_array($p) && ($p['user'] ?? null) === (int) $user->id
                && is_string($p['state'] ?? null) && hash_equals($this->fingerprint($user), $p['state'])
                && is_array($p['codes'] ?? null) ? $p['codes'] : [];
        } catch (\Illuminate\Contracts\Encryption\DecryptException | \JsonException) {
            return [];
        }
    }

    private function audit(User $user, string $type, string $description, array $metadata = []): void
    {
        UserActivityLog::create([
            'user_id' => $user->id, 'activity_type' => $type, 'description' => $description,
            'metadata' => $metadata, 'ip_address' => request()->ip(),
            'user_agent' => mb_substr((string) request()->userAgent(), 0, 255),
        ]);
    }
}

<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserActivityLog;
use App\Services\StaffMfa;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

final class ResetStaffMfa extends Command
{
    protected $signature = 'staff:reset-mfa {email : Exact staff email to recover}';
    protected $description = 'Interactive, audited staff MFA recovery; revokes all target sessions and requires enrollment again';

    public function handle(StaffMfa $mfa): int
    {
        if (! $this->input->isInteractive()) {
            $this->error('Interactive console access is required. No changes made.');
            return self::FAILURE;
        }
        $mfa->ready();
        $email = (string) $this->argument('email');
        $target = User::query()->where('email', $email)->first();
        if (! $target || $target->email !== $email || ! $target->canAccessStaffPanel() || ! $target->hasVerifiedEmail() || ! $target->getAppAuthenticationSecret()) {
            $this->error('An active, verified, enrolled staff account with this exact email is required. No changes made.');
            return self::FAILURE;
        }
        if (config('session.driver') !== 'database'
            || (config('session.connection') ?: config('database.default')) !== config('database.default')
            || ! Schema::hasTable(config('session.table', 'sessions'))) {
            $this->error('Atomic recovery requires database sessions on the application database. No changes made.');
            return self::FAILURE;
        }
        $this->warn('Recover only after verifying the staff member’s identity out of band. All their sessions and recovery codes will be revoked. There is no undo.');
        if ($this->ask('Type the exact email again to confirm') !== $email) {
            $this->error('Confirmation did not match. No changes made.');
            return self::FAILURE;
        }
        $reason = trim((string) $this->ask('Private reason (10–500 characters; do not enter secrets)'));
        if (mb_strlen($reason) < 10 || mb_strlen($reason) > 500 || ! preg_match('/[\p{L}\p{N}]/u', $reason)) {
            $this->error('A meaningful recovery reason is required. No changes made.');
            return self::FAILURE;
        }
        $password = (string) $this->secret('Target staff account’s CURRENT password (hidden; never paste in chat)');
        $ok = DB::transaction(function () use ($target, $email, $password, $reason): bool {
            $locked = User::query()->whereKey($target->id)->lockForUpdate()->firstOrFail();
            if ($locked->email !== $email || ! $locked->canAccessStaffPanel() || ! $locked->hasVerifiedEmail()
                || ! $locked->getAppAuthenticationSecret() || ! Hash::check($password, $locked->password)) {
                return false;
            }
            $locked->app_authentication_secret = null;
            $locked->app_authentication_recovery_codes = null;
            $locked->staff_mfa_last_step = null;
            $locked->staff_mfa_version++;
            $locked->staff_mfa_failures = 0;
            $locked->staff_mfa_locked_until = null;
            $locked->remember_token = Str::random(60);
            $locked->saveOrFail();
            DB::table(config('session.table', 'sessions'))->where('user_id', $locked->id)->delete();
            UserActivityLog::create([
                'user_id' => $locked->id, 'activity_type' => 'staff_mfa_console_reset',
                'description' => 'Staff MFA reset through an interactive operator console; all target sessions revoked',
                'metadata' => ['channel' => 'operator_console', 'reason' => $reason],
            ]);
            return true;
        });
        unset($password);
        if (! $ok) {
            $this->error('Password or account state did not match. No changes made.');
            return self::FAILURE;
        }
        $this->info('Recovery completed and audited. The staff member must sign in and enroll again. No secret or recovery code was printed.');
        return self::SUCCESS;
    }
}

<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\StaffMfa;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use PragmaRX\Google2FAQRCode\Google2FA;

final class CheckStaffMfa extends Command
{
    protected $signature = 'staff:check-mfa';
    protected $description = 'Read-only staff MFA schema, runtime, session and enrollment checks';

    public function handle(StaffMfa $mfa): int
    {
        $mfa->ready();
        if (! config('auth_features.staff_mfa_required', true) || ! class_exists(Google2FA::class)) {
            $this->error('Staff MFA enforcement or its locked runtime dependency is unavailable. No changes made.');
            return self::FAILURE;
        }
        if (config('session.driver') !== 'database'
            || (config('session.connection') ?: config('database.default')) !== config('database.default')
            || ! Schema::hasColumns(config('session.table', 'sessions'), ['id', 'user_id', 'payload', 'last_activity'])) {
            $this->error('Recovery requires database sessions on the application database. No changes made.');
            return self::FAILURE;
        }
        $active = 0;
        $enrolled = 0;
        $owners = 0;
        foreach (User::query()->where('is_admin', true)->cursor() as $user) {
            if (! $user->canAccessStaffPanel() || ! $user->hasVerifiedEmail()) {
                continue;
            }
            $active++;
            if ($user->getAppAuthenticationSecret()) {
                $enrolled++;
                $owners += (int) ($user->role === 'super_admin');
            }
        }
        $this->info("Schema/runtime/session checks passed. Enrolled active staff: {$enrolled}/{$active}. Enrolled verified owners: {$owners}. No changes made.");
        if (! $owners) {
            $this->warn('No enrolled verified owner yet. Enroll and test owner recovery locally before release.');
            return self::FAILURE;
        }
        return self::SUCCESS;
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->text('app_authentication_secret')->nullable();
            $table->text('app_authentication_recovery_codes')->nullable();
            $table->unsignedBigInteger('staff_mfa_last_step')->nullable();
            $table->unsignedInteger('staff_mfa_version')->default(0);
            $table->unsignedInteger('staff_mfa_failures')->default(0);
            $table->timestamp('staff_mfa_locked_until')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn([
            'app_authentication_secret', 'app_authentication_recovery_codes',
            'staff_mfa_last_step', 'staff_mfa_version', 'staff_mfa_failures',
            'staff_mfa_locked_until',
        ]));
    }
};

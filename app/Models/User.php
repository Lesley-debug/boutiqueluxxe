<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\VerifyEmailNotification;
use App\Support\Permissions;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;

#[Fillable(['name', 'email', 'password', 'role', 'is_admin'])]
#[Hidden(['password', 'remember_token', 'app_authentication_secret', 'app_authentication_recovery_codes', 'staff_mfa_last_step', 'staff_mfa_version', 'staff_mfa_failures', 'staff_mfa_locked_until'])]
class User extends Authenticatable implements MustVerifyEmail, FilamentUser, \Filament\Auth\MultiFactor\App\Contracts\HasAppAuthentication, \Filament\Auth\MultiFactor\App\Contracts\HasAppAuthenticationRecovery
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;
    use \Filament\Auth\MultiFactor\App\Concerns\InteractsWithAppAuthentication;
    use \Filament\Auth\MultiFactor\App\Concerns\InteractsWithAppAuthenticationRecovery;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'staff_mfa_last_step' => 'integer',
            'staff_mfa_version' => 'integer',
            'staff_mfa_failures' => 'integer',
            'staff_mfa_locked_until' => 'datetime',
        ];
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification());
    }

    public function canAccessStaffPanel(): bool
    {
        return (bool) $this->is_admin
            && $this->hasPermission('dashboard.view')
            && (! config('auth_features.email_verification_required') || $this->hasVerifiedEmail());
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $panel->getId() === 'staff' && $this->canAccessStaffPanel();
    }

    public function hasPermission(string $permission): bool
    {
        if (! $this->role) {
            return false;
        }

        $granted = Permissions::MAP[$this->role] ?? [];

        return in_array('*', $granted, true) || in_array($permission, $granted, true);
    }

    public function grantedPermissions(): array
    {
        if (! $this->role) {
            return [];
        }

        return Permissions::MAP[$this->role] ?? [];
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function wishlistItems()
    {
        return $this->hasMany(WishlistItem::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}

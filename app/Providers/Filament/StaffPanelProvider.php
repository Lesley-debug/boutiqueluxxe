<?php

namespace App\Providers\Filament;

use App\Filament\Pages\StaffDashboard;
use App\Filament\Widgets\StaffQuickLinks;
use App\Filament\Widgets\StoreOverviewStats;
use App\Http\Middleware\AddRobotsTag;
use App\Http\Middleware\EnsureStaffPanelAccess;
use App\Http\Middleware\PreventDynamicResponseCaching;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class StaffPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('staff')
            ->path('staff')
            ->authGuard('web')
            // Reuse the existing throttled login, cart merge and session regeneration.
            // /staff/login redirects; it never accepts passwords or creates users.
            ->login(fn () => redirect()->route('login'))
            ->brandName('Boutique Luxxe | Staff')
            ->brandLogo(fn () => asset('images/logo.png'))
            ->brandLogoHeight('2.5rem')
            ->colors(['primary' => Color::Amber])
            ->darkMode(false)
            ->sidebarCollapsibleOnDesktop()
            ->strictAuthorization()
            // Explicit registration prevents accidentally exposing generated resources.
            ->pages([StaffDashboard::class])
            ->widgets([StoreOverviewStats::class, StaffQuickLinks::class])
            ->middleware([
                PreventDynamicResponseCaching::class,
                AddRobotsTag::class,
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
                EnsureStaffPanelAccess::class,
            ], isPersistent: true);
    }
}

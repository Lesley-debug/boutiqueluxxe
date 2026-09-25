<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rate limiters
        $emailKey = static function (Request $request): string {
            $email = strtolower(trim((string) $request->input('email')));

            return $email !== '' ? hash('sha256', $email) : 'missing-email:'.$request->ip();
        };

        RateLimiter::for('login', fn (Request $request) => [
            Limit::perMinute(10)->by('login:ip:'.$request->ip()),
            Limit::perMinute(5)->by('login:email:'.$emailKey($request)),
        ]);
        RateLimiter::for('registration', fn (Request $request) => [
            Limit::perHour(10)->by('registration:ip:'.$request->ip()),
            Limit::perHour(3)->by('registration:email:'.$emailKey($request)),
        ]);
        RateLimiter::for('password-reset-request', fn (Request $request) => [
            Limit::perHour(5)->by('password-reset-request:ip:'.$request->ip()),
            Limit::perHour(3)->by('password-reset-request:email:'.$emailKey($request)),
        ]);
        RateLimiter::for('password-reset', fn (Request $request) => [
            Limit::perMinute(10)->by('password-reset:ip:'.$request->ip()),
            Limit::perMinute(5)->by('password-reset:email:'.$emailKey($request)),
        ]);
        RateLimiter::for('oauth', fn (Request $request) =>
            Limit::perMinute(10)->by('oauth:ip:'.$request->ip())
        );
        RateLimiter::for('checkout', fn(Request $request) => Limit::perMinute(6)->by(strtolower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('newsletter', fn(Request $request) => Limit::perMinute(6)->by(strtolower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('contact', fn(Request $request) => Limit::perHour(5)->by(strtolower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('confirmation', fn(Request $request) => Limit::perMinute(12)->by($request->ip()));
        RateLimiter::for('cart', fn(Request $request) => Limit::perMinute(30)->by($request->ip()));
    }
}

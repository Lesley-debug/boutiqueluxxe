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
        RateLimiter::for('auth', fn(Request $request) => Limit::perMinute(6)->by(strtolower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('checkout', fn(Request $request) => Limit::perMinute(6)->by(strtolower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('newsletter', fn(Request $request) => Limit::perMinute(6)->by(strtolower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('contact', fn(Request $request) => Limit::perHour(5)->by(strtolower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('confirmation', fn(Request $request) => Limit::perMinute(12)->by($request->ip()));
        RateLimiter::for('cart', fn(Request $request) => Limit::perMinute(30)->by($request->ip()));
    }
}

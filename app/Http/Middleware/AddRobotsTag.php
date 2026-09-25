<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AddRobotsTag
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->is(
            'admin*',
            'account*',
            'login',
            'register',
            'forgot-password',
            'reset-password*',
            'email/verify*',
            'auth/*',
            'cart',
            'checkout',
            'orders/*/confirmation',
        )) {
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow, noarchive');
        }

        return $response;
    }
}

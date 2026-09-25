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

        $queryKeys = array_keys($request->query());
        $indexableShopLanding = $request->routeIs('shop')
            && count($queryKeys) === 1
            && in_array($queryKeys[0], ['category', 'style'], true)
            && $request->filled($queryKeys[0]);

        if ($request->routeIs('shop') && $request->query() && ! $indexableShopLanding) {
            $response->headers->set('X-Robots-Tag', 'noindex, follow');
        }

        return $response;
    }
}

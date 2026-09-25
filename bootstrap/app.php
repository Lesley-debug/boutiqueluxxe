<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $trustedProxyConfig = require __DIR__.'/../config/trusted_proxies.php';

        $middleware->trustProxies(
            at: $trustedProxyConfig['cloudflare'],
            headers: Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO,
        );

        $middleware->web(append: [
            HandleInertiaRequests::class,
            \App\Http\Middleware\AddRobotsTag::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'permission' => \App\Http\Middleware\EnsurePermission::class,
            'email.verified' => \App\Http\Middleware\EnsureEmailIsVerifiedIfRequired::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->respond(function (Response $response) {
            $request = request();
            $status = $response->getStatusCode();
            $pages = [
                403 => [
                    'title' => 'Access denied',
                    'description' => 'You do not have permission to view this page.',
                ],
                404 => [
                    'title' => 'Page not found',
                    'description' => 'The page you requested may have moved or no longer exists.',
                ],
                419 => [
                    'title' => 'Session expired',
                    'description' => 'Your session has expired. Refresh the page and try again.',
                ],
                429 => [
                    'title' => 'Too many requests',
                    'description' => 'Please wait a moment before trying again.',
                ],
                500 => [
                    'title' => 'Something went wrong',
                    'description' => 'We could not complete your request. Please try again shortly.',
                ],
                503 => [
                    'title' => 'Temporarily unavailable',
                    'description' => 'Boutique Luxxe is temporarily unavailable. Please check back shortly.',
                ],
            ];

            if (
                config('app.debug')
                || $request->is('api/*')
                || $request->expectsJson()
                || ! isset($pages[$status])
            ) {
                return $response;
            }

            // Avoid evaluating cart, catalog or notification props while handling
            // failures such as a database outage.
            Inertia::flushShared();

            $errorResponse = Inertia::render('Errors/Status', [
                'status' => $status,
                ...$pages[$status],
            ])->toResponse($request);

            $errorResponse->setStatusCode($status);

            if ($response->headers->has('Retry-After')) {
                $errorResponse->headers->set(
                    'Retry-After',
                    $response->headers->get('Retry-After'),
                );
            }

            return $errorResponse;
        });
    })->create();


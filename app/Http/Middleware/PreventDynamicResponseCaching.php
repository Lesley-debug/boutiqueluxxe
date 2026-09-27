<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventDynamicResponseCaching
{
    /**
     * Prevent user-specific Inertia and HTML responses from entering browser,
     * reverse-proxy, LiteSpeed, or CDN caches.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $this->addVaryHeaders($response);

        $response->headers->set(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, private, max-age=0',
        );
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');

        // Explicitly prevent shared reverse proxies from retaining a response
        // containing auth, cart, notification, or session-specific props.
        $response->headers->set('CDN-Cache-Control', 'no-store');
        $response->headers->set('Surrogate-Control', 'no-store');
        $response->headers->set('X-LiteSpeed-Cache-Control', 'no-cache');

        return $response;
    }

    private function addVaryHeaders(Response $response): void
    {
        $vary = [];

        foreach ($response->headers->all('Vary') as $header) {
            foreach (explode(',', $header) as $value) {
                $value = trim($value);

                if ($value !== '') {
                    $vary[strtolower($value)] = $value;
                }
            }
        }

        foreach ([
            'Accept',
            'Cookie',
            'Authorization',
            'X-Inertia',
            'X-Inertia-Version',
            'X-Requested-With',
        ] as $value) {
            $vary[strtolower($value)] = $value;
        }

        $response->headers->set('Vary', implode(', ', array_values($vary)));
    }
}

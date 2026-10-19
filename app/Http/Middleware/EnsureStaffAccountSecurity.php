<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureStaffAccountSecurity
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user('web');
        // Shared customer inbox/activity screens can contain staff notifications and
        // private audit metadata. Customers retain their existing account behavior.
        if ($user instanceof User && ($user->is_admin || in_array($user->role, ['super_admin', 'manager', 'support_staff'], true))) {
            return app(EnsureStaffMfa::class)->handle($request, $next);
        }
        return $next($request);
    }
}

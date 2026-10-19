<?php

namespace App\Http\Middleware;

use App\Services\StaffMfa;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

final class EnsureStaffMfa
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('auth_features.staff_mfa_required', true)) {
            return $next($request);
        }
        $mfa = app(StaffMfa::class);
        $user = $mfa->current($request);
        // Only named controller routes may perform enrollment/challenge, not path prefixes,
        // user-supplied headers, return URLs or a Livewire component's public state.
        if ($request->routeIs('staff.security.*') || $mfa->passed($request, $user)) {
            return $next($request);
        }
        $request->session()->forget(StaffMfa::PROOF);
        $target = route('staff.security.show');
        if ($request->expectsJson() || $request->headers->has('X-Livewire') || $request->is('livewire*')) {
            // Livewire's persistent pipeline ignores ordinary JSON return values.
            // An HTTP response exception stops execution BEFORE component actions.
            abort(response()->json(['message' => 'Staff security verification required.', 'redirect' => $target], 403));
        }
        if ($request->headers->has('X-Inertia')) {
            return Inertia::location($target);
        }
        // Never save/replay unsafe payloads or follow untrusted intended/return URLs.
        return redirect()->to($target);
    }
}

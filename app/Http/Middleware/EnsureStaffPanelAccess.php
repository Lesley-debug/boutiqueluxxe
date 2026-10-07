<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureStaffPanelAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user('web');
        // Query current access, so demotion is enforced on subsequent AJAX requests.
        $currentUser = $user instanceof User ? $user->fresh() : null;
        abort_unless($currentUser instanceof User && $currentUser->canAccessStaffPanel(), 403);

        return $next($request);
    }
}

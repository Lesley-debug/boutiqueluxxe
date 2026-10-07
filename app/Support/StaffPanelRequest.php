<?php

namespace App\Support;

use Illuminate\Http\Request;

final class StaffPanelRequest
{
    public static function matches(Request $request): bool
    {
        // Livewire 4 may use a hashed endpoint prefix, not just /livewire/update.
        return $request->is('staff', 'staff/*', 'livewire*')
            || $request->headers->has('X-Livewire');
    }
}

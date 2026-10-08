<?php

namespace App\Policies;

use App\Models\Style;
use App\Models\User;
use App\Support\CatalogAccess;

class StylePolicy
{
    public function viewAny(User $user): bool { return CatalogAccess::allows($user); }
    public function view(User $user, Style $record): bool { return CatalogAccess::allows($user); }
    public function create(User $user): bool { return CatalogAccess::allows($user); }
    public function update(User $user, Style $record): bool { return CatalogAccess::allows($user); }
    public function delete(User $user, Style $record): bool { return false; }
    public function deleteAny(User $user): bool { return false; }
    public function forceDelete(User $user, Style $record): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, Style $record): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, Style $record): bool { return false; }
    public function reorder(User $user): bool { return false; }
}

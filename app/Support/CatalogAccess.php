<?php

namespace App\Support;

use App\Models\User;

final class CatalogAccess
{
    public static function allows(?User $user): bool
    {
        $current = $user?->fresh();

        return $current instanceof User
            && $current->canAccessStaffPanel()
            && $current->hasPermission('products.manage');
    }
}

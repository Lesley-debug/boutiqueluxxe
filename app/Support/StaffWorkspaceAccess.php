<?php
namespace App\Support;
use App\Models\User;
final class StaffWorkspaceAccess
{
    public static function allows(?User $user, string $permission): bool
    {
        $current = $user?->fresh();
        return $current instanceof User && $current->canAccessStaffPanel() && $current->hasPermission($permission);
    }
}

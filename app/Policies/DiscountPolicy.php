<?php
namespace App\Policies;
use App\Models\Discount;
use App\Models\User;
use App\Support\StaffWorkspaceAccess;
class DiscountPolicy
{
    public function viewAny(User $user): bool { return StaffWorkspaceAccess::allows($user, 'discounts.manage'); }
    public function view(User $user, Discount $record): bool { return $this->viewAny($user); }
    public function create(User $user): bool { return $this->viewAny($user); }
    public function update(User $user, Discount $record): bool { return $this->viewAny($user); }
    public function delete(User $user, Discount $record): bool { return false; }
    public function deleteAny(User $user): bool { return false; }
    public function forceDelete(User $user, Discount $record): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, Discount $record): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, Discount $record): bool { return false; }
    public function reorder(User $user): bool { return false; }
}

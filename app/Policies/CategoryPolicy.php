<?php
namespace App\Policies;
use App\Models\Category;
use App\Models\User;
use App\Support\StaffWorkspaceAccess;
class CategoryPolicy
{
    public function viewAny(User $user): bool { return StaffWorkspaceAccess::allows($user, 'products.manage'); }
    public function view(User $user, Category $record): bool { return $this->viewAny($user); }
    public function create(User $user): bool { return $this->viewAny($user); }
    public function update(User $user, Category $record): bool { return $this->viewAny($user); }
    public function delete(User $user, Category $record): bool { return false; }
    public function deleteAny(User $user): bool { return false; }
    public function forceDelete(User $user, Category $record): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, Category $record): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, Category $record): bool { return false; }
    public function reorder(User $user): bool { return false; }
}

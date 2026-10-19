<?php
namespace App\Policies;
use App\Models\ContactMessage;
use App\Models\User;
use App\Support\StaffWorkspaceAccess;
class ContactMessagePolicy
{
    public function viewAny(User $user): bool { return StaffWorkspaceAccess::allows($user, 'contacts.manage'); }
    public function view(User $user, ContactMessage $record): bool { return $this->viewAny($user); }
    public function create(User $user): bool { return false; }
    public function update(User $user, ContactMessage $record): bool { return $this->viewAny($user); }
    public function delete(User $user, ContactMessage $record): bool { return false; }
    public function deleteAny(User $user): bool { return false; }
    public function forceDelete(User $user, ContactMessage $record): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, ContactMessage $record): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, ContactMessage $record): bool { return false; }
    public function reorder(User $user): bool { return false; }
}

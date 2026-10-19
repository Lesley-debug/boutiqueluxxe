<?php
namespace App\Policies;
use App\Models\AboutPage;
use App\Models\User;
use App\Support\StaffWorkspaceAccess;
class AboutPagePolicy
{
    public function viewAny(User $u): bool { return StaffWorkspaceAccess::allows($u,'products.manage'); }
    public function view(User $u,AboutPage $r): bool { return $this->viewAny($u) && $r->id === 1; }
    public function create(User $u): bool { return false; }
    public function update(User $u,AboutPage $r): bool { return $this->viewAny($u) && $r->id === 1; }
    public function delete(User $u,AboutPage $r): bool { return false; }
    public function deleteAny(User $u): bool { return false; }
    public function forceDelete(User $u,AboutPage $r): bool { return false; }
    public function forceDeleteAny(User $u): bool { return false; }
    public function restore(User $u,AboutPage $r): bool { return false; }
    public function restoreAny(User $u): bool { return false; }
    public function replicate(User $u,AboutPage $r): bool { return false; }
    public function reorder(User $u): bool { return false; }
}

<?php
namespace App\Policies;
use App\Models\HeroSlide;
use App\Models\User;
use App\Support\StaffWorkspaceAccess;
class HeroSlidePolicy
{
    public function viewAny(User $u): bool { return StaffWorkspaceAccess::allows($u,'products.manage'); }
    public function view(User $u,HeroSlide $r): bool { return $this->viewAny($u); }
    public function create(User $u): bool { return $this->viewAny($u); }
    public function update(User $u,HeroSlide $r): bool { return $this->viewAny($u); }
    public function delete(User $u,HeroSlide $r): bool { return false; }
    public function deleteAny(User $u): bool { return false; }
    public function forceDelete(User $u,HeroSlide $r): bool { return false; }
    public function forceDeleteAny(User $u): bool { return false; }
    public function restore(User $u,HeroSlide $r): bool { return false; }
    public function restoreAny(User $u): bool { return false; }
    public function replicate(User $u,HeroSlide $r): bool { return false; }
    public function reorder(User $u): bool { return false; }
}

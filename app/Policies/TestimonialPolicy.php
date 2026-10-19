<?php
namespace App\Policies;
use App\Models\Testimonial;
use App\Models\User;
use App\Support\StaffWorkspaceAccess;
class TestimonialPolicy
{
    public function viewAny(User $u): bool { return StaffWorkspaceAccess::allows($u,'products.manage'); }
    public function view(User $u,Testimonial $r): bool { return $this->viewAny($u); }
    public function create(User $u): bool { return $this->viewAny($u); }
    public function update(User $u,Testimonial $r): bool { return $this->viewAny($u); }
    public function delete(User $u,Testimonial $r): bool { return false; }
    public function deleteAny(User $u): bool { return false; }
    public function forceDelete(User $u,Testimonial $r): bool { return false; }
    public function forceDeleteAny(User $u): bool { return false; }
    public function restore(User $u,Testimonial $r): bool { return false; }
    public function restoreAny(User $u): bool { return false; }
    public function replicate(User $u,Testimonial $r): bool { return false; }
    public function reorder(User $u): bool { return false; }
}

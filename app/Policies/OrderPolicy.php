<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use App\Support\StaffOrderAccess;

class OrderPolicy
{
    public function viewAny(User $user): bool { return StaffOrderAccess::allows($user); }
    public function view(User $user, Order $order): bool { return StaffOrderAccess::allows($user); }
    public function update(User $user, Order $order): bool { return StaffOrderAccess::allows($user); }
    public function create(User $user): bool { return false; }
    public function delete(User $user, Order $order): bool { return false; }
    public function deleteAny(User $user): bool { return false; }
    public function forceDelete(User $user, Order $order): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, Order $order): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, Order $order): bool { return false; }
    public function reorder(User $user): bool { return false; }
}

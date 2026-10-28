<?php

namespace App\Policies;

use App\Models\ProductReview;
use App\Models\User;
use App\Support\CatalogAccess;

class ProductReviewPolicy
{
    public function viewAny(User $user): bool { return CatalogAccess::allows($user); }
    public function view(User $user, ProductReview $record): bool { return CatalogAccess::allows($user); }
    public function create(User $user): bool { return CatalogAccess::allows($user); }
    public function update(User $user, ProductReview $record): bool { return CatalogAccess::allows($user); }
    public function delete(User $user, ProductReview $record): bool { return CatalogAccess::allows($user); }
    public function deleteAny(User $user): bool { return CatalogAccess::allows($user); }
    public function forceDelete(User $user, ProductReview $record): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, ProductReview $record): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, ProductReview $record): bool { return false; }
    public function reorder(User $user): bool { return false; }
}

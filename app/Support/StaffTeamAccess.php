<?php
namespace App\Support;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
final class StaffTeamAccess
{
    public const ROLES=['super_admin','manager','support_staff'];
    public static function isOwner(?User $user): bool { return $user instanceof User && (bool)$user->is_admin && $user->role==='super_admin' && $user->hasVerifiedEmail(); }
    public static function allows(?User $user): bool { return self::isOwner($user?->fresh()); }
    public static function authorize(?User $user): void { if (! self::allows($user)) { throw new AuthorizationException('Only a verified, active super admin may manage staff access.'); } }
    public static function editable(?User $actor,User $target): bool { return self::allows($actor) && $actor->id!==$target->id && in_array($target->role,['manager','support_staff'],true); }
}

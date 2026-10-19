<?php
namespace App\Services;
use App\Models\{User,UserActivityLog};
use App\Support\StaffTeamAccess;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\{DB,Schema,Validator};
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
final class StaffTeamManager
{
    public function fingerprint(User $user): string
    {
        $v=array_intersect_key($user->getRawOriginal(),array_flip(['id','name','email','role','is_admin','email_verified_at','updated_at']));
        $v['id']=(int)$user->id; $v['is_admin']=(bool)$user->is_admin; ksort($v); return hash('sha256',json_encode($v,JSON_THROW_ON_ERROR));
    }
    public function change(User $actor,User $target,string $operation,array $input,string $prefix=''): User
    {
        StaffTeamAccess::authorize($actor);
        try {
            $v=Validator::make($input,['expected_snapshot'=>['required','string','size:64'],'reason'=>['required','string','min:3','max:500','regex:/\S/u'],...($operation==='role'?['role'=>['required','in:manager,support_staff']]:[])])->validate();
            if (preg_replace('/[\s\p{Z}\x{200B}]+/u','',$v['reason'])==='') { throw ValidationException::withMessages(['reason'=>'Enter a meaningful private reason.']); }
            if (! in_array($operation,['role','deactivate','reactivate'],true)) { throw ValidationException::withMessages(['reason'=>'Unsupported staff operation.']); }
            // Revocation is atomic only with the database-session store on the same connection.
            if (config('session.driver')!=='database' || (config('session.connection') ?: config('database.default'))!==config('database.default') || ! Schema::hasTable(config('session.table','sessions')) || ! Schema::hasTable('user_activity_logs')) {
                throw ValidationException::withMessages(['reason'=>'Staff access changes require database sessions on the application database. Run staff:check-prerequisites and review the session configuration first.']);
            }
            return DB::transaction(function () use ($actor,$target,$operation,$v): User {
                // All owner rows + actor + target locked in deterministic order, also rechecking cached actors.
                $users=User::query()->where(fn ($q)=>$q->where('role','super_admin')->orWhereIn('id',[$actor->id,$target->id]))->orderBy('id')->lockForUpdate()->get();
                $owner=$users->firstWhere('id',$actor->id); $staff=$users->firstWhere('id',$target->id);
                if (! StaffTeamAccess::isOwner($owner) || ! ($staff instanceof User) || $staff->id===$owner->id || ! in_array($staff->role,['manager','support_staff'],true)) { throw new AuthorizationException('Owner accounts, customers and your own account cannot be changed in this workspace.'); }
                // Owner accounts cannot be changed at all, so self/last-owner removal is impossible here.
                if (! hash_equals($this->fingerprint($staff),$v['expected_snapshot'])) { throw ValidationException::withMessages([($operation==='role'?'role':'reason')=>'This staff account changed in another session. Reload before continuing.']); }
                $before=['role'=>$staff->role,'is_admin'=>(bool)$staff->is_admin];
                if ($operation==='role') { $staff->role=$v['role']; }
                elseif ($operation==='deactivate') { if (! $staff->is_admin) { throw ValidationException::withMessages(['reason'=>'Staff access is already inactive.']); } $staff->is_admin=false; }
                else { if ($staff->is_admin) { throw ValidationException::withMessages(['reason'=>'Staff access is already active.']); } if (! $staff->hasVerifiedEmail()) { throw ValidationException::withMessages(['reason'=>'The staff member must verify their email before reactivation.']); } $staff->is_admin=true; }
                $after=['role'=>$staff->role,'is_admin'=>(bool)$staff->is_admin];
                if ($before===$after) { return $staff->fresh(); }
                $staff->remember_token=Str::random(60); $staff->save();
                UserActivityLog::create(['user_id'=>$owner->id,'activity_type'=>'staff_access_changed','description'=>'Staff access changed','metadata'=>['target_id'=>$staff->id,'operation'=>$operation,'before'=>$before,'after'=>$after,'reason'=>$v['reason']],'ip_address'=>request()->ip(),'user_agent'=>mb_substr((string)request()->userAgent(),0,255)]);
                DB::table(config('session.table','sessions'))->where('user_id',$staff->id)->delete();
                return $staff->fresh();
            });
        } catch (ValidationException $e) { throw ValidationException::withMessages(collect($e->errors())->mapWithKeys(fn ($errors,$key)=>[$prefix.$key=>$errors])->all()); }
    }
}

<?php
namespace Tests\Feature;
use App\Models\{User,UserActivityLog};
use App\Services\StaffTeamManager;
use App\Support\StaffTeamAccess;
use App\Filament\Resources\Team\StaffUserResource;
use App\Filament\Resources\Team\Pages\{ListStaff,EditStaff};
use App\Filament\Widgets\StaffQuickLinks;
use App\Filament\Pages\Customers;
use Filament\Facades\Filament;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;
class StaffTeamManagementTest extends TestCase
{
    use RefreshDatabase;
    private User $owner;
    private User $staff;
    protected function setUp(): void
    {
        parent::setUp(); config(['auth_features.email_verification_required'=>true,'session.driver'=>'database','session.connection'=>null]);
        $this->owner=User::factory()->create(['is_admin'=>true,'role'=>'super_admin']); $this->staff=User::factory()->create(['is_admin'=>true,'role'=>'manager']);
        Filament::setCurrentPanel(Filament::getPanel('staff'));
    }
    private function manager(): StaffTeamManager { return app(StaffTeamManager::class); }
    private function data(User $target,array $extra=[]): array { return array_replace(['expected_snapshot'=>$this->manager()->fingerprint($target),'reason'=>'Local security review'],$extra); }
    private function invalid(callable $fn): void { try { $fn(); $this->fail('Expected validation refusal'); } catch (ValidationException $e) { $this->assertNotEmpty($e->errors()); } }
    private function forbidden(callable $fn): void { try { $fn(); $this->fail('Expected authorization refusal'); } catch (AuthorizationException $e) { $this->assertTrue(true); } }
    public function test_only_active_verified_super_admin_can_open_team(): void
    {
        $this->actingAs($this->owner)->get('/staff/team')->assertOk()->assertHeader('X-Robots-Tag','noindex, nofollow, noarchive');
        foreach (['manager','support_staff'] as $role) { $u=User::factory()->create(['role'=>$role,'is_admin'=>true]); $this->actingAs($u)->get('/staff/team')->assertForbidden(); }
        $this->actingAs(User::factory()->create())->get('/staff/team')->assertForbidden();
        config(['auth_features.email_verification_required'=>false]); $u=User::factory()->unverified()->create(['role'=>'super_admin','is_admin'=>true]); $this->actingAs($u)->get('/staff/team')->assertForbidden();
    }
    public function test_team_query_excludes_customers_and_retains_inactive_staff(): void
    {
        $customer=User::factory()->create(['role'=>null,'is_admin'=>false]); $inactive=User::factory()->create(['role'=>'support_staff','is_admin'=>false]); $this->actingAs($this->owner);
        $ids=StaffUserResource::getEloquentQuery()->pluck('id')->all(); $this->assertContains($inactive->id,$ids); $this->assertContains($this->owner->id,$ids); $this->assertNotContains($customer->id,$ids);
        Livewire::test(ListStaff::class)->assertCanSeeTableRecords([$this->staff,$inactive])->assertCanNotSeeTableRecords([$customer]);
    }
    public function test_customers_removed_from_navigation_without_deleting_records_or_history_route(): void
    {
        $this->actingAs($this->owner); $this->assertFalse(Customers::shouldRegisterNavigation()); $links=app(StaffQuickLinks::class)->links(); $this->assertNotContains('/staff/customers',array_column($links,'path')); $this->assertContains('/staff/team',array_column($links,'path'));
        $this->get('/staff/customers')->assertOk(); $this->assertDatabaseHas('users',['id'=>$this->staff->id]);
    }
    public function test_role_edit_is_audited_preserves_identity_and_revokes_only_target_sessions(): void
    {
        DB::table('sessions')->insert([['id'=>'staff-session','user_id'=>$this->staff->id,'payload'=>'test','last_activity'=>time()],['id'=>'owner-session','user_id'=>$this->owner->id,'payload'=>'test','last_activity'=>time()]]);
        $old=$this->staff->only(['name','email','password','email_verified_at']); $token=$this->staff->remember_token;
        $saved=$this->manager()->change($this->owner,$this->staff,'role',$this->data($this->staff,['role'=>'support_staff','email'=>'forged@example.test','is_admin'=>false]));
        $this->assertSame('support_staff',$saved->role); $this->assertTrue((bool)$saved->is_admin); $this->assertEquals($old,$saved->only(['name','email','password','email_verified_at'])); $this->assertNotSame($token,$saved->remember_token);
        $this->assertDatabaseMissing('sessions',['id'=>'staff-session']); $this->assertDatabaseHas('sessions',['id'=>'owner-session']);
        $log=UserActivityLog::where('activity_type','staff_access_changed')->firstOrFail(); $this->assertSame($this->owner->id,$log->user_id); $this->assertSame($this->staff->id,$log->metadata['target_id']); $this->assertSame('role',$log->metadata['operation']); $this->assertArrayNotHasKey('password',$log->metadata);
    }
    public function test_deactivation_preserves_role_account_password_and_reactivation_requires_verified_email(): void
    {
        $password=$this->staff->password; $saved=$this->manager()->change($this->owner,$this->staff,'deactivate',$this->data($this->staff)); $this->assertFalse((bool)$saved->is_admin); $this->assertSame('manager',$saved->role); $this->assertSame($password,$saved->password); $this->assertFalse($saved->canAccessStaffPanel());
        $saved=$this->manager()->change($this->owner,$saved,'reactivate',$this->data($saved)); $this->assertTrue((bool)$saved->is_admin); $this->assertTrue($saved->canAccessStaffPanel());
        $u=User::factory()->unverified()->create(['role'=>'manager','is_admin'=>false]); $this->invalid(fn ()=>$this->manager()->change($this->owner,$u,'reactivate',$this->data($u))); $this->assertFalse((bool)$u->fresh()->is_admin);
    }
    public function test_all_owner_accounts_and_self_are_protected_including_last_owner(): void
    {
        foreach (['role','deactivate','reactivate'] as $op) { $this->forbidden(fn ()=>$this->manager()->change($this->owner,$this->owner,$op,$this->data($this->owner,['role'=>'support_staff']))); }
        $second=User::factory()->create(['role'=>'super_admin','is_admin'=>true]); $this->forbidden(fn ()=>$this->manager()->change($this->owner,$second,'deactivate',$this->data($second)));
        $this->actingAs($this->owner); $this->assertFalse(StaffUserResource::canEdit($this->owner)); $this->assertFalse(StaffUserResource::canDelete($this->staff)); $this->assertFalse(StaffUserResource::canCreate()); $this->assertFalse(StaffUserResource::canDeleteAny());
        $this->assertTrue((bool)$this->owner->fresh()->is_admin); $this->assertSame('super_admin',$this->owner->fresh()->role);
    }
    public function test_customers_cannot_be_promoted_and_staff_cannot_escalate_to_super_admin(): void
    {
        $customer=User::factory()->create(['role'=>null,'is_admin'=>false]); $this->forbidden(fn ()=>$this->manager()->change($this->owner,$customer,'role',$this->data($customer,['role'=>'manager'])));
        $this->invalid(fn ()=>$this->manager()->change($this->owner,$this->staff,'role',$this->data($this->staff,['role'=>'super_admin']))); $this->assertSame('manager',$this->staff->fresh()->role);
    }
    public function test_cached_demoted_owner_and_direct_manager_call_are_refused(): void
    {
        $this->forbidden(fn ()=>$this->manager()->change($this->staff,$this->staff,'deactivate',$this->data($this->staff)));
        User::whereKey($this->owner->id)->update(['is_admin'=>false]); $this->forbidden(fn ()=>$this->manager()->change($this->owner,$this->staff,'deactivate',$this->data($this->staff))); $this->assertTrue((bool)$this->staff->fresh()->is_admin);
    }
    public function test_stale_staff_forms_do_not_overwrite_real_access_changes(): void
    {
        $old=$this->data($this->staff,['role'=>'support_staff']); $this->staff->update(['role'=>'support_staff']); $this->invalid(fn ()=>$this->manager()->change($this->owner,$this->staff,'role',$old));
        $this->assertSame('support_staff',$this->staff->fresh()->role); $this->assertDatabaseCount('user_activity_logs',0);
    }
    public function test_display_alias_does_not_affect_fingerprint_and_blank_reason_is_rejected(): void
    {
        $copy=clone $this->staff; $copy->setRawAttributes(array_replace($this->staff->getRawOriginal(),['order_count'=>10]),true); $this->assertSame($this->manager()->fingerprint($this->staff),$this->manager()->fingerprint($copy));
        $this->invalid(fn ()=>$this->manager()->change($this->owner,$this->staff,'deactivate',$this->data($this->staff,['reason'=>' ']))); $this->assertTrue((bool)$this->staff->fresh()->is_admin);
    }
    public function test_repeat_or_noop_operations_do_not_add_audit_or_invalidate_sessions(): void
    {
        $saved=$this->manager()->change($this->owner,$this->staff,'role',$this->data($this->staff,['role'=>'manager'])); $this->assertDatabaseCount('user_activity_logs',0);
        $saved=$this->manager()->change($this->owner,$saved,'deactivate',$this->data($saved)); $this->invalid(fn ()=>$this->manager()->change($this->owner,$saved,'deactivate',$this->data($saved))); $this->assertDatabaseCount('user_activity_logs',1);
    }
    public function test_missing_database_session_configuration_blocks_mutation(): void
    {
        config(['session.driver'=>'file']); $this->invalid(fn ()=>$this->manager()->change($this->owner,$this->staff,'deactivate',$this->data($this->staff))); $this->assertTrue((bool)$this->staff->fresh()->is_admin); $this->assertDatabaseCount('user_activity_logs',0);
    }
    public function test_audit_failure_rolls_back_access_and_keeps_sessions(): void
    {
        DB::table('sessions')->insert(['id'=>'target-before-failure','user_id'=>$this->staff->id,'payload'=>'test','last_activity'=>time()]);
        UserActivityLog::creating(function ($log) { if ($log->activity_type==='staff_access_changed') { throw new \RuntimeException('Simulated audit failure'); } });
        try { $this->manager()->change($this->owner,$this->staff,'deactivate',$this->data($this->staff)); $this->fail('Expected audit failure'); }
        catch (\RuntimeException $e) { $this->assertSame('Simulated audit failure',$e->getMessage()); }
        finally { UserActivityLog::flushEventListeners(); }
        $this->assertTrue((bool)$this->staff->fresh()->is_admin); $this->assertDatabaseHas('sessions',['id'=>'target-before-failure']);
    }
    public function test_legacy_users_handoff_and_posted_roles_are_never_replayed(): void
    {
        $this->actingAs($this->owner)->withHeaders(['X-Inertia'=>'true','X-Inertia-Version'=>'old']); $this->get('/admin/users')->assertStatus(409)->assertHeader('X-Inertia-Location',url('/staff/team'));
        $this->patch('/admin/users/'.$this->staff->id.'/role',['role'=>'super_admin'])->assertStatus(409); $this->assertSame('manager',$this->staff->fresh()->role);
        $customer=User::factory()->create(); $this->patch('/admin/users/'.$customer->id.'/role',['role'=>'manager'])->assertForbidden();
    }
    public function test_livewire_role_edit_uses_guarded_service_and_refreshes_snapshot(): void
    {
        $this->actingAs($this->owner); $page=Livewire::test(EditStaff::class,['record'=>$this->staff->id]); $page->fillForm(['role'=>'support_staff','reason'=>'Local role adjustment'])->call('save',false)->assertHasNoFormErrors();
        $page->fillForm(['role'=>'manager','reason'=>'Local second adjustment'])->call('save',false)->assertHasNoFormErrors(); $this->assertSame('manager',$this->staff->fresh()->role); $this->assertDatabaseCount('user_activity_logs',2);
    }
    public function test_livewire_deactivate_and_reactivate_are_confirmed_private_actions(): void
    {
        $this->actingAs($this->owner); $page=Livewire::test(EditStaff::class,['record'=>$this->staff->id]); $page->callAction('deactivate',['reason'=>'Local access withdrawal'])->assertHasNoActionErrors(); $this->assertFalse((bool)$this->staff->fresh()->is_admin);
        $page->callAction('reactivate',['reason'=>'Local reviewed reactivation'])->assertHasNoActionErrors(); $this->assertTrue((bool)$this->staff->fresh()->is_admin); $this->assertDatabaseCount('user_activity_logs',2);
    }
    public function test_customer_edit_owner_edit_and_manager_edit_urls_are_forbidden(): void
    {
        $customer=User::factory()->create(); $this->actingAs($this->owner)->get('/staff/team/'.$customer->id.'/edit')->assertNotFound(); $this->get('/staff/team/'.$this->owner->id.'/edit')->assertForbidden();
        $this->actingAs($this->staff)->get('/staff/team/'.$this->staff->id.'/edit')->assertForbidden();
    }
    public function test_prerequisite_command_is_read_only(): void
    {
        $before=User::count(); $this->artisan('staff:check-prerequisites')->assertExitCode(0); $this->assertSame($before,User::count()); $this->assertDatabaseCount('user_activity_logs',0);
        config(['session.driver'=>'file']); $this->artisan('staff:check-prerequisites')->assertExitCode(1);
    }

    public function test_livewire_stale_edit_shows_field_error_and_keeps_latest_role(): void
    {
        $this->actingAs($this->owner); $page=Livewire::test(EditStaff::class,['record'=>$this->staff->id]); $this->staff->update(['role'=>'support_staff']);
        $page->fillForm(['role'=>'manager','reason'=>'Stale editor attempt'])->call('save',false)->assertHasFormErrors(['role']); $this->assertSame('support_staff',$this->staff->fresh()->role); $this->assertDatabaseCount('user_activity_logs',0);
    }
    public function test_deactivated_cached_staff_cannot_enter_panel_and_stale_confirmation_is_rejected(): void
    {
        $cached=clone $this->staff; $stale=$this->data($this->staff); $saved=$this->manager()->change($this->owner,$this->staff,'deactivate',$stale);
        $this->actingAs($cached)->get('/staff/orders')->assertForbidden(); $this->invalid(fn ()=>$this->manager()->change($this->owner,$saved,'reactivate',$stale)); $this->assertFalse((bool)$this->staff->fresh()->is_admin);
    }
}

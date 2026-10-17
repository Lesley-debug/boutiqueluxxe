<?php
namespace Tests\Feature;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{Crypt,DB,Mail};
use Illuminate\Support\Str;
use Tests\TestCase;
class StaffNotificationSoundTest extends TestCase
{
    use RefreshDatabase;
    private User $staff;
    private string $path='/staff/notification-sound/poll';
    protected function setUp(): void { parent::setUp(); config(['auth_features.email_verification_required'=>true]); Mail::fake(); $this->staff=User::factory()->create(['is_admin'=>true,'role'=>'manager']); }
    private function alert(User $user,?string $morph=null,bool $read=false): string
    {
        $id=(string)Str::uuid(); DB::table('notifications')->insert(['id'=>$id,'type'=>'sound-test','notifiable_type'=>$morph ?? $user->getMorphClass(),'notifiable_id'=>$user->id,'data'=>json_encode(['title'=>'PRIVATE TITLE','message'=>'PRIVATE ORDER MESSAGE','url'=>'https://example.test/private-token']),'read_at'=>$read?now():null,'created_at'=>now(),'updated_at'=>now()]); return $id;
    }
    public function test_feed_is_private_owned_metadata_without_payload_or_read_mutations(): void
    {
        $own=$this->alert($this->staff); $this->alert(User::factory()->create()); $this->alert($this->staff,'OtherModel'); $before=DB::table('notifications')->orderBy('id')->get()->toJson();
        $r=$this->actingAs($this->staff)->getJson($this->path)->assertOk()->assertHeader('X-Robots-Tag','noindex, nofollow, noarchive')->assertJsonPath('user',(string)$this->staff->id)->assertJsonPath('baseline',true)->assertJsonCount(1,'items');
        $this->assertSame($own,$r->json('items.0.id')); $this->assertStringContainsString('no-store',$r->headers->get('Cache-Control')); foreach (['PRIVATE TITLE','PRIVATE ORDER MESSAGE','private-token','notifiable_id'] as $secret) { $this->assertStringNotContainsString($secret,$r->getContent()); }
        $this->assertSame($before,DB::table('notifications')->orderBy('id')->get()->toJson()); Mail::assertNothingSent();
    }
    public function test_guest_customer_inactive_and_unknown_role_are_denied(): void
    {
        $this->getJson($this->path)->assertUnauthorized();
        foreach ([['role'=>null,'is_admin'=>false],['role'=>'manager','is_admin'=>false],['role'=>'other','is_admin'=>true]] as $attributes) { $this->actingAs(User::factory()->create($attributes))->getJson($this->path)->assertForbidden(); }
    }
    public function test_manager_support_and_owner_can_poll_only_their_own_alerts(): void
    {
        foreach (['manager','support_staff','super_admin'] as $role) { $u=User::factory()->create(['role'=>$role,'is_admin'=>true]); $id=$this->alert($u); $this->actingAs($u)->getJson($this->path)->assertOk()->assertJsonCount(1,'items')->assertJsonPath('items.0.id',$id); }
    }
    public function test_signed_cursor_is_user_bound_and_tampering_is_rejected(): void
    {
        $cursor=$this->actingAs($this->staff)->getJson($this->path)->json('cursor'); $this->getJson($this->path.'?cursor='.urlencode($cursor.'x'))->assertUnprocessable();
        $other=User::factory()->create(['role'=>'manager','is_admin'=>true]); $this->actingAs($other)->getJson($this->path.'?cursor='.urlencode($cursor))->assertUnprocessable();
    }
    public function test_followup_includes_same_second_new_ids_and_read_rows_without_payload(): void
    {
        $this->freezeTime(); $old=$this->alert($this->staff,null,true); $cursor=$this->actingAs($this->staff)->getJson($this->path)->json('cursor'); $new=$this->alert($this->staff);
        $r=$this->getJson($this->path.'?cursor='.urlencode($cursor))->assertOk()->assertJsonPath('baseline',false)->assertJsonCount(2,'items'); $items=collect($r->json('items'))->keyBy('id'); $this->assertFalse($items[$old]['unread']); $this->assertTrue($items[$new]['unread']);
    }
    public function test_cursor_expires_and_old_history_is_excluded_from_followup(): void
    {
        $old=$this->alert($this->staff); DB::table('notifications')->where('id',$old)->update(['created_at'=>now()->subDay()]); $cursor=$this->actingAs($this->staff)->getJson($this->path)->json('cursor'); $this->getJson($this->path.'?cursor='.urlencode($cursor))->assertOk()->assertJsonCount(0,'items');
        $this->travel(2)->minutes(); $this->getJson($this->path.'?cursor='.urlencode($cursor))->assertUnprocessable();
    }
    public function test_feed_is_bounded_and_reports_overflow(): void
    {
        for ($i=0;$i<102;$i++) { $this->alert($this->staff); } $this->actingAs($this->staff)->getJson($this->path)->assertOk()->assertJsonCount(100,'items')->assertJsonPath('overflow',true);
    }
    public function test_cached_demoted_staff_is_refused_and_no_mail_is_sent(): void
    {
        $this->actingAs($this->staff); User::whereKey($this->staff->id)->update(['is_admin'=>false]); $this->getJson($this->path)->assertForbidden(); Mail::assertNothingSent();
    }
    public function test_native_pages_include_sound_controls_but_public_store_does_not(): void
    {
        $this->actingAs($this->staff)->get('/staff')->assertOk()->assertSee('data-staff-notification-sound',false)->assertSee('staff-assets/notification-sound.js',false);
        $this->get('/staff/notifications')->assertOk()->assertSee('data-staff-notification-sound',false); $this->get('/')->assertOk()->assertDontSee('data-staff-notification-sound',false)->assertDontSee('staff-assets/notification-sound.js',false);
    }
}

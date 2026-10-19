<?php
namespace App\Services;
use App\Models\{ContactMessage, ContactEvent, User};
use App\Mail\{ContactMessageMail, ContactReplyMail};
use Illuminate\Support\Facades\{DB, Gate, Mail, Validator};
use Illuminate\Validation\ValidationException;
final class ContactDelivery
{
    public function send(int $id): bool
    {
        $event = ContactEvent::findOrFail($id);
        $claim = DB::transaction(function () use ($event): ?ContactEvent {
            ContactMessage::whereKey($event->contact_message_id)->lockForUpdate()->firstOrFail();
            $e = ContactEvent::whereKey($event->id)->lockForUpdate()->firstOrFail();
            if (! in_array($e->email_status, ['pending','failed'], true) || ! in_array($e->kind, ['receipt','reply'], true)) { return null; }
            $scope = ContactEvent::where('contact_message_id',$e->contact_message_id);
            if ((clone $scope)->where('email_status','sending')->exists() || (clone $scope)->where('id','<',$e->id)->where('email_status','pending')->exists()) { return null; }
            if ($e->kind === 'reply' && (clone $scope)->where('id','>',$e->id)->where('kind','reply')->where('email_status','sent')->exists()) { throw ValidationException::withMessages(['event_id'=>'A newer reply was submitted. Do not send this stale reply.']); }
            $e->email_status = 'sending'; $e->email_claimed_at = now(); $e->email_attempts++; $e->email_error = null; $e->save(); return $e;
        });
        if (! $claim) { return false; }
        try {
            $s = $claim->snapshot; Validator::make($s, ['recipient'=>['required','email','max:255']])->validate();
            Mail::to($s['recipient'])->send($claim->kind === 'receipt' ? new ContactMessageMail($s['contact']) : new ContactReplyMail($s));
            ContactEvent::whereKey($claim->id)->where('email_status','sending')->where('email_attempts',$claim->email_attempts)->update(['email_status'=>'sent','email_sent_at'=>now(),'email_error'=>null]); return true;
        } catch (\Throwable $e) {
            report($e); ContactEvent::whereKey($claim->id)->where('email_status','sending')->where('email_attempts',$claim->email_attempts)->update(['email_status'=>'failed','email_error'=>'Mail submission failed. Review mail configuration and logs.']); return false;
        }
    }
    public function drain(int $thread, int $limit = 20): void
    {
        for ($i=0; $i<$limit; $i++) { $e=ContactEvent::where('contact_message_id',$thread)->where('email_status','pending')->oldest('id')->first(); if (! $e || ! $this->send($e->id)) { return; } }
    }
    public function retry(User $actor, ContactMessage $thread, int $id): bool
    {
        Gate::forUser($actor)->authorize('update',$thread); $e=ContactEvent::where('contact_message_id',$thread->id)->findOrFail($id);
        if (! in_array($e->email_status,['pending','failed'],true)) { throw ValidationException::withMessages(['event_id'=>'Only pending or failed messages can be submitted.']); }
        $sent=$this->send($e->id); if ($sent) { $this->drain($thread->id); } return $sent;
    }
    public function recover(User $actor, ContactMessage $thread, int $id, string $note): void
    {
        Gate::forUser($actor)->authorize('update',$thread); Validator::make(['note'=>$note],['note'=>['required','string','min:3','max:2000','regex:/\S/u']])->validate();
        DB::transaction(function () use ($actor,$thread,$id,$note): void {
            ContactMessage::whereKey($thread->id)->lockForUpdate()->firstOrFail(); $e=ContactEvent::where('contact_message_id',$thread->id)->whereKey($id)->lockForUpdate()->firstOrFail();
            if ($e->email_status !== 'sending' || ! $e->email_claimed_at || $e->email_claimed_at->gt(now()->subMinutes(10))) { throw ValidationException::withMessages(['event_id'=>'Only interrupted attempts older than ten minutes can be reviewed.']); }
            $meta=$e->metadata ?? []; $meta['recovery'][]=['actor'=>$actor->fresh()->name,'note'=>$note,'at'=>now()->toIso8601String()];
            $e->metadata=$meta; $e->email_status='failed'; $e->email_error='Interrupted submission reviewed; a retry can duplicate accepted mail.'; $e->save();
        });
    }
}

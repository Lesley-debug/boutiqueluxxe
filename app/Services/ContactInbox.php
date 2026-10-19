<?php
namespace App\Services;
use App\Models\{ContactMessage, ContactEvent, User};
use Illuminate\Support\Facades\{DB, Gate, Validator};
use Illuminate\Validation\ValidationException;
final class ContactInbox
{
    public function submit(array $data): ContactMessage
    {
        $data['email'] = strtolower(trim((string) ($data['email'] ?? '')));
        $v = Validator::make($data, ['name'=>['required','string','max:120','regex:/^[^\r\n]+$/','regex:/\S/u'], 'email'=>['required','email','max:255'], 'subject'=>['required','string','max:160','regex:/^[^\r\n]+$/','regex:/\S/u'], 'message'=>['required','string','min:10','max:5000'], 'website'=>['nullable','max:0']])->validate();
        return DB::transaction(function () use ($v): ContactMessage {
            $thread = ContactMessage::create(array_intersect_key($v, array_flip(['name','email','subject','message'])));
            ContactEvent::create(['contact_message_id'=>$thread->id,'actor_name'=>'Website visitor','kind'=>'receipt','snapshot'=>['recipient'=>(string) config('mail.contact.address'), 'contact'=>$thread->only(['name','email','subject','message'])],'email_status'=>'pending']);
            $this->afterCommit($thread->id); return $thread;
        });
    }
    private function afterCommit(int $id): void
    {
        if (config('contacts.auto_submit_updates', true)) { DB::afterCommit(function () use ($id): void { try { app(ContactDelivery::class)->drain($id); } catch (\Throwable $e) { report($e); } }); }
    }
    public function act(User $actor, ContactMessage $thread, string $kind, string $body, int $expected): ContactEvent
    {
        Gate::forUser($actor)->authorize('update', $thread);
        Validator::make(['kind'=>$kind,'body'=>$body], ['kind'=>['required','in:reply,note,resolve,reopen'], 'body'=>['required','string','min:3','max:5000','regex:/\S/u']])->validate();
        return DB::transaction(function () use ($actor,$thread,$kind,$body,$expected): ContactEvent {
            $r = ContactMessage::whereKey($thread->id)->lockForUpdate()->firstOrFail();
            if ($r->workflow_version !== $expected) { throw ValidationException::withMessages(['body'=>'This conversation changed. Reload before submitting.']); }
            if (($kind === 'reply' || $kind === 'resolve') && $r->status !== 'open') { throw ValidationException::withMessages(['body'=>'Reopen this resolved conversation first.']); }
            if ($kind === 'reopen' && $r->status !== 'resolved') { throw ValidationException::withMessages(['body'=>'This conversation is already open.']); }
            $snapshot = $kind === 'reply' ? ['recipient'=>$r->email,'subject'=>$r->subject,'body'=>$body] : null;
            if ($kind === 'resolve') { $r->status = 'resolved'; }
            if ($kind === 'reopen') { $r->status = 'open'; }
            $r->workflow_version++; $r->save();
            $event = ContactEvent::create(['contact_message_id'=>$r->id,'actor_id'=>$actor->id,'actor_name'=>$actor->fresh()->name,'kind'=>$kind,'body'=>$body,'snapshot'=>$snapshot,'email_status'=>$kind === 'reply' ? 'pending' : 'not_requested']);
            if ($kind === 'reply') { $this->afterCommit($r->id); } return $event;
        });
    }
}

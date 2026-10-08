<?php
namespace App\Filament\Resources\Contacts\Pages;
use App\Filament\Resources\Contacts\ContactResource;
use App\Models\{ContactMessage,ContactEvent};
use App\Services\{ContactInbox,ContactDelivery};
use Filament\Actions\Action;
use Filament\Forms\Components\{Hidden,Select,Textarea};
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
class ViewContact extends ViewRecord
{
    protected static string $resource=ContactResource::class;
    protected string $view='filament.resources.contacts.view-contact';
    public function details(): ContactMessage { Gate::authorize('view',$this->getRecord()); return $this->getRecord()->fresh(); }
    public function history(): \Illuminate\Support\Collection { Gate::authorize('view',$this->getRecord()); return $this->getRecord()->events()->latest('id')->limit(50)->get(); }
    private function perform(callable $operation): void
    {
        try { $result=$operation(); }
        catch (ValidationException $e) { $p=$this->getMountedActionSchema()?->getStatePath(); throw ValidationException::withMessages(collect($e->errors())->mapWithKeys(fn ($v,$k)=>[($p?$p.'.':'').$k=>$v])->all()); }
        $this->record=$this->getRecord()->fresh();
        $warning=$result === false || ($result instanceof ContactEvent && in_array($result->fresh()->email_status,['pending','failed','sending'],true));
        $n=Notification::make()->title($warning?'Saved — mail needs attention; review history':'Conversation action saved'); if ($warning) { $n->warning(); } else { $n->success(); } $n->send();
    }
    protected function getHeaderActions(): array
    {
        $actions=[];
        foreach (['reply'=>'Reply to customer','note'=>'Add private note','resolve'=>'Resolve','reopen'=>'Reopen'] as $kind=>$label) {
            $actions[]=Action::make($kind)->label($label)->color($kind==='reply'?'primary':'gray')
                ->visible(fn (): bool => $kind==='note' || ($kind==='reopen' ? $this->getRecord()->fresh()->status==='resolved' : $this->getRecord()->fresh()->status==='open'))
                ->fillForm(fn (): array => ['expected'=>$this->getRecord()->fresh()->workflow_version])
                ->schema([Hidden::make('expected'),Textarea::make('body')->label($kind==='reply'?'Customer reply':'Private note / reason')->required()->minLength(3)->maxLength(5000)->helperText($kind==='reply'?'Only this reply is emailed. Internal notes and reasons remain private.':'Not emailed to the customer.')])
                ->requiresConfirmation()->modalDescription($kind==='reply'?'Submit this reply to the original customer email address?':'Save this staff-only conversation action?')
                ->action(fn (array $data) => $this->perform(fn () => app(ContactInbox::class)->act(auth('web')->user(),$this->getRecord(),$kind,$data['body'],(int)$data['expected'])));
        }
        $actions[]=Action::make('retryEmail')->label('Submit pending / failed mail')->color('warning')
            ->visible(fn (): bool => $this->getRecord()->events()->whereIn('email_status',['pending','failed'])->exists())
            ->schema([Select::make('event_id')->required()->options(fn (): array => $this->getRecord()->events()->whereIn('email_status',['pending','failed'])->orderBy('id')->get()->mapWithKeys(fn ($e)=>[$e->id=>'#'.$e->id.' '.$e->kind.' ('.$e->email_status.')'])->all())])
            ->requiresConfirmation()->modalDescription('An SMTP timeout can happen after acceptance. Retry may duplicate mail. Older replies cannot be sent after a newer reply was submitted.')
            ->action(fn (array $data) => $this->perform(fn () => app(ContactDelivery::class)->retry(auth('web')->user(),$this->getRecord(),(int)$data['event_id'])));
        $actions[]=Action::make('recoverEmail')->label('Review interrupted mail')->color('gray')
            ->visible(fn (): bool => $this->getRecord()->events()->where('email_status','sending')->where('email_claimed_at','<=',now()->subMinutes(10))->exists())
            ->schema([Select::make('event_id')->required()->options(fn (): array => $this->getRecord()->events()->where('email_status','sending')->where('email_claimed_at','<=',now()->subMinutes(10))->get()->mapWithKeys(fn ($e)=>[$e->id=>'#'.$e->id.' '.$e->kind])->all()),Textarea::make('note')->required()->minLength(3)->maxLength(2000)])
            ->requiresConfirmation()->modalDescription('Review server logs and confirm no send is still running. Mark for review only; no automatic resend. A later retry can duplicate accepted mail.')
            ->action(fn (array $data) => $this->perform(fn () => app(ContactDelivery::class)->recover(auth('web')->user(),$this->getRecord(),(int)$data['event_id'],$data['note'])));
        return $actions;
    }
}

<?php
namespace App\Filament\Resources\Team\Pages;
use App\Filament\Resources\Team\StaffUserResource;
use App\Services\StaffTeamManager;
use App\Support\StaffTeamAccess;
use Filament\Actions\Action;
use Filament\Forms\Components\{Hidden,Textarea};
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;
class EditStaff extends EditRecord
{
    protected static string $resource=StaffUserResource::class;
    protected ?bool $hasDatabaseTransactions=false;
    protected function mutateFormDataBeforeFill(array $data): array { $data['expected_snapshot']=app(StaffTeamManager::class)->fingerprint($this->record); $data['reason']=null; return $data; }
    protected function handleRecordUpdate(Model $record,array $data): Model { return app(StaffTeamManager::class)->change(auth('web')->user(),$record,'role',$data,'data.'); }
    protected function afterSave(): void { $this->record=$this->record->fresh(); $this->form->fill($this->mutateFormDataBeforeFill($this->record->attributesToArray())); }
    private function perform(string $operation,array $data): void
    {
        try { $this->record=app(StaffTeamManager::class)->change(auth('web')->user(),$this->getRecord(),$operation,$data); }
        catch (ValidationException $e) { $p=$this->getMountedActionSchema()?->getStatePath(); throw ValidationException::withMessages(collect($e->errors())->mapWithKeys(fn ($v,$k)=>[($p?$p.'.':'').$k=>$v])->all()); }
        $this->form->fill($this->mutateFormDataBeforeFill($this->record->attributesToArray())); Notification::make()->title('Staff access updated; account and history retained')->success()->send();
    }
    protected function getHeaderActions(): array
    {
        $actions=[];
        foreach (['deactivate'=>'Deactivate staff access','reactivate'=>'Reactivate staff access'] as $operation=>$label) {
            $actions[]=Action::make($operation)->label($label)->color($operation==='deactivate'?'danger':'success')
                ->visible(fn (): bool => StaffTeamAccess::editable(auth('web')->user(),$this->getRecord()) && ((bool)$this->getRecord()->fresh()->is_admin === ($operation==='deactivate')))
                ->fillForm(fn (): array => ['expected_snapshot'=>app(StaffTeamManager::class)->fingerprint($this->getRecord()->fresh())])
                ->schema([Hidden::make('expected_snapshot'),Textarea::make('reason')->required()->minLength(3)->maxLength(500)])
                ->requiresConfirmation()->modalDescription($operation==='deactivate'?'Revoke staff access and database sessions? Account, personal storefront access, orders and history remain. This is not permanent deletion.':'Restore staff access using existing verified credentials? Review the account first; no new password or verification is issued.')
                ->action(fn (array $data)=>$this->perform($operation,$data));
        }
        return $actions;
    }
}

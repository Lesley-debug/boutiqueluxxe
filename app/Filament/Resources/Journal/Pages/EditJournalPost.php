<?php
namespace App\Filament\Resources\Journal\Pages;
use App\Filament\Resources\Journal\JournalPostResource;
use App\Services\StaffContentEditor;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
class EditJournalPost extends EditRecord
{
    protected static string $resource=JournalPostResource::class;
    protected ?bool $hasDatabaseTransactions=false;

    protected function mutateFormDataBeforeFill(array $data): array { $data['expected_snapshot']=app(StaffContentEditor::class)->fingerprint($this->record); $data['content']=app(\App\Services\ContentSafety::class)->html((string)($data['content'] ?? '')); return $data; }
    protected function handleRecordUpdate(Model $record,array $data): Model { return app(StaffContentEditor::class)->save(auth('web')->user(),\App\Models\JournalPost::class,$data,$record,'data.'); }
    protected function afterSave(): void { $this->record=$this->record->fresh(); $this->form->fill($this->mutateFormDataBeforeFill($this->record->attributesToArray())); }
    protected function getHeaderActions(): array { return [\Filament\Actions\Action::make('preview_cover_image')->label('View current cover image')->visible(fn (): bool => (bool)$this->getRecord()->cover_image)->url(fn (): string => $this->getRecord()->cover_image_url ?? '#')->openUrlInNewTab(),\Filament\Actions\Action::make('viewPublic')->label('View published article')->visible(fn (): bool => $this->getRecord()->status==='published' && (bool)$this->getRecord()->published_at)->url(fn (): string => route('journal.show',$this->getRecord()->slug))->openUrlInNewTab()]; }
}

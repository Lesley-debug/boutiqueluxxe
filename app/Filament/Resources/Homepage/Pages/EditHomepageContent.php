<?php
namespace App\Filament\Resources\Homepage\Pages;
use App\Filament\Resources\Homepage\HomepageContentResource;
use App\Services\StaffContentEditor;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
class EditHomepageContent extends EditRecord
{
    protected static string $resource=HomepageContentResource::class;
    protected ?bool $hasDatabaseTransactions=false;
    public function mount(int | string $record=1): void { \Illuminate\Support\Facades\Gate::authorize('viewAny',\App\Models\HomepageContent::class); \App\Models\HomepageContent::unguarded(fn () => \App\Models\HomepageContent::current()); parent::mount(1); }
    protected function mutateFormDataBeforeFill(array $data): array { $data['expected_snapshot']=app(StaffContentEditor::class)->fingerprint($this->record);  return $data; }
    protected function handleRecordUpdate(Model $record,array $data): Model { return app(StaffContentEditor::class)->save(auth('web')->user(),\App\Models\HomepageContent::class,$data,$record,'data.'); }
    protected function afterSave(): void { $this->record=$this->record->fresh(); $this->form->fill($this->mutateFormDataBeforeFill($this->record->attributesToArray())); }
    protected function getHeaderActions(): array { return [\Filament\Actions\ActionGroup::make([\Filament\Actions\Action::make('preview_editorial_image')->label('View current editorial image')->visible(fn (): bool => (bool)$this->getRecord()->editorial_image)->url(fn (): string => $this->getRecord()->editorial_image_url ?? '#')->openUrlInNewTab(),\Filament\Actions\Action::make('preview_editorial_video')->label('View current editorial video')->visible(fn (): bool => (bool)$this->getRecord()->editorial_video)->url(fn (): string => $this->getRecord()->editorial_video_url ?? '#')->openUrlInNewTab(),\Filament\Actions\Action::make('preview_watches_image')->label('View current watches image')->visible(fn (): bool => (bool)$this->getRecord()->watches_image)->url(fn (): string => $this->getRecord()->watches_image_url ?? '#')->openUrlInNewTab(),\Filament\Actions\Action::make('preview_watches_video')->label('View current watches video')->visible(fn (): bool => (bool)$this->getRecord()->watches_video)->url(fn (): string => $this->getRecord()->watches_video_url ?? '#')->openUrlInNewTab(),\Filament\Actions\Action::make('preview_story_image')->label('View current story image')->visible(fn (): bool => (bool)$this->getRecord()->story_image)->url(fn (): string => $this->getRecord()->story_image_url ?? '#')->openUrlInNewTab()])->label('Current media')->button(),\Filament\Actions\Action::make('viewPublic')->label('View public page')->url(url('/'))->openUrlInNewTab()]; }
}

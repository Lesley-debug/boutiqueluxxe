<?php
namespace App\Filament\Resources\About\Pages;
use App\Filament\Resources\About\AboutPageResource;
use App\Services\StaffContentEditor;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
class EditAboutPage extends EditRecord
{
    protected static string $resource=AboutPageResource::class;
    protected ?bool $hasDatabaseTransactions=false;
    public function mount(int | string $record=1): void { \Illuminate\Support\Facades\Gate::authorize('viewAny',\App\Models\AboutPage::class); \App\Models\AboutPage::unguarded(fn () => \App\Models\AboutPage::current()); parent::mount(1); }
    protected function mutateFormDataBeforeFill(array $data): array { $data['expected_snapshot']=app(StaffContentEditor::class)->fingerprint($this->record);  return $data; }
    protected function handleRecordUpdate(Model $record,array $data): Model { return app(StaffContentEditor::class)->save(auth('web')->user(),\App\Models\AboutPage::class,$data,$record,'data.'); }
    protected function afterSave(): void { $this->record=$this->record->fresh(); $this->form->fill($this->mutateFormDataBeforeFill($this->record->attributesToArray())); }
    protected function getHeaderActions(): array { return [\Filament\Actions\Action::make('preview_hero_image')->label('View current hero image')->visible(fn (): bool => (bool)$this->getRecord()->hero_image)->url(fn (): string => $this->getRecord()->hero_image_url ?? '#')->openUrlInNewTab(),\Filament\Actions\Action::make('viewPublic')->label('View public page')->url(url('/about'))->openUrlInNewTab()]; }
}

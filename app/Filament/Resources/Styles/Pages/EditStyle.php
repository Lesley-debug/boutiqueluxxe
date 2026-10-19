<?php

namespace App\Filament\Resources\Styles\Pages;

use App\Filament\Resources\Styles\StyleResource;
use App\Services\StaffStyleEditor;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class EditStyle extends EditRecord
{
    protected static string $resource = StyleResource::class;
    protected ?bool $hasDatabaseTransactions = false;

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        return app(StaffStyleEditor::class)->save(auth('web')->user(), $data, $record, 'data.');
    }

    protected function afterSave(): void
    {
        // Refresh the saved style name without changing its URL or existing image.
        $this->record = $this->record->fresh();
        $this->form->fill($this->mutateFormDataBeforeFill($this->record->attributesToArray()));
    }

    protected function getHeaderActions(): array
    {
        return []; // No destructive delete actions.
    }
}

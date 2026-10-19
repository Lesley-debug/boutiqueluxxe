<?php

namespace App\Filament\Resources\Styles\Pages;

use App\Filament\Resources\Styles\StyleResource;
use App\Services\StaffStyleEditor;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateStyle extends CreateRecord
{
    protected static string $resource = StyleResource::class;
    protected static bool $canCreateAnother = false;
    protected ?bool $hasDatabaseTransactions = false;

    protected function handleRecordCreation(array $data): Model
    {
        return app(StaffStyleEditor::class)->save(auth('web')->user(), $data, prefix: 'data.');
    }

    protected function getRedirectUrl(): string
    {
        return static::getResource()::getUrl('edit', ['record' => $this->record], panel: 'staff');
    }
}

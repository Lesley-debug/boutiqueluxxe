<?php
namespace App\Filament\Resources\Collections\Pages;
use App\Filament\Resources\Collections\CollectionResource;
use App\Services\StaffCatalogOrganizer;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
class CreateCollection extends CreateRecord
{
    protected static string $resource = CollectionResource::class;
    protected static bool $canCreateAnother = false;
    protected ?bool $hasDatabaseTransactions = false;
    protected function handleRecordCreation(array $data): Model { return app(StaffCatalogOrganizer::class)->collection(auth('web')->user(), $data, prefix: 'data.'); }
    protected function getRedirectUrl(): string { return static::getResource()::getUrl('edit',['record'=>$this->record],panel:'staff'); }
}

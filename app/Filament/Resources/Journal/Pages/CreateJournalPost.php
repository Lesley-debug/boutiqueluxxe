<?php
namespace App\Filament\Resources\Journal\Pages;
use App\Filament\Resources\Journal\JournalPostResource;
use App\Services\StaffContentEditor;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
class CreateJournalPost extends CreateRecord
{
    protected static string $resource=JournalPostResource::class;
    protected static bool $canCreateAnother=false;
    protected ?bool $hasDatabaseTransactions=false;
    protected function handleRecordCreation(array $data): Model { return app(StaffContentEditor::class)->save(auth('web')->user(),\App\Models\JournalPost::class,$data,prefix:'data.'); }
    protected function getRedirectUrl(): string { return static::getResource()::getUrl('edit',['record'=>$this->record],panel:'staff'); }
}

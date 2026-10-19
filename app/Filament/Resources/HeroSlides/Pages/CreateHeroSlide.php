<?php
namespace App\Filament\Resources\HeroSlides\Pages;
use App\Filament\Resources\HeroSlides\HeroSlideResource;
use App\Services\StaffContentEditor;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
class CreateHeroSlide extends CreateRecord
{
    protected static string $resource=HeroSlideResource::class;
    protected static bool $canCreateAnother=false;
    protected ?bool $hasDatabaseTransactions=false;
    protected function handleRecordCreation(array $data): Model { return app(StaffContentEditor::class)->save(auth('web')->user(),\App\Models\HeroSlide::class,$data,prefix:'data.'); }
    protected function getRedirectUrl(): string { return static::getResource()::getUrl('edit',['record'=>$this->record],panel:'staff'); }
}

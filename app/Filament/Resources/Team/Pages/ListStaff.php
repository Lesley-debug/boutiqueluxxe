<?php
namespace App\Filament\Resources\Team\Pages;
use App\Filament\Resources\Team\StaffUserResource;
use App\Support\StaffTeamAccess;
use Filament\Resources\Pages\ListRecords;
class ListStaff extends ListRecords
{
    protected static string $resource=StaffUserResource::class;
    protected function authorizeAccess(): void { StaffTeamAccess::authorize(auth('web')->user()); }
    public function hydrate(): void { $this->authorizeAccess(); }
    protected function getHeaderActions(): array { return []; }
}

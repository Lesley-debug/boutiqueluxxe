<?php

namespace App\Filament\Pages;

use App\Models\User;
use Filament\Pages\Dashboard;

class StaffDashboard extends Dashboard
{
    protected static ?string $navigationLabel = 'Store overview';

    public static function canAccess(): bool
    {
        $user = auth('web')->user();

        return $user instanceof User && $user->canAccessStaffPanel();
    }

    public function getTitle(): string
    {
        return 'Store overview';
    }

    public function getColumns(): int | array
    {
        return 1;
    }
}

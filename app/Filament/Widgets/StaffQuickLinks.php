<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Widgets\Widget;

class StaffQuickLinks extends Widget
{
    protected static ?int $sort = 2;
    protected static bool $isLazy = false;
    protected string $view = 'filament.widgets.staff-quick-links';
    protected int | string | array $columnSpan = 'full';

    public static function canView(): bool
    {
        $user = auth('web')->user();

        return $user instanceof User && $user->canAccessStaffPanel();
    }

    public function links(): array
    {
        $user = auth('web')->user();
        $current = $user instanceof User ? $user->fresh() : null;
        abort_unless($current instanceof User && $current->canAccessStaffPanel(), 403);

        $links = [
            ['label' => 'Products', 'path' => '/staff/products', 'permission' => 'products.manage'],
            ['label' => 'Styles', 'path' => '/staff/styles', 'permission' => 'products.manage'],
            ['label' => 'Categories', 'path' => '/admin/categories', 'permission' => 'products.manage'],
            ['label' => 'Collections', 'path' => '/admin/collections', 'permission' => 'products.manage'],
            ['label' => 'Orders', 'path' => '/admin/orders', 'permission' => 'orders.manage'],
            ['label' => 'Customers', 'path' => '/admin/customers', 'permission' => 'customers.view'],
            ['label' => 'Discounts', 'path' => '/admin/discounts', 'permission' => 'discounts.manage'],
            ['label' => 'Homepage content', 'path' => '/admin/homepage', 'permission' => 'products.manage'],
            ['label' => 'Journal', 'path' => '/admin/journal', 'permission' => 'products.manage'],
            ['label' => 'Notifications', 'path' => '/admin/notifications', 'permission' => 'notifications.view'],
            ['label' => 'Admin team', 'path' => '/admin/users', 'permission' => 'admins.manage'],
        ];

        return array_values(array_filter($links, fn (array $link): bool => $current->hasPermission($link['permission'])));
    }
}

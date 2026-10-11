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
            ['label' => 'Categories', 'path' => '/staff/categories', 'permission' => 'products.manage'],
            ['label' => 'Collections', 'path' => '/staff/collections', 'permission' => 'products.manage'],
            ['label' => 'Orders', 'path' => '/staff/orders', 'permission' => 'orders.manage'],
            ['label' => 'Contact messages', 'path' => '/staff/contacts', 'permission' => 'contacts.manage'],
            ['label' => 'Discounts', 'path' => '/staff/discounts', 'permission' => 'discounts.manage'],
            ['label' => 'Homepage content', 'path' => '/staff/homepage', 'permission' => 'products.manage'],
            ['label' => 'Hero slides', 'path' => '/staff/hero-slides', 'permission' => 'products.manage'],
            ['label' => 'About page', 'path' => '/staff/about', 'permission' => 'products.manage'],
            ['label' => 'Testimonials', 'path' => '/staff/testimonials', 'permission' => 'products.manage'],
            ['label' => 'Journal', 'path' => '/staff/journal', 'permission' => 'products.manage'],
            ['label' => 'Notifications', 'path' => '/admin/notifications', 'permission' => 'notifications.view'],
            ['label' => 'Staff & Managers', 'path' => '/staff/team', 'permission' => 'admins.manage'],
        ];

        return array_values(array_filter($links, fn (array $link): bool => $link['permission']==='admins.manage' ? \App\Support\StaffTeamAccess::allows($current) : $current->hasPermission($link['permission'])));
    }
}

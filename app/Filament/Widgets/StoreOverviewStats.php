<?php

namespace App\Filament\Widgets;

use App\Models\User;
use App\Services\StaffDashboardSummary;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StoreOverviewStats extends StatsOverviewWidget
{
    protected static ?int $sort = 1;
    protected static bool $isLazy = false;
    protected ?string $pollingInterval = null;
    protected ?string $heading = 'Business at a glance';
    protected ?string $description = 'Order values are not confirmed revenue. Refresh this page for the latest figures.';
    protected int | array | null $columns = ['default' => 1, '@md' => 2, '@xl' => 4];

    public static function canView(): bool
    {
        $user = auth('web')->user();

        return $user instanceof User && $user->canAccessStaffPanel();
    }

    protected function getStats(): array
    {
        $user = auth('web')->user();
        abort_unless($user instanceof User && $user->canAccessStaffPanel(), 403);
        $summary = app(StaffDashboardSummary::class)->forUser($user);
        $stats = [];
        $money = fn (string $value): string => config('commerce.currency', 'USD').' '.number_format((float) $value, 2);

        if (array_key_exists('pending_orders', $summary)) {
            $stats[] = Stat::make('Awaiting staff', $summary['pending_orders'])
                ->description('Pending orders across all dates')->color('warning');
            $stats[] = Stat::make('Order value this month', $money($summary['order_value_this_month']))
                ->description('Non-cancelled orders placed this month; includes unpaid reservations');
            $stats[] = Stat::make('Marked-paid order value', $money($summary['marked_paid_order_value_this_month']))
                ->description('Orders placed this month and marked paid; not a payment-receipt ledger')->color('success');
        }

        if (array_key_exists('low_stock_variants', $summary)) {
            $stats[] = Stat::make('Low-stock variants', $summary['low_stock_variants'])
                ->description('Active products with 5 or fewer units per variant')->color('warning');
        }

        return $stats;
    }
}

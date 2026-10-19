<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;

final class StaffDashboardSummary
{
    public function forUser(User $user): array
    {
        $current = $user->fresh();
        abort_unless($current instanceof User && $current->canAccessStaffPanel(), 403);
        $summary = [];

        if ($current->hasPermission('orders.manage')) {
            $monthStart = now()->startOfMonth();
            $ordersThisMonth = Order::query()
                ->where('created_at', '>=', $monthStart)
                ->where('status', '!=', 'cancelled');

            $summary['pending_orders'] = Order::query()->where('status', 'pending')->count();
            $summary['order_value_this_month'] = (string) (clone $ordersThisMonth)->sum('total');
            $summary['marked_paid_order_value_this_month'] = (string) (clone $ordersThisMonth)
                ->where('payment_status', 'paid')->sum('total');
        }

        if ($current->hasPermission('products.manage')) {
            $summary['low_stock_variants'] = ProductVariant::query()
                ->whereHas('product', fn ($query) => $query->where('status', 'active'))
                ->where('stock_quantity', '<=', 5)
                ->count();
        }

        return $summary;
    }
}

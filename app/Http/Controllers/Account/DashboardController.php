<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\UserActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $orders = $user->orders();
        $ordersCount = (clone $orders)->count();
        $addressesCount = $user->addresses()->count();
        $profileCompletion = 35
            + ($user->hasVerifiedEmail() ? 25 : 0)
            + ($addressesCount > 0 ? 20 : 0)
            + ($ordersCount > 0 ? 20 : 0);

        return Inertia::render('Account/Dashboard', [
            'stats' => [
                'orders_count' => $ordersCount,
                'active_orders_count' => (clone $orders)
                    ->whereIn('status', ['pending', 'processing', 'shipped'])
                    ->count(),
                'wishlist_count' => $user->wishlistItems()->count(),
                'addresses_count' => $addressesCount,
                'unread_notifications_count' => $user->unreadNotifications()->count(),
                'total_spent' => (float) (clone $orders)
                    ->where('status', '!=', 'cancelled')
                    ->sum('total'),
            ],
            'profileCompletion' => min(100, $profileCompletion),
            'account' => [
                'member_since' => $user->created_at?->toIso8601String(),
                'email_verified' => $user->hasVerifiedEmail(),
            ],
            'recentOrders' => $user->orders()
                ->latest()
                ->limit(4)
                ->get(['id', 'order_number', 'status', 'total', 'created_at']),
            'recentNotifications' => $user->notifications()
                ->latest()
                ->limit(4)
                ->get(['id', 'data', 'read_at', 'created_at']),
            'recentActivity' => UserActivityLog::query()
                ->where('user_id', $user->id)
                ->latest()
                ->limit(4)
                ->get(['id', 'activity_type', 'description', 'created_at']),
        ]);
    }
}

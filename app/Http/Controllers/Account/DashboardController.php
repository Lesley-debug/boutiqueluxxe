<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Account/Dashboard', [
            'stats' => [
                'orders_count' => $user->orders()->count(),
                'wishlist_count' => $user->wishlistItems()->count(),
                'addresses_count' => $user->addresses()->count(),
            ],
            'recentOrders' => $user->orders()->latest()->limit(3)->get(['id', 'order_number', 'status', 'total', 'created_at']),
        ]);
    }
}

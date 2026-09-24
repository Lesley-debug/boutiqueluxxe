<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function confirmation(string $orderNumber)
    {
        $order = Order::with('items')->where('order_number', $orderNumber)->firstOrFail();

        $isOwner = Auth::check() && $order->user_id === Auth::id();
        $isRecentGuestOrder = in_array($order->id, session('guest_order_ids', []), true);

        abort_unless($isOwner || $isRecentGuestOrder, 403);

        return Inertia::render('Store/OrderConfirmation', [
            'order' => $order,
        ]);
    }
}

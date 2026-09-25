<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function confirmation(Request $request, string $orderNumber)
    {
        $order = Order::with('items')->where('order_number', $orderNumber)->firstOrFail();

        $isOwner = Auth::check() && $order->user_id === Auth::id();
        $isRecentGuestOrder = in_array($order->id, session('guest_order_ids', []), true);
        $hasValidGuestSignature = $request->hasValidSignature(absolute: false);

        abort_unless($isOwner || $isRecentGuestOrder || $hasValidGuestSignature, 403);

        return Inertia::render('Store/OrderConfirmation', [
            'order' => $order,
        ]);
    }
}

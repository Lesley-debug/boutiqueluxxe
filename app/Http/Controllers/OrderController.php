<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function confirmation(string $orderNumber)
    {
        $order = Order::with('items')->where('order_number', $orderNumber)->firstOrFail();

        return Inertia::render('Store/OrderConfirmation', [
            'order' => $order,
            'paymentInstructions' => config('payment_instructions'),
        ]);
    }

    public function updatePaymentStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'payment_status' => ['required', 'in:pending,paid'],
        ]);

        $order->update(['payment_status' => $data['payment_status']]);

        return back()->with('success', 'Payment status updated.');
    }
}

<?php

namespace App\Notifications;

use App\Models\Order;
use App\Support\Money;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderPlacedNotification extends Notification
{
    use Queueable;

    public function __construct(public Order $order)
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Order Placed Successfully',
            'message' => "Your order #{$this->order->order_number} has been placed. Total: ".Money::format($this->order->total),
            'url' => "/account/orders/{$this->order->order_number}",
            'icon' => 'order_placed',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
        ];
    }
}

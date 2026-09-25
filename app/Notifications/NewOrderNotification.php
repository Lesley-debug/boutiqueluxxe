<?php

namespace App\Notifications;

use App\Models\Order;
use App\Support\Money;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class NewOrderNotification extends Notification
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type' => 'new_order',
            'order_id' => $this->order->id,
            'message' => "New order {$this->order->order_number} from {$this->order->customer_name} — ".Money::format($this->order->total),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("New Order: {$this->order->order_number}")
            ->line("A new order has been placed by {$this->order->customer_name}.")
            ->line('Total: '.Money::format($this->order->total))
            ->action('View Order', url("/admin/orders/{$this->order->id}"));
    }
}

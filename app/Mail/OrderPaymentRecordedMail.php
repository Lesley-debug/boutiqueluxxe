<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class OrderPaymentRecordedMail extends Mailable
{
    public function __construct(public Order $order) {}
    public function envelope(): Envelope { return new Envelope(subject: "Order {$this->order->order_number} — Payment Record Updated"); }
    public function content(): Content { return new Content(markdown: 'emails.orders.payment-recorded', with: ['confirmationUrl' => $this->order->guestConfirmationUrl()]); }
}

<x-mail::message>
# Payment Record Update

The payment record for your order **{{ $order->order_number }}** has been marked **{{ ucfirst($order->payment_status) }}** by our staff.

This message reflects our order record. It does not mean an automatic charge or refund was performed. Please contact Boutique Luxxe if you have questions.

<x-mail::button :url="$confirmationUrl">
View Order
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>

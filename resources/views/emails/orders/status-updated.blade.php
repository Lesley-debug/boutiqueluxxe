<x-mail::message>
    # Order Update

    Your order **{{ $order->order_number }}** status has been updated to **{{ ucfirst($order->status) }}**.

    <x-mail::button :url="$confirmationUrl">
        View Order
    </x-mail::button>

    Thanks,<br>
    {{ config('app.name') }}
</x-mail::message>
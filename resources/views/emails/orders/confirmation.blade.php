<x-mail::message>
    # Thank you, {{ $order->customer_name }}!

    Your order **{{ $order->order_number }}** has been placed.

    <x-mail::table>
        | Item | Qty | Total |
        | :--- | :-: | ----: |
        @foreach ($order->items as $item)
        | {{ $item->product_name }}{{ $item->variant_label ? " ({$item->variant_label})" : '' }} | {{ $item->quantity }} | {{ number_format((float) $item->line_total) }} FCFA |
        @endforeach
    </x-mail::table>

    **Total: {{ number_format((float) $order->total) }} FCFA**

    Shipping to: {{ $order->shipping_address }}, {{ $order->city }}

    <x-mail::button :url="$confirmationUrl">
        View Order
    </x-mail::button>

    Thanks,<br>
    {{ config('app.name') }}
</x-mail::message>